'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Edit3, Loader2, MessageCircle, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface UserActionsData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  kycStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  city?: string | null;
  state?: string | null;
  headline?: string | null;
  bio?: string | null;
}

export function UserActions({
  user,
  inline = false,
  redirectAfterDelete,
}: {
  user: UserActionsData;
  inline?: boolean;
  redirectAfterDelete?: string;
}) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);

  const phoneClean = user.phone?.replace(/\D/g, '');
  const whatsappUrl = phoneClean
    ? `https://wa.me/${phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`}`
    : null;

  const containerClass = inline
    ? 'inline-flex items-center gap-1'
    : 'flex flex-wrap items-center gap-2';

  return (
    <>
      <div className={containerClass}>
        {whatsappUrl ? (
          <Button
            asChild
            size={inline ? 'icon' : 'sm'}
            variant="outline"
            className={inline ? 'h-9 w-9' : ''}
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              {inline ? null : <span>WhatsApp</span>}
            </a>
          </Button>
        ) : null}

        <Button
          size={inline ? 'icon' : 'sm'}
          variant="outline"
          className={inline ? 'h-9 w-9' : ''}
          onClick={() => setMsgOpen(true)}
          aria-label="Enviar mensagem interna"
          title="Enviar mensagem interna"
        >
          <Bell className="h-4 w-4 text-zello-600" />
          {inline ? null : <span>Notificar</span>}
        </Button>

        <Button
          size={inline ? 'icon' : 'sm'}
          variant="outline"
          className={inline ? 'h-9 w-9' : ''}
          onClick={() => setEditOpen(true)}
          aria-label="Editar usuário"
          title="Editar usuário"
        >
          <Edit3 className="h-4 w-4" />
          {inline ? null : <span>Editar</span>}
        </Button>

        <Button
          size={inline ? 'icon' : 'sm'}
          variant="outline"
          className={cn(
            'border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive',
            inline ? 'h-9 w-9' : '',
          )}
          onClick={async () => {
            if (
              !confirm(
                `Excluir ${user.name}? A conta será marcada como DELETED (soft-delete). Você não pode reverter pela UI.`,
              )
            )
              return;
            try {
              const res = await fetch(`/api/admin/usuarios/${user.id}`, { method: 'DELETE' });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error ?? 'Erro');
              toast.success('Usuário excluído');
              if (redirectAfterDelete) router.push(redirectAfterDelete);
              else router.refresh();
            } catch (err) {
              toast.error('Erro ao excluir', {
                description: err instanceof Error ? err.message : 'Tente novamente.',
              });
            }
          }}
          aria-label="Excluir"
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
          {inline ? null : <span>Excluir</span>}
        </Button>

        {inline ? (
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="h-9 w-9 lg:hidden" aria-label="Mais ações">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-8 pt-8">
              <h3 className="mb-3 font-semibold">{user.name}</h3>
              <div className="grid gap-2">
                {whatsappUrl ? (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      Abrir WhatsApp
                    </a>
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setOpenMenu(false);
                    setMsgOpen(true);
                  }}
                >
                  <Bell className="h-4 w-4 text-zello-600" />
                  Enviar notificação
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setOpenMenu(false);
                    setEditOpen(true);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        ) : null}
      </div>

      <NotifySheet open={msgOpen} onOpenChange={setMsgOpen} userId={user.id} userName={user.name} />
      <EditSheet open={editOpen} onOpenChange={setEditOpen} user={user} onSaved={() => router.refresh()} />
    </>
  );
}

function NotifySheet({
  open,
  onOpenChange,
  userId,
  userName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  userName: string;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (title.length < 2 || body.length < 2) {
      toast.error('Preencha título e mensagem');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}/notificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      toast.success('Notificação enviada');
      setTitle('');
      setBody('');
      onOpenChange(false);
    } catch (err) {
      toast.error('Não foi possível enviar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md pt-12">
        <h2 className="text-lg font-semibold">Mensagem interna</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          para <strong>{userName}</strong>. Aparece nas notificações dele.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notify-title">Título</Label>
            <Input
              id="notify-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Atualização da plataforma"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notify-body">Mensagem</Label>
            <Textarea
              id="notify-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escreva o conteúdo da notificação..."
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{body.length}/2000</p>
          </div>
          <Button onClick={submit} disabled={busy} size="lg" className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Enviar notificação
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EditSheet({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserActionsData;
  onSaved: () => void;
}) {
  const [data, setData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
    status: user.status,
    kycStatus: user.kycStatus,
    city: user.city ?? '',
    state: user.state ?? '',
    headline: user.headline ?? '',
    bio: user.bio ?? '',
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? 'Erro');
      toast.success('Usuário atualizado');
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error('Erro ao salvar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto pt-12">
        <h2 className="text-lg font-semibold">Editar usuário</h2>
        <p className="mt-1 text-sm text-muted-foreground">{user.name}</p>

        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ed-name">Nome</Label>
              <Input
                id="ed-name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-email">Email</Label>
              <Input
                id="ed-email"
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-phone">Telefone</Label>
              <Input
                id="ed-phone"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-role">Role</Label>
              <select
                id="ed-role"
                value={data.role}
                onChange={(e) => setData({ ...data, role: e.target.value as typeof data.role })}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="CLIENT">CLIENT</option>
                <option value="PROFESSIONAL">PROFESSIONAL</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-status">Status</Label>
              <select
                id="ed-status"
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value as typeof data.status })}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="DELETED">DELETED</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-kyc">KYC</Label>
              <select
                id="ed-kyc"
                value={data.kycStatus}
                onChange={(e) =>
                  setData({ ...data, kycStatus: e.target.value as typeof data.kycStatus })
                }
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="PENDING">PENDING</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-city">Cidade</Label>
              <Input
                id="ed-city"
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ed-state">UF</Label>
              <Input
                id="ed-state"
                maxLength={2}
                value={data.state}
                onChange={(e) => setData({ ...data, state: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          {user.role !== 'CLIENT' ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="ed-headline">Headline profissional</Label>
                <Input
                  id="ed-headline"
                  value={data.headline}
                  onChange={(e) => setData({ ...data, headline: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ed-bio">Bio</Label>
                <Textarea
                  id="ed-bio"
                  rows={4}
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                />
              </div>
            </>
          ) : null}

          <Button onClick={submit} disabled={busy} size="lg" className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Salvar alterações
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
