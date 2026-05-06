'use client';

import * as React from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { Input } from './input';
import { formatCep } from '@/lib/format';
import { useCep, type CepResult } from '@/lib/use-cep';
import { cn } from '@/lib/utils';

export interface CepInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value?: string;
  onChange?: (rawValue: string) => void;
  onResolved?: (result: CepResult) => void;
}

export const CepInput = React.forwardRef<HTMLInputElement, CepInputProps>(
  ({ value = '', onChange, onResolved, className, ...props }, ref) => {
    const { lookup, loading } = useCep();
    const display = formatCep(value);

    const handleBlur = async () => {
      const digits = value.replace(/\D/g, '');
      if (digits.length === 8) {
        const result = await lookup(digits);
        if (result && onResolved) onResolved(result);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          placeholder="00000-000"
          maxLength={9}
          autoComplete="postal-code"
          value={display}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            onChange?.(raw);
            if (raw.length === 8) {
              lookup(raw).then((result) => {
                if (result && onResolved) onResolved(result);
              });
            }
          }}
          onBlur={handleBlur}
          className={cn('pr-10', className)}
          {...props}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </span>
      </div>
    );
  },
);
CepInput.displayName = 'CepInput';
