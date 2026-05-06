'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Eye, Inbox, Loader2, MapPin, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { formatBRL } from '@/lib/pricing';

interface BookingItem {
  id: string;
  reference: string;
  status: string;
  scheduledAt: string;
  durationMin: number;
  locationMode: string;
  totalAmount: number;
  netToProvider: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  client: { id: string; name: string; phone: string | null; email: string };
  address: string | null;
}

export function ServiceBookingsButton({
  serviceId,
  serviceTitle,
}: {
  serviceId: string;
  serviceTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || bookings) return;
    setLoading(true);
    fetch(`/api/admin/servicos/${serviceId}/bookings`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [open, serviceId, bookings]);

  const totals = bookings
    ? {
        qty: bookings.length,
        value: bookings.reduce((s, b) => s + b.totalAmount, 0),
        net: bookings.reduce((s, b) => s + b.netToProvider, 0),
      }
    : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="h-3.5 w-3.5" />
          Ver
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto pt-12">
        <h2 className="text-lg font-semibold">{serviceTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Todas as compras desse serviço (excluindo pendentes de pagamento).
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : bookings && bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhuma compra registrada.</p>
          </div>
        ) : bookings ? (
          <>
            <div className="mt-4 grid gap-3 rounded-2xl bg-secondary/40 p-4 text-sm sm:grid-cols-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total
                </div>
                <div className="font-semibold">{totals!.qty} compras</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Bruto
                </div>
                <div className="font-semibold text-zello-600">{formatBRL(totals!.value)}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Líquido (pro)
                </div>
                <div className="font-semibold">{formatBRL(totals!.net)}</div>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {bookings.map((b) => {
                const phoneClean = b.client.phone?.replace(/\D/g, '');
                const wa = phoneClean
                  ? `https://wa.me/${phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`}`
                  : null;
                return (
                  <li key={b.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{b.status}</Badge>
                          <code className="text-[10px] text-muted-foreground">{b.reference}</code>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-zello-600" />
                          <Link
                            href={`/admin/usuarios/${b.client.id}`}
                            className="font-semibold hover:underline"
                          >
                            {b.client.name}
                          </Link>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(b.scheduledAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          · {b.durationMin} min
                        </div>
                        {b.address ? (
                          <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{b.address}</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-zello-600">{formatBRL(b.totalAmount)}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {b.paymentMethod ?? '—'} · {b.paymentStatus ?? '—'}
                        </div>
                        {wa ? (
                          <Button asChild size="sm" variant="outline" className="mt-2 h-8">
                            <a href={wa} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-3 w-3 text-emerald-600" />
                              Contato
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
