'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false },
);
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    setM(true);
  }, []);
  return m;
}

export function BookingsAreaChart({
  data,
}: {
  data: { date: string; count: number; gmv: number }[];
}) {
  const mounted = useMounted();
  const formatted = data.map((d) => ({ ...d, label: shortDate(d.date) }));

  if (!mounted) {
    return <div className="h-[260px] animate-pulse rounded-lg bg-secondary/40" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="zelloFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d36f5" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#1d36f5" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#1d36f5"
          strokeWidth={2}
          fill="url(#zelloFill)"
          name="Reservas"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoriesBarChart({
  data,
}: {
  data: { name: string; bookings: number; gmv: number }[];
}) {
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-[260px] animate-pulse rounded-lg bg-secondary/40" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="bookings" fill="#1d36f5" radius={[8, 8, 0, 0]} name="Reservas" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { gmv?: number } }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]!;
  const gmv = item?.payload?.gmv;
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {item.value} {item.name?.toLowerCase() ?? 'reservas'}
      </p>
      {typeof gmv === 'number' && gmv > 0 ? (
        <p className="text-xs text-muted-foreground">
          GMV: R$ {gmv.toFixed(2).replace('.', ',')}
        </p>
      ) : null}
    </div>
  );
}

function shortDate(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}
