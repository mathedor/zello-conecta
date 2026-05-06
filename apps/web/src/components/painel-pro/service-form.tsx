'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  serviceCreateSchema,
  type ServiceCreateInput,
  PRICE_MODE_LABELS,
  LOCATION_MODE_LABELS,
} from '@/lib/service-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PhotoUploader } from './photo-uploader';

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
}

export type ServiceFormInitial = Partial<
  Omit<ServiceCreateInput, 'photos' | 'categoryId'>
> & {
  id?: string;
  photos?: string[];
  categoryId?: string | null;
};

export function ServiceForm({ initial }: { initial?: ServiceFormInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [suggestNew, setSuggestNew] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceCreateInput>({
    resolver: zodResolver(serviceCreateSchema),
    defaultValues: {
      title: initial?.title ?? '',
      description: initial?.description ?? '',
      priceMode: initial?.priceMode ?? 'HOURLY',
      price: initial?.price ?? 0,
      durationMin: initial?.durationMin ?? 60,
      locationMode: initial?.locationMode ?? 'BOTH',
      active: initial?.active ?? true,
      categoryId: initial?.categoryId ?? null,
      newCategoryName: '',
      photos: initial?.photos ?? [],
    },
  });

  useEffect(() => {
    fetch('/api/categorias')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setValue('photos', photos, { shouldValidate: true });
  }, [photos, setValue]);

  const categoryId = watch('categoryId');

  const onSubmit = async (values: ServiceCreateInput) => {
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/servicos/${initial!.id}` : '/api/servicos';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao salvar');
      toast.success(isEdit ? 'Serviço atualizado!' : 'Serviço criado!');
      router.push('/painel-pro/servicos');
      router.refresh();
    } catch (err) {
      toast.error('Não foi possível salvar', {
        description: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold uppercase tracking-wider text-zello-600">
          Informações principais
        </legend>

        <div className="space-y-2">
          <Label htmlFor="title">Título do serviço</Label>
          <Input
            id="title"
            placeholder="Ex: Consultoria jurídica trabalhista"
            aria-invalid={!!errors.title}
            {...register('title')}
          />
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            rows={5}
            placeholder="Descreva o serviço com detalhes: o que está incluído, o que esperar, requisitos..."
            aria-invalid={!!errors.description}
            {...register('description')}
          />
          {errors.description ? (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <select
            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            value={suggestNew ? '__new__' : (categoryId ?? '')}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__new__') {
                setSuggestNew(true);
                setValue('categoryId', null);
              } else {
                setSuggestNew(false);
                setValue('categoryId', v || null, { shouldValidate: true });
                setValue('newCategoryName', '');
              }
            }}
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="__new__">+ Sugerir nova categoria</option>
          </select>
          {suggestNew ? (
            <Input
              placeholder="Nome da nova categoria (será revisada pelo admin)"
              {...register('newCategoryName')}
            />
          ) : null}
          {errors.categoryId ? (
            <p className="text-xs text-destructive">{errors.categoryId.message}</p>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold uppercase tracking-wider text-zello-600">
          Preço e duração
        </legend>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="priceMode">Cobrança</Label>
            <select
              id="priceMode"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              {...register('priceMode')}
            >
              {Object.entries(PRICE_MODE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              aria-invalid={!!errors.price}
              {...register('price')}
            />
            {errors.price ? (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMin">Duração (minutos)</Label>
            <Input
              id="durationMin"
              type="number"
              min="15"
              step="15"
              inputMode="numeric"
              aria-invalid={!!errors.durationMin}
              {...register('durationMin')}
            />
            {errors.durationMin ? (
              <p className="text-xs text-destructive">{errors.durationMin.message}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold uppercase tracking-wider text-zello-600">
          Local de atendimento
        </legend>
        <select
          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
          {...register('locationMode')}
        >
          {Object.entries(LOCATION_MODE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Você poderá configurar adicional de deslocamento no seu perfil.
        </p>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold uppercase tracking-wider text-zello-600">
          Galeria de fotos
        </legend>
        <PhotoUploader value={photos} onChange={setPhotos} />
      </fieldset>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
        <label className="inline-flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-zello-600"
            {...register('active')}
          />
          <span>Visível nas buscas</span>
        </label>

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEdit ? 'Salvar alterações' : 'Criar serviço'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
