'use client';

import * as React from 'react';
import { Input } from './input';
import { formatPhone } from '@/lib/format';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value?: string;
  onChange?: (rawValue: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, ...props }, ref) => {
    const display = formatPhone(value);
    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(11) 99999-9999"
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '');
          onChange?.(raw);
        }}
        {...props}
      />
    );
  },
);
PhoneInput.displayName = 'PhoneInput';
