import { AlertTriangle, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useSignalR } from '../../context/useSignalR';
import { PriorityBadge, SentimentBadge, TypeBadge } from './Badges';

export function RealtimeToast({ onSelectTicket }: { onSelectTicket?: (trackingNumber: string) => void }) {
  const { latestToast, dismissToast } = useSignalR();

  useEffect(() => {
    if (!latestToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 8000);
    return () => clearTimeout(timer);
  }, [latestToast, dismissToast]);

  if (!latestToast) return null;

  const isCritical = latestToast.priority === 'High' || latestToast.sentiment === 'Negative';

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 max-w-md animate-slide-in-right rounded-xl border border-brand-wine/30 bg-white p-4 shadow-2xl ring-1 ring-black/5"
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid size-10 shrink-0 place-items-center rounded-lg ${
            isCritical ? 'bg-brand-wine text-white' : 'bg-brand-light/60 text-brand-wine'
          }`}
        >
          {isCritical ? <AlertTriangle size={20} className="animate-pulse" /> : <CheckCircle2 size={20} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-wine">
              {isCritical ? 'Alerta Crítica SignalR' : 'Nueva Solicitud Radicada'}
            </p>
            <button
              onClick={dismissToast}
              className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Cerrar notificación"
            >
              <X size={15} />
            </button>
          </div>
          <p className="mt-1 font-mono text-xs font-semibold text-stone-800">{latestToast.trackingNumber}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600">{latestToast.summary}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <TypeBadge type={latestToast.type} />
            <PriorityBadge priority={latestToast.priority} />
            <SentimentBadge sentiment={latestToast.sentiment} />
          </div>
          {onSelectTicket && (
            <button
              onClick={() => {
                onSelectTicket(latestToast.trackingNumber);
                dismissToast();
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-wine hover:underline"
            >
              Ver detalles de PQRS <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
