import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Search, UsersRound } from 'lucide-react';
import { prisma, type Prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Usuários' };

interface PageProps {
  searchParams: Promise<{
    q?: string;
    role?: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN' | string;
    kyc?: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function AdminUsuariosPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/painel');

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const where: Prisma.UserWhereInput = {};
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: 'insensitive' } },
      { email: { contains: sp.q, mode: 'insensitive' } },
      { cpf: { contains: sp.q.replace(/\D/g, '') } },
    ];
  }
  if (sp.role && ['CLIENT', 'PROFESSIONAL', 'ADMIN'].includes(sp.role)) {
    where.role = sp.role as 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
  }
  if (sp.kyc && ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(sp.kyc)) {
    where.kycStatus = sp.kyc as 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { professional: { select: { id: true, slug: true, totalCompleted: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DashboardShell
      title="Usuários"
      description={`${total} cadastro(s).`}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Voltar ao painel</Link>
        </Button>
      }
    >
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <form className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={sp.q ?? ''}
                placeholder="Nome, email ou CPF..."
                className="pl-10"
              />
            </div>
            <select
              name="role"
              defaultValue={sp.role ?? ''}
              className="flex h-11 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos os papéis</option>
              <option value="CLIENT">Clientes</option>
              <option value="PROFESSIONAL">Profissionais</option>
              <option value="ADMIN">Admins</option>
            </select>
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
          {users.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <UsersRound className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum usuário com esses filtros.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {users.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/admin/usuarios/${u.id}`}
                    className="flex flex-col gap-3 p-5 transition-colors hover:bg-secondary/40 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zello-600 text-sm font-semibold text-white">
                      {u.name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{u.name}</p>
                        <Badge variant="outline">{u.role}</Badge>
                        <Badge
                          variant={
                            u.kycStatus === 'APPROVED'
                              ? 'success'
                              : u.kycStatus === 'REJECTED'
                                ? 'outline'
                                : 'soft'
                          }
                        >
                          KYC {u.kycStatus}
                        </Badge>
                        {u.status !== 'ACTIVE' ? (
                          <Badge variant="outline">{u.status}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {u.email}
                        {u.professional?.totalCompleted
                          ? ` · ${u.professional.totalCompleted} contratações`
                          : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {u.createdAt.toLocaleDateString('pt-BR')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/admin/usuarios?${new URLSearchParams({
                  ...(sp.q ? { q: sp.q } : {}),
                  ...(sp.role ? { role: sp.role } : {}),
                  ...(sp.kyc ? { kyc: sp.kyc } : {}),
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
                href={`/admin/usuarios?${new URLSearchParams({
                  ...(sp.q ? { q: sp.q } : {}),
                  ...(sp.role ? { role: sp.role } : {}),
                  ...(sp.kyc ? { kyc: sp.kyc } : {}),
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
