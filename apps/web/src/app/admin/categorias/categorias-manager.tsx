'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Edit3, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconName: string | null;
  approved: boolean;
  serviceCount: number;
  suggestedBy: string | null;
  createdAt: string;
}

export function CategoriasManager({ initial }: { initial: CategoryItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const toggleApproved = async (id: string, approved: boolean) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/categorias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) throw new Error();
      toast.success(approved ? 'Categoria aprovada' : 'Categoria oculta');
      router.refresh();
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: CategoryItem) => {
    if (item.serviceCount > 0) {
      toast.error(`Esta categoria tem ${item.serviceCount} serviço(s) — não pode ser excluída`);
      return;
    }
    if (!confirm(`Excluir "${item.name}"? Esta ação não pode ser desfeita.`)) return;
    setBusy(item.id);
    try {
      const res = await fetch(`/api/admin/categorias/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      toast.success('Categoria excluída');
      router.refresh();
    } catch (err) {
      toast.error('Não foi possível excluir', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-border p-4">
        <p className="text-sm text-muted-foreground">{initial.length} categorias</p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nome
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Slug
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Serviços
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initial.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/30">
                <td className="px-3 py-3">
                  <div className="font-medium">{c.name}</div>
                  {c.description ? (
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {c.description}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-3 font-mono text-xs">{c.slug}</td>
                <td className="px-3 py-3">
                  {c.approved ? (
                    <Badge variant="success">Aprovada</Badge>
                  ) : (
                    <Badge variant="outline">Sugerida</Badge>
                  )}
                </td>
                <td className="px-3 py-3 text-xs">{c.serviceCount}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {!c.approved ? (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => toggleApproved(c.id, true)}
                        disabled={busy === c.id}
                        title="Aprovar"
                        className="h-9 w-9"
                      >
                        {busy === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        )}
                      </Button>
                    ) : null}
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setEditing(c)}
                      title="Editar"
                      className="h-9 w-9"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => remove(c)}
                      disabled={busy === c.id}
                      title="Excluir"
                      className="h-9 w-9 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CategoryFormSheet
        open={creating}
        onOpenChange={setCreating}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      {editing ? (
        <CategoryFormSheet
          open
          onOpenChange={(v) => !v && setEditing(null)}
          item={editing}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}

function CategoryFormSheet({
  open,
  onOpenChange,
  item,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item?: CategoryItem;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [iconName, setIconName] = useState(item?.iconName ?? '');
  const [approved, setApproved] = useState(item?.approved ?? true);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) {
      toast.error('Nome obrigatório');
      return;
    }
    setBusy(true);
    try {
      const url = item ? `/api/admin/categorias/${item.id}` : '/api/admin/categorias';
      const method = item ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, iconName, approved }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro');
      toast.success(item ? 'Categoria atualizada' : 'Categoria criada');
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
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto pt-12">
        <h2 className="text-lg font-semibold">{item ? 'Editar categoria' : 'Nova categoria'}</h2>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Nome</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Descrição</Label>
            <Input
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-icon">Ícone (slug Lucide)</Label>
            <Input
              id="cat-icon"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="ex: scale, hammer, palette"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-zello-600"
              checked={approved}
              onChange={(e) => setApproved(e.target.checked)}
            />
            <span className="text-sm">Aprovada (visível nas buscas)</span>
          </label>
          <Button onClick={submit} disabled={busy} size="lg" className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Salvar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
