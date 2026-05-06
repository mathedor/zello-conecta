import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  Wallet,
} from 'lucide-react';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBRL } from '@/lib/pricing';
import { UserActions } from '@/components/admin/user-actions';

export const metadata = { title: 'Usuário' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUsuarioPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      professional: {
        include: {
          _count: { select: { services: true, bookings: true } },
        },
      },
      address: true,
      documents: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!user) notFound();

  const [
    bookingsAsClient,
    bookingsAsPro,
    paymentsCount,
    reviewsByUser,
    disputes,
    withdrawTickets,
    activityCount,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { service: { select: { title: true } }, professional: { include: { user: { select: { name: true } } } } },
    }),
    user.professional
      ? prisma.booking.findMany({
          where: { professionalId: user.professional.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { service: { select: { title: true } }, client: { select: { name: true } } },
        })
      : Promise.resolve([]),
    prisma.payment.count({ where: { booking: { clientId: id } } }),
    prisma.review.findMany({
      where: { authorId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { booking: { select: { service: { select: { title: true } } } } },
    }),
    prisma.dispute.findMany({
      where: { OR: [{ openedById: id }, { booking: { clientId: id } }] },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    user.professional
      ? prisma.withdrawTicket.findMany({
          where: { professionalId: user.professional.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
        })
      : Promise.resolve([]),
    prisma.activityLog.count({ where: { userId: id } }),
  ]);

  const initials = user.name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <DashboardShell
      title={user.name}
      description={`${user.role} · cadastrado em ${user.createdAt.toLocaleDateString('pt-BR')}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <UserActions
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              status: user.status,
              kycStatus: user.kycStatus,
              city: user.professional?.city ?? null,
              state: user.professional?.state ?? null,
              headline: user.professional?.headline ?? null,
              bio: user.professional?.bio ?? null,
            }}
            redirectAfterDelete="/admin/usuarios"
          />
          {user.professional?.slug ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/profissional/${user.professional.slug}`} target="_blank">
                Ver perfil público
              </Link>
            </Button>
          ) : null}
        </div>
      }
    >
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zello-600 text-2xl font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{user.role}</Badge>
              <Badge
                variant={
                  user.kycStatus === 'APPROVED'
                    ? 'success'
                    : user.kycStatus === 'REJECTED'
                      ? 'outline'
                      : 'soft'
                }
              >
                KYC {user.kycStatus}
              </Badge>
              <Badge variant={user.status === 'ACTIVE' ? 'success' : 'outline'}>{user.status}</Badge>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <Field icon={Mail} label="Email" value={user.email} />
              {user.phone ? <Field icon={Phone} label="Telefone" value={user.phone} /> : null}
              {user.cpf ? <Field icon={Shield} label="CPF" value={user.cpf} /> : null}
              {user.cnpj ? <Field icon={Shield} label="CNPJ" value={user.cnpj} /> : null}
              {user.professional?.city ? (
                <Field
                  icon={MapPin}
                  label="Cidade"
                  value={`${user.professional.city}${user.professional.state ? ` / ${user.professional.state}` : ''}`}
                />
              ) : null}
              {user.professional?.headline ? (
                <Field icon={Briefcase} label="Headline" value={user.professional.headline} />
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBox icon={Calendar} label="Reservas (cliente)" value={bookingsAsClient.length.toString()} />
        <StatBox icon={Briefcase} label="Pedidos (profissional)" value={bookingsAsPro.length.toString()} />
        <StatBox icon={CreditCard} label="Pagamentos" value={paymentsCount.toString()} />
        {user.professional ? (
          <StatBox
            icon={Wallet}
            label="Saldo disponível"
            value={formatBRL(Number(user.professional.balanceAvailable))}
          />
        ) : (
          <StatBox icon={Star} label="Avaliações dadas" value={reviewsByUser.length.toString()} />
        )}
      </div>

      {user.professional ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Estatísticas do profissional</h2>
            <div className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">Avaliação média</div>
                <div className="mt-1 flex items-center gap-1.5 text-2xl font-bold">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  {user.professional.averageRating
                    ? Number(user.professional.averageRating).toFixed(2)
                    : '—'}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({user.professional.totalReviews})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Contratações concluídas</div>
                <div className="mt-1 text-2xl font-bold">{user.professional.totalCompleted}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total ganho</div>
                <div className="mt-1 text-2xl font-bold text-zello-600">
                  {formatBRL(Number(user.professional.totalEarned))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Em retenção</div>
                <div className="mt-1 font-medium">
                  {formatBRL(Number(user.professional.balancePending))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Disponível para saque</div>
                <div className="mt-1 font-medium text-emerald-700">
                  {formatBRL(Number(user.professional.balanceAvailable))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Serviços ativos</div>
                <div className="mt-1 font-medium">{user.professional._count.services}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">Reservas como cliente</h2>
            {bookingsAsClient.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma reserva.</p>
            ) : (
              <ul className="divide-y divide-border">
                {bookingsAsClient.map((b) => (
                  <li key={b.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-medium">{b.service.title}</p>
                      <Badge variant="outline">{b.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      com {b.professional.user.name} · {b.scheduledAt.toLocaleDateString('pt-BR')} ·{' '}
                      {formatBRL(Number(b.totalAmount))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {user.professional ? (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-base font-semibold">Pedidos como profissional</h2>
              {bookingsAsPro.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum pedido.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {bookingsAsPro.map((b) => (
                    <li key={b.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-medium">{b.service.title}</p>
                        <Badge variant="outline">{b.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        cliente: {b.client.name} · {b.scheduledAt.toLocaleDateString('pt-BR')} ·{' '}
                        {formatBRL(Number(b.totalAmount))}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ) : null}

        {user.documents.length > 0 ? (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-base font-semibold">Documentos KYC</h2>
              <ul className="space-y-2 text-sm">
                {user.documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{d.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.createdAt.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          d.status === 'APPROVED'
                            ? 'success'
                            : d.status === 'REJECTED'
                              ? 'outline'
                              : 'soft'
                        }
                      >
                        {d.status}
                      </Badge>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-zello-600 hover:underline"
                      >
                        Abrir
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {withdrawTickets.length > 0 ? (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-base font-semibold">Tickets de saque</h2>
              <ul className="divide-y divide-border">
                {withdrawTickets.map((t) => (
                  <li key={t.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{formatBRL(Number(t.amount))}</span>
                      <Badge variant="outline">{t.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.createdAt.toLocaleDateString('pt-BR')} · {t.pixKey}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {disputes.length > 0 ? (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-base font-semibold">Disputas</h2>
              <ul className="divide-y divide-border">
                {disputes.map((d) => (
                  <li key={d.id} className="py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{d.status}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {d.createdAt.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.reason}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {reviewsByUser.length > 0 ? (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-base font-semibold">Avaliações dadas</h2>
              <ul className="divide-y divide-border">
                {reviewsByUser.map((r) => (
                  <li key={r.id} className="py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{r.rating}/5</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {r.booking.service.title}
                      </span>
                    </div>
                    {r.comment ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.comment}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="mb-2 text-base font-semibold">Auditoria</h2>
          <p className="text-sm text-muted-foreground">
            <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600" />
            {activityCount} eventos registrados na ActivityLog deste usuário.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zello-600" />
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="break-all text-sm">{value}</div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-4 w-4 text-zello-600" />
          {label}
        </div>
        <div className="mt-1.5 text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
