'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function BookingsAreaChart({
  data,
}: {
  data: { date: string; count: number; gmv: number }[];
}) {
  const formatted = data.map((d) => ({ ...d, label: shortDate(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="zelloFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d36f5" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#1d36f5" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="label"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
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
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
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
