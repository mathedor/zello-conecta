import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Briefcase, Search, Star } from 'lucide-react';
import { prisma, type Prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserActions } from '@/components/admin/user-actions';
import { SortableTh } from '@/components/admin/sortable-th';
import { formatBRL } from '@/lib/pricing';

export const metadata = { title: 'Profissionais' };

interface PageProps {
  searchParams: Promise<{
    q?: string;
    kyc?: string;
    sort?: string;
    dir?: 'asc' | 'desc' | string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function AdminProfissionaisPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  const where: Prisma.ProfessionalWhereInput = {};
  if (sp.q) {
    where.OR = [
      { user: { name: { contains: sp.q, mode: 'insensitive' } } },
      { user: { email: { contains: sp.q, mode: 'insensitive' } } },
      { city: { contains: sp.q, mode: 'insensitive' } },
      { headline: { contains: sp.q, mode: 'insensitive' } },
    ];
  }
  if (sp.kyc && ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(sp.kyc)) {
    where.user = { ...(where.user as object), kycStatus: sp.kyc as 'APPROVED' };
  }

  const sortField = sp.sort ?? 'createdAt';
  const sortDir = sp.dir === 'asc' ? 'asc' : 'desc';
  const orderBy: Prisma.ProfessionalOrderByWithRelationInput =
    sortField === 'rating'
      ? { averageRating: sortDir }
      : sortField === 'completed'
        ? { totalCompleted: sortDir }
        : sortField === 'earned'
          ? { totalEarned: sortDir }
          : { createdAt: sortDir };

  const [total, pros] = await Promise.all([
    prisma.professional.count({ where }),
    prisma.professional.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true, status: true, kycStatus: true } },
        services: {
          select: { category: { select: { name: true } } },
          take: 3,
        },
        _count: { select: { services: true, bookings: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const basePath = '/admin/profissionais';

  return (
    <DashboardShell title="Profissionais" description={`${total} profissional(is) cadastrado(s).`}>
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <form className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={sp.q ?? ''}
                placeholder="Nome, email, cidade ou especialidade..."
                className="pl-10"
              />
            </div>
            <select
              name="kyc"
              defaultValue={sp.kyc ?? ''}
              className="flex h-11 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Qualquer KYC</option>
              <option value="PENDING">Pendente</option>
              <option value="SUBMITTED">Em análise</option>
              <option value="APPROVED">Aprovado</option>
              <option value="REJECTED">Rejeitado</option>
            </select>
            <Button type="submit">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {pros.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum profissional encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-cards">
                <thead className="border-b border-border bg-secondary/40">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Profissional
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cidade
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Categorias
                    </th>
                    <SortableTh field="rating" label="Nota" basePath={basePath} />
                    <SortableTh field="completed" label="Contratações" basePath={basePath} />
                    <SortableTh field="earned" label="Faturado" basePath={basePath} />
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      KYC
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pros.map((p) => {
                    const initials = p.user.name
                      .split(' ')
                      .map((s) => s[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();
                    const cats = p.services
                      .map((s) => s.category?.name)
                      .filter((n): n is string => Boolean(n));
                    return (
                      <tr key={p.id} className="hover:bg-secondary/30">
                        <td className="px-3 py-3">
                          <Link href={`/admin/usuarios/${p.user.id}`} className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zello-600 text-xs font-semibold text-white">
                              {initials}
                            </span>
                            <span className="min-w-0">
                              <p className="truncate font-medium">{p.user.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {p.headline ?? p.user.email}
                              </p>
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {p.city ? (
                            <span>
                              {p.city}
                              {p.state ? `/${p.state}` : ''}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {cats.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Array.from(new Set(cats)).slice(0, 2).map((c, i) => (
                                <Badge key={i} variant="soft" className="text-[10px]">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs">
                          {p.averageRating ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {Number(p.averageRating).toFixed(1)}{' '}
                              <span className="text-muted-foreground">({p.totalReviews})</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs">{p.totalCompleted}</td>
                        <td className="px-3 py-3 text-xs">{formatBRL(Number(p.totalEarned))}</td>
                        <td className="px-3 py-3 text-xs">
                          <Badge
                            variant={
                              p.user.kycStatus === 'APPROVED'
                                ? 'success'
                                : p.user.kycStatus === 'REJECTED'
                                  ? 'outline'
                                  : 'soft'
                            }
                          >
                            {p.user.kycStatus}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <UserActions
                            inline
                            user={{
                              id: p.user.id,
                              name: p.user.name,
                              email: p.user.email,
                              phone: p.user.phone,
                              role: p.user.role,
                              status: p.user.status,
                              kycStatus: p.user.kycStatus,
                              city: p.city,
                              state: p.state,
                              headline: p.headline,
                              bio: p.bio,
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`${basePath}?${new URLSearchParams({
                  ...(sp.q ? { q: sp.q } : {}),
                  ...(sp.kyc ? { kyc: sp.kyc } : {}),
                  ...(sp.sort ? { sort: sp.sort } : {}),
                  ...(sp.dir ? { dir: sp.dir } : {}),
                  page: String(page - 1),
                }).toString()}`}
              >
                Anterior
              </Link>
            </Button>
          ) : null}
          <span className="px-3 text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`${basePath}?${new URLSearchParams({
                  ...(sp.q ? { q: sp.q } : {}),
                  ...(sp.kyc ? { kyc: sp.kyc } : {}),
                  ...(sp.sort ? { sort: sp.sort } : {}),
                  ...(sp.dir ? { dir: sp.dir } : {}),
                  page: String(page + 1),
                }).toString()}`}
              >
                Próxima
              </Link>
            </Button>
          ) : null}
        </nav>
      ) : null}
    </DashboardShell>
  );
}
