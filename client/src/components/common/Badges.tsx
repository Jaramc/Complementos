import type { TicketPriority, TicketSentiment, TicketStatus, TicketType } from '../../types';
import { cn } from '../../utils/cn';
import { normalizePriority, normalizeSentiment, normalizeTicketStatus, normalizeTicketType } from '../../utils/normalizers';

export function TypeBadge({ type, className }: { type: TicketType | number | string; className?: string }) {
  const typeStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    Peticion: { label: 'Petición', bg: 'bg-brand-light/40', text: 'text-stone-800', border: 'border-brand-accent/40' },
    Queja: { label: 'Queja', bg: 'bg-brand-olive/20', text: 'text-stone-900', border: 'border-brand-olive/40' },
    Reclamo: { label: 'Reclamo', bg: 'bg-brand-wine/10', text: 'text-brand-wine', border: 'border-brand-wine/30' },
    Sugerencia: { label: 'Sugerencia', bg: 'bg-brand-earth/15', text: 'text-brand-earth', border: 'border-brand-earth/30' },
  };

  const normalized = normalizeTicketType(type);
  const style = typeStyles[normalized] || typeStyles.Peticion;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style.bg,
        style.text,
        style.border,
        className,
      )}
    >
      {style.label}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: TicketStatus | number | string; className?: string }) {
  const statusStyles: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    Pending: { label: 'Pendiente', dot: 'bg-brand-olive', bg: 'bg-brand-olive/15', text: 'text-stone-800' },
    InProgress: { label: 'En Progreso', dot: 'bg-brand-accent', bg: 'bg-brand-accent/20', text: 'text-stone-900' },
    Resolved: { label: 'Resuelto', dot: 'bg-brand-light', bg: 'bg-brand-light/50', text: 'text-stone-800' },
    Closed: { label: 'Cerrado', dot: 'bg-stone-400', bg: 'bg-stone-100', text: 'text-stone-600' },
  };

  const normalized = normalizeTicketStatus(status);
  const style = statusStyles[normalized] || statusStyles.Pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: TicketPriority | number | string; className?: string }) {
  const priorityStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    High: { label: 'Alta', bg: 'bg-brand-wine/10', text: 'text-brand-wine font-semibold', border: 'border-brand-wine/30' },
    Medium: { label: 'Media', bg: 'bg-brand-olive/20', text: 'text-stone-800', border: 'border-brand-olive/40' },
    Low: { label: 'Baja', bg: 'bg-brand-light/40', text: 'text-stone-700', border: 'border-brand-accent/30' },
  };

  const normalized = normalizePriority(priority);
  const style = priorityStyles[normalized] || priorityStyles.Medium;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style.bg,
        style.text,
        style.border,
        className,
      )}
    >
      {style.label}
    </span>
  );
}

export function SentimentBadge({ sentiment, className }: { sentiment: TicketSentiment | number | string; className?: string }) {
  const sentimentStyles: Record<string, { label: string; bg: string; text: string; border: string; icon: string }> = {
    Negative: { label: 'Negativo', bg: 'bg-brand-wine/10', text: 'text-brand-wine font-semibold', border: 'border-brand-wine/30', icon: '🔴' },
    Neutral: { label: 'Neutral', bg: 'bg-brand-olive/15', text: 'text-stone-800', border: 'border-brand-olive/30', icon: '🟡' },
    Positive: { label: 'Positivo', bg: 'bg-brand-light/50', text: 'text-stone-800', border: 'border-brand-accent/40', icon: '🟢' },
  };

  const normalized = normalizeSentiment(sentiment);
  const style = sentimentStyles[normalized] || sentimentStyles.Neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style.bg,
        style.text,
        style.border,
        className,
      )}
    >
      <span className="text-[10px]">{style.icon}</span>
      {style.label}
    </span>
  );
}
