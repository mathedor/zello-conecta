'use client';

import { Label } from './label';
import { Input } from './input';
import { CepInput } from './cep-input';

export interface AddressData {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  reference?: string;
}

export function AddressFields({
  value,
  onChange,
  errors,
  showReference,
}: {
  value: AddressData;
  onChange: (next: AddressData) => void;
  errors?: Partial<Record<keyof AddressData, string>>;
  showReference?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="addr-cep">CEP</Label>
          <CepInput
            id="addr-cep"
            value={value.zipCode}
            onChange={(v) => onChange({ ...value, zipCode: v })}
            onResolved={(r) =>
              onChange({
                ...value,
                zipCode: r.cep,
                street: r.street,
                district: r.district,
                city: r.city,
                state: r.state,
                complement: r.complement || value.complement,
              })
            }
          />
          {errors?.zipCode ? (
            <p className="text-xs text-destructive">{errors.zipCode}</p>
          ) : null}
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="addr-street">Logradouro</Label>
          <Input
            id="addr-street"
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            placeholder="Rua, avenida..."
          />
          {errors?.street ? <p className="text-xs text-destructive">{errors.street}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="addr-number">Número</Label>
          <Input
            id="addr-number"
            value={value.number}
            onChange={(e) => onChange({ ...value, number: e.target.value })}
            placeholder="123"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="addr-complement">Complemento</Label>
          <Input
            id="addr-complement"
            value={value.complement}
            onChange={(e) => onChange({ ...value, complement: e.target.value })}
            placeholder="Apto, bloco..."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="addr-district">Bairro</Label>
          <Input
            id="addr-district"
            value={value.district}
            onChange={(e) => onChange({ ...value, district: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addr-city">Cidade</Label>
          <Input
            id="addr-city"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
          />
          {errors?.city ? <p className="text-xs text-destructive">{errors.city}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addr-state">UF</Label>
          <Input
            id="addr-state"
            value={value.state}
            maxLength={2}
            onChange={(e) => onChange({ ...value, state: e.target.value.toUpperCase() })}
          />
          {errors?.state ? <p className="text-xs text-destructive">{errors.state}</p> : null}
        </div>
      </div>

      {showReference ? (
        <div className="space-y-1.5">
          <Label htmlFor="addr-reference">Ponto de referência (opcional)</Label>
          <Input
            id="addr-reference"
            value={value.reference ?? ''}
            onChange={(e) => onChange({ ...value, reference: e.target.value })}
            placeholder="Ex: próximo ao mercado X"
          />
        </div>
      ) : null}
    </div>
  );
}
