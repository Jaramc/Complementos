import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  Inbox,
  Sparkles,
  Ticket,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../api/client';
import { PriorityBadge, StatusBadge, TypeBadge } from '../components/common/Badges';
import { CardSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/useAuth';
import { useSignalR } from '../context/useSignalR';
import type { Ticket as TicketTypeModel } from '../types';
import { normalizePriority, normalizeSentiment, normalizeTicketStatus, normalizeTicketType } from '../utils/normalizers';

export function DashboardPage() {
  const { user } = useAuth();
  const { alerts } = useSignalR();
  const [tickets, setTickets] = useState<TicketTypeModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ticketsApi
      .list()
      .then((data) => setTickets(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [alerts]);

  const totalTickets = tickets.length;
  const criticalTickets = tickets.filter((t) => normalizePriority(t.priority) === 'High' || normalizeSentiment(t.sentiment) === 'Negative').length;
  const resolvedTickets = tickets.filter((t) => ['Resolved', 'Closed'].includes(normalizeTicketStatus(t.status))).length;
  const inProgressTickets = tickets.filter((t) => normalizeTicketStatus(t.status) === 'InProgress').length;
  const pendingTickets = tickets.filter((t) => normalizeTicketStatus(t.status) === 'Pending').length;

  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-earth">
            <span>Operaciones Multi-Tenant</span>
            <span>•</span>
            <span className="text-stone-400">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
            Bienvenido, {user?.email?.split('@')[0] || 'Agente'}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Panel de supervisión general, triaje automático con IA y notificaciones en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-wine px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-wine-dark"
          >
            <Ticket size={16} /> Abrir Cola de PQRS
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-brand-earth/15 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-light/50 text-brand-wine">
                <Inbox size={20} />
              </span>
              <span className="text-xs font-bold text-brand-wine flex items-center gap-1">
                <TrendingUp size={13} /> Activo
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Tickets en Cola</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">{totalTickets}</p>
            <p className="mt-2 text-xs text-stone-400">
              <span className="font-semibold text-brand-earth">{pendingTickets} pendientes</span> sin atender
            </p>
          </div>

          <div className="rounded-2xl border border-brand-wine/25 bg-brand-wine/5 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-wine text-white">
                <AlertTriangle size={20} />
              </span>
              <span className="rounded-full bg-brand-wine/20 px-2 py-0.5 text-[10px] font-bold text-brand-wine uppercase tracking-wider">
                Urgente
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold text-brand-wine uppercase tracking-wider">Casos Críticos / Alta</p>
            <p className="mt-1 text-3xl font-bold text-brand-wine">{criticalTickets}</p>
            <p className="mt-2 text-xs text-brand-wine/80 font-medium">Prioridad alta o sentimiento negativo</p>
          </div>

          <div className="rounded-2xl border border-brand-earth/15 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-accent/30 text-stone-800">
                <Activity size={20} />
              </span>
              <span className="text-xs font-semibold text-stone-400">{inProgressTickets} en proceso</span>
            </div>
            <p className="mt-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Tasa de Resolución</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">{resolutionRate}%</p>
            <p className="mt-2 text-xs text-stone-400">
              <span className="font-semibold text-stone-700">{resolvedTickets} casos</span> resueltos o cerrados
            </p>
          </div>

          <div className="rounded-2xl border border-brand-earth/15 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-olive/20 text-stone-900">
                <Bot size={20} />
              </span>
              <span className="rounded-full bg-brand-light/50 px-2 py-0.5 text-[10px] font-bold text-brand-wine">
                RAG 1536d
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Asistente IA</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">Activo</p>
            <p className="mt-2 text-xs text-stone-400">Triaje LLM y desvíos pgvector</p>
          </div>
        </div>
      )}

      {/* Middle Section: Chart & Highlights */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Activity Trend Chart */}
        <section className="rounded-2xl border border-brand-earth/15 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900">Volumen Semanal de Solicitudes</h2>
                <p className="text-xs text-stone-500 mt-0.5">Distribución de PQRS registradas en los últimos 7 días</p>
              </div>
              <span className="rounded-full bg-brand-light/40 px-3 py-1 text-xs font-semibold text-stone-700">
                Esta Semana
              </span>
            </div>

            {/* Simulated bar chart */}
            <div className="mt-8 flex h-48 items-end gap-3 sm:gap-6 pt-6 px-2">
              {[
                { day: 'Lun', height: 45, count: 12 },
                { day: 'Mar', height: 60, count: 18 },
                { day: 'Mié', height: 50, count: 15 },
                { day: 'Jue', height: 85, count: 26 },
                { day: 'Vie', height: 70, count: 21 },
                { day: 'Sáb', height: 95, count: 32, highlight: true },
                { day: 'Dom', height: 40, count: 10 },
              ].map((bar) => (
                <div key={bar.day} className="flex flex-1 flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-stone-400 opacity-0 group-hover:opacity-100 transition">
                    {bar.count}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      bar.highlight
                        ? 'bg-brand-wine shadow-md'
                        : 'bg-brand-light hover:bg-brand-accent'
                    }`}
                    style={{ height: `${bar.height}%` }}
                  />
                  <span className="text-xs font-semibold text-stone-500">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 text-xs text-stone-500">
            <span>Pico más alto: Sábado (+32 solicitudes)</span>
            <Link to="/tickets" className="font-semibold text-brand-wine hover:underline inline-flex items-center gap-1">
              Ver reporte detallado <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>

        {/* AI Insight Box */}
        <section className="rounded-2xl border border-brand-earth/20 bg-gradient-to-br from-brand-wine to-brand-wine-dark p-6 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-light backdrop-blur-md">
                <Sparkles size={13} /> Diagnóstico Ejecutivo
              </span>
              <span className="size-2 rounded-full bg-brand-light animate-pulse" />
            </div>

            <h3 className="mt-6 text-2xl font-bold leading-tight">
              {criticalTickets > 0
                ? `${criticalTickets} casos requieren atención prioritaria.`
                : 'La cola de solicitudes se encuentra estable.'}
            </h3>

            <p className="mt-3 text-xs leading-relaxed text-white/80">
              El motor de triaje categoriza automáticamente cada caso según urgencia, sentimiento del usuario y temática
              para acelerar los tiempos de primera respuesta.
            </p>
          </div>

          <div className="mt-8 space-y-3 border-t border-white/15 pt-5">
            <Link
              to="/tickets?priority=High"
              className="flex items-center justify-between rounded-xl bg-white/10 p-3 text-xs font-semibold text-white transition hover:bg-white/20 backdrop-blur-xs"
            >
              <span>Filtrar Casos de Prioridad Alta</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/kb"
              className="flex items-center justify-between rounded-xl bg-white/10 p-3 text-xs font-semibold text-white transition hover:bg-white/20 backdrop-blur-xs"
            >
              <span>Administrar Artículos RAG</span>
              <BookOpen size={15} />
            </Link>
          </div>
        </section>
      </div>

      {/* Recent PQRS Queue Preview */}
      <section className="rounded-2xl border border-brand-earth/15 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">Solicitudes Recientes</h2>
            <p className="text-xs text-stone-500">Últimos casos registrados por el widget o la API</p>
          </div>
          <Link
            to="/tickets"
            className="text-xs font-bold text-brand-wine hover:underline inline-flex items-center gap-1"
          >
            Ver todas ({totalTickets}) <ArrowRight size={13} />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No hay solicitudes recientes registradas.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-surface/60 px-3 rounded-xl transition"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-light/60 font-bold text-brand-wine text-xs">
                    <span className="font-semibold">
                      {normalizeTicketType(ticket.type).charAt(0)}
                    </span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-wine">{ticket.trackingNumber}</span>
                      <span className="text-xs font-semibold text-stone-900">{ticket.subject}</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{ticket.customerName} • {ticket.customerEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <TypeBadge type={ticket.type} />
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
