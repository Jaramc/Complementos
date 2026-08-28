import type { TicketPriority, TicketSentiment, TicketStatus, TicketType } from '../../types';
import { cn } from '../../utils/cn';
import { normalizePriority, normalizeSentiment, normalizeTicketStatus, normalizeTicketType } from '../../utils/normalizers';

export function TypeBadge({ type, className }: { type: TicketType | number | string; className?: string }) {
  const typeStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    Peticion: { label: 'Petición', bg: 'bg-brand-sky/20', text: 'text-indigo-900', border: 'border-brand-sky/40' },
    Queja: { label: 'Queja', bg: 'bg-brand-cornflower/20', text: 'text-purple-950', border: 'border-brand-cornflower/40' },
    Reclamo: { label: 'Reclamo', bg: 'bg-brand-lilac/25', text: 'text-brand-wine font-semibold', border: 'border-brand-lilac/50' },
    Sugerencia: { label: 'Sugerencia', bg: 'bg-brand-violet/20', text: 'text-purple-900', border: 'border-brand-violet/40' },
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
    Pending: { label: 'Pendiente', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-900' },
    InProgress: { label: 'En Progreso', dot: 'bg-brand-cornflower', bg: 'bg-brand-cornflower/15', text: 'text-indigo-950' },
    Resolved: { label: 'Resuelto', dot: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-900' },
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
    High: { label: 'Alta', bg: 'bg-brand-lilac/25', text: 'text-brand-wine font-bold', border: 'border-brand-lilac/50' },
    Medium: { label: 'Media', bg: 'bg-brand-cornflower/20', text: 'text-indigo-950 font-medium', border: 'border-brand-cornflower/40' },
    Low: { label: 'Baja', bg: 'bg-brand-sky/20', text: 'text-slate-800', border: 'border-brand-sky/40' },
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
  const sentimentStyles: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    Negative: { label: 'Negativo', bg: 'bg-rose-50', text: 'text-rose-700 font-semibold', border: 'border-rose-200', dot: 'bg-rose-500' },
    Neutral: { label: 'Neutral', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
    Positive: { label: 'Positivo', bg: 'bg-emerald-50', text: 'text-emerald-700 font-semibold', border: 'border-emerald-200', dot: 'bg-emerald-500' },
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
      <span className={cn('size-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  );
}
