import Link from 'next/link';
import { Eye, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickActionsCell({
  view360Href,
  phone,
}: {
  view360Href?: string;
  phone?: string | null;
}) {
  const phoneClean = phone?.replace(/\D/g, '');
  const whatsappUrl = phoneClean
    ? `https://wa.me/${phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`}`
    : null;

  return (
    <div className="inline-flex items-center gap-1">
      {view360Href ? (
        <Button asChild size="icon" variant="outline" className="h-8 w-8" title="Ver detalhes">
          <Link href={view360Href}>
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
      {whatsappUrl ? (
        <Button asChild size="icon" variant="outline" className="h-8 w-8" title="WhatsApp">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
          </a>
        </Button>
      ) : null}
    </div>
  );
}
