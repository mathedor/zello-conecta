export const PLATFORM_FEE_PERCENT = 20;
export const AUTO_RELEASE_HOURS = 48;
export const CURRENCY = 'BRL';

export type AppRole = 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  city?: string;
  state?: string;
  radiusKm?: number;
  lat?: number;
  lng?: number;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  date?: string;
}

export interface MoneyBreakdown {
  servicePrice: number;
  travelFee: number;
  platformFee: number;
  totalAmount: number;
  netToProvider: number;
}

export function calculateBreakdown(
  servicePrice: number,
  travelFee = 0,
  feePercent = PLATFORM_FEE_PERCENT,
): MoneyBreakdown {
  const subtotal = servicePrice + travelFee;
  const totalAmount = subtotal;
  const platformFee = +(totalAmount * (feePercent / 100)).toFixed(2);
  const netToProvider = +(totalAmount - platformFee).toFixed(2);
  return { servicePrice, travelFee, platformFee, totalAmount, netToProvider };
}
