import { Bell, Clock, Inbox, Trash2 } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useSignalR } from '../../context/useSignalR';
import { PriorityBadge, SentimentBadge, TypeBadge } from './Badges';

export function NotificationDropdown({ onSelectTicket }: { onSelectTicket?: (trackingNumber: string) => void }) {
  const { alerts, unreadCount, markAllAsRead, clearAlerts } = useSignalR();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-lg p-2 text-stone-600 transition hover:bg-brand-light/30 hover:text-stone-900"
        aria-label="Ver alertas"
        title="Centro de alertas"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-wine text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-brand-earth/20 bg-white p-4 shadow-xl z-50 animate-fade-in">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-stone-900">Alertas de Triaje IA</p>
              {alerts.length > 0 && (
                <span className="rounded-full bg-brand-light/50 px-2 py-0.5 text-xs font-semibold text-brand-wine">
                  {alerts.length}
                </span>
              )}
            </div>
            {alerts.length > 0 && (
              <button
                onClick={clearAlerts}
                className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-brand-wine transition"
                title="Limpiar alertas"
              >
                <Trash2 size={13} /> Limpiar
              </button>
            )}
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto divide-y divide-stone-100">
            {alerts.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-light/30 text-brand-wine">
                  <Inbox size={22} />
                </div>
                <p className="mt-3 text-xs font-medium text-stone-700">Bandeja de alertas al día</p>
                <p className="mt-1 text-[11px] text-stone-400">
                  Las alertas automáticas por casos críticos llegarán aquí en tiempo real.
                </p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={`${alert.id}-${index}`}
                  onClick={() => {
                    if (onSelectTicket) onSelectTicket(alert.trackingNumber);
                    setIsOpen(false);
                  }}
                  className="cursor-pointer py-3 transition hover:bg-brand-surface/70 px-2 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-stone-800">{alert.trackingNumber}</span>
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock size={11} /> Hace un momento
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-stone-600 leading-relaxed">{alert.summary}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <TypeBadge type={alert.type} />
                    <PriorityBadge priority={alert.priority} />
                    <SentimentBadge sentiment={alert.sentiment} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
