import type { BookingStatus } from '@zello/db';

export const COMPLETED_BOOKING_STATUS: BookingStatus[] = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

export interface DateRange {
  from: Date;
  to: Date;
  fromIso: string;
  toIso: string;
}

export function parseDateRange(sp: { from?: string; to?: string }): DateRange {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  monthAgo.setHours(0, 0, 0, 0);

  const fromCandidate = sp.from ? new Date(sp.from) : monthAgo;
  const toCandidate = sp.to ? new Date(sp.to) : today;

  const from = isNaN(fromCandidate.getTime()) ? monthAgo : fromCandidate;
  const to = isNaN(toCandidate.getTime()) ? today : toCandidate;
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return {
    from,
    to,
    fromIso: from.toISOString().slice(0, 10),
    toIso: to.toISOString().slice(0, 10),
  };
}

export function buildSearchParams(
  current: Record<string, string | undefined>,
  next: Record<string, string | null>,
): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(current).forEach(([k, v]) => {
    if (typeof v === 'string') params.set(k, v);
  });
  Object.entries(next).forEach(([k, v]) => {
    if (v === null || v === '') params.delete(k);
    else params.set(k, v);
  });
  return params;
}
