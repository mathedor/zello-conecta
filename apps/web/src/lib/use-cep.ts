'use client';

import { useCallback, useState } from 'react';

export interface CepResult {
  cep: string;
  street: string;
  district: string;
  city: string;
  state: string;
  complement?: string;
}

export function useCep() {
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (rawCep: string): Promise<CepResult | null> => {
    const cep = rawCep.replace(/\D/g, '');
    if (cep.length !== 8) return null;
    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!res.ok) return null;
      const data = (await res.json()) as {
        cep?: string;
        logradouro?: string;
        complemento?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
        erro?: boolean;
      };
      if (data.erro || !data.cep) return null;
      return {
        cep: data.cep,
        street: data.logradouro ?? '',
        district: data.bairro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
        complement: data.complemento,
      };
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { lookup, loading };
}
