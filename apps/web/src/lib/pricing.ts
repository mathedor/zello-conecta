import { PLATFORM_FEE_PERCENT, calculateBreakdown } from '@zello/types';

export function bookingPricing({
  servicePrice,
  travelFee = 0,
  feePercent = PLATFORM_FEE_PERCENT,
}: {
  servicePrice: number;
  travelFee?: number;
  feePercent?: number;
}) {
  return calculateBreakdown(servicePrice, travelFee, feePercent);
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
