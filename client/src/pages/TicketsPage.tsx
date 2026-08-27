import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Calendar,
  ChevronRight,
  Clock,
  Inbox,
  Mail,
  RefreshCw,
  Search,
  Sparkles,
  Ticket as TicketIcon,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ticketsApi } from '../api/client';
import { PriorityBadge, SentimentBadge, StatusBadge, TypeBadge } from '../components/common/Badges';
import { CardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { useSignalR } from '../context/useSignalR';
import type { Ticket, TicketStatus } from '../types';
import { normalizePriority, normalizeSentiment, normalizeTicketStatus, normalizeTicketType } from '../utils/normalizers';

export function TicketsPage() {
  const [searchParams] = useSearchParams();
  const { alerts } = useSignalR();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Selected Ticket for Drawer
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.list();
      setTickets(data);
    } catch {
      setError('No fue posible cargar la lista de tickets. Revisa tu conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // When search query parameter changes from url
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  // When SignalR receives an alert, refresh tickets silently
  useEffect(() => {
    if (alerts.length > 0) {
      ticketsApi.list().then((data) => {
        setTickets(data);
      }).catch(() => {});
    }
  }, [alerts]);

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    setIsUpdating(true);
    try {
      const updated = await ticketsApi.updateStatus(ticketId, newStatus);
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated);
      }
    } catch {
      alert('Error al actualizar el estado del ticket.');
    } finally {
      setIsUpdating(false);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = tickets.length;
    const critical = tickets.filter((t) => normalizePriority(t.priority) === 'High' || normalizeSentiment(t.sentiment) === 'Negative').length;
    const resolved = tickets.filter((t) => ['Resolved', 'Closed'].includes(normalizeTicketStatus(t.status))).length;
    const positive = tickets.filter((t) => normalizeSentiment(t.sentiment) === 'Positive').length;
    const deflectionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0;

    return { total, critical, resolved, deflectionRate, positiveRate };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        search.trim() === '' ||
        t.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.customerName.toLowerCase().includes(search.toLowerCase()) ||
        t.customerEmail.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || normalizeTicketStatus(t.status) === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || normalizePriority(t.priority) === priorityFilter;
      const matchesType = typeFilter === 'ALL' || normalizeTicketType(t.type) === typeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [tickets, search, statusFilter, priorityFilter, typeFilter]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-earth">
            <TicketIcon size={15} className="text-brand-wine" /> Cola de Operaciones
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Gestión y Triaje de PQRS</h1>
          <p className="mt-1 text-sm text-stone-500">
            Supervisa en tiempo real las solicitudes analizadas automáticamente por los modelos de IA.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-earth/25 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-2xs transition hover:bg-stone-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Actualizar Cola
        </button>
      </div>

      {/* KPI Stat Cards */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-brand-earth/15 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-light/50 text-brand-wine">
                <Inbox size={20} />
              </span>
              <span className="text-xs font-semibold text-stone-400">Total</span>
            </div>
            <p className="mt-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Total PQRS Radicadas</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-brand-wine/25 bg-brand-wine/5 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-wine text-white">
                <AlertTriangle size={20} />
              </span>
              <span className="rounded-full bg-brand-wine/20 px-2 py-0.5 text-[10px] font-bold text-brand-wine uppercase tracking-wider">
                Atención
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold text-brand-wine uppercase tracking-wider">Casos Críticos / Alta</p>
            <p className="mt-1 text-3xl font-bold text-brand-wine">{stats.critical}</p>
          </div>

          <div className="rounded-2xl border border-brand-earth/15 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-accent/30 text-stone-800">
                <Bot size={20} />
              </span>
              <span className="rounded-full bg-brand-light/40 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                RAG + Agentes
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Tasa de Resolución</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">{stats.deflectionRate}%</p>
          </div>

          <div className="rounded-2xl border border-brand-earth/15 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-olive/20 text-stone-900">
                <Sparkles size={20} />
              </span>
              <span className="text-xs font-semibold text-stone-400">Sentimiento</span>
            </div>
            <p className="mt-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Satisfacción Estimada</p>
            <p className="mt-1 text-3xl font-bold text-stone-900">{stats.positiveRate}% Positivo</p>
          </div>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="rounded-2xl border border-brand-earth/15 bg-white p-4 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-stone-400" size={17} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por radicado (PQRS-...), cliente, correo o asunto..."
              className="w-full rounded-xl border border-brand-earth/20 bg-brand-surface py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-brand-wine focus:bg-white focus:ring-2 focus:ring-brand-wine/10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                aria-label="Limpiar búsqueda"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-brand-earth/20 bg-brand-surface px-3 py-2.5 text-xs font-semibold text-stone-700 outline-none transition focus:border-brand-wine focus:bg-white"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="Pending">Pendiente</option>
              <option value="InProgress">En Progreso</option>
              <option value="Resolved">Resuelto</option>
              <option value="Closed">Cerrado</option>
            </select>

            {/* Priority Selector */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-brand-earth/20 bg-brand-surface px-3 py-2.5 text-xs font-semibold text-stone-700 outline-none transition focus:border-brand-wine focus:bg-white"
            >
              <option value="ALL">Todas las Prioridades</option>
              <option value="High">Alta</option>
              <option value="Medium">Media</option>
              <option value="Low">Baja</option>
            </select>

            {/* Type Selector */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-brand-earth/20 bg-brand-surface px-3 py-2.5 text-xs font-semibold text-stone-700 outline-none transition focus:border-brand-wine focus:bg-white"
            >
              <option value="ALL">Todos los Tipos</option>
              <option value="Peticion">Petición</option>
              <option value="Queja">Queja</option>
              <option value="Reclamo">Reclamo</option>
              <option value="Sugerencia">Sugerencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-brand-wine/30 bg-brand-wine/10 p-4 text-sm text-brand-wine">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-2xl border border-brand-earth/15 bg-white shadow-xs">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-light/40 text-brand-wine mb-4">
              <Inbox size={28} />
            </div>
            <h3 className="text-base font-semibold text-stone-800">No se encontraron solicitudes</h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que necesitas.'
                : 'La bandeja de entrada está al día. Las nuevas PQRS aparecerán aquí en tiempo real.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-brand-earth/10 bg-brand-surface text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-4">Radicado y Asunto</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Tipo</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Prioridad</th>
                  <th className="px-5 py-4">Sentimiento</th>
                  <th className="px-5 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="cursor-pointer transition hover:bg-brand-light/10 group"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-bold text-brand-wine tracking-tight">
                        {ticket.trackingNumber}
                      </p>
                      <p className="mt-0.5 font-semibold text-stone-900 group-hover:text-brand-wine transition">
                        {ticket.subject}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-800">{ticket.customerName}</p>
                      <p className="text-xs text-stone-400 truncate max-w-[180px]">{ticket.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <TypeBadge type={ticket.type} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <SentimentBadge sentiment={ticket.sentiment} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex size-8 items-center justify-center rounded-lg text-stone-400 group-hover:bg-brand-light/50 group-hover:text-brand-wine transition">
                        <ChevronRight size={18} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sliding Detail Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedTicket(null)}
          />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-xl animate-slide-in-right bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-stone-100 p-6 bg-brand-surface">
                <div>
                  <span className="font-mono text-xs font-bold text-brand-wine">{selectedTicket.trackingNumber}</span>
                  <h2 className="mt-1 text-xl font-bold text-stone-900 leading-tight">{selectedTicket.subject}</h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-xl p-2 text-stone-400 hover:bg-white hover:text-stone-700 transition"
                  aria-label="Cerrar detalles"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* AI Triage Executive Summary Box */}
                <div className="rounded-2xl border border-brand-wine/20 bg-brand-wine/5 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-brand-wine font-bold text-xs uppercase tracking-wider">
                      <Bot size={18} /> Diagnóstico de Triaje IA
                    </div>
                    <span className="rounded-full bg-brand-wine/15 px-2.5 py-0.5 text-[10px] font-bold text-brand-wine">
                      GPT-4o Mini
                    </span>
                  </div>

                  <p className="text-sm font-medium text-stone-800 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-brand-wine/10">
                    &ldquo;{selectedTicket.summary || 'El modelo analizó el caso y sugirió priorización automática.'}&rdquo;
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-brand-earth/10">
                      <p className="text-[10px] uppercase font-bold text-stone-400">Tipo</p>
                      <div className="mt-1 flex justify-center">
                        <TypeBadge type={selectedTicket.type} />
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-brand-earth/10">
                      <p className="text-[10px] uppercase font-bold text-stone-400">Prioridad</p>
                      <div className="mt-1 flex justify-center">
                        <PriorityBadge priority={selectedTicket.priority} />
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-brand-earth/10">
                      <p className="text-[10px] uppercase font-bold text-stone-400">Sentimiento</p>
                      <div className="mt-1 flex justify-center">
                        <SentimentBadge sentiment={selectedTicket.sentiment} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sender Info */}
                <div className="rounded-xl border border-brand-earth/15 bg-white p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-earth">Datos del Solicitante</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-stone-700">
                      <User size={15} className="text-stone-400 shrink-0" />
                      <span className="font-semibold">{selectedTicket.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-700">
                      <Mail size={15} className="text-stone-400 shrink-0" />
                      <span className="truncate">{selectedTicket.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500">
                      <Calendar size={15} className="text-stone-400 shrink-0" />
                      <span>{new Date(selectedTicket.createdAtUtc).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500">
                      <Clock size={15} className="text-stone-400 shrink-0" />
                      <span>Estado: <StatusBadge status={selectedTicket.status} /></span>
                    </div>
                  </div>
                </div>

                {/* Full Request Description */}
                <div className="rounded-xl border border-brand-earth/15 bg-white p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-earth">Descripción Original</p>
                  <div className="rounded-lg bg-brand-surface p-4 text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Status Transition Actions */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-earth">Cambiar Estado del Caso</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Pending', 'InProgress', 'Resolved', 'Closed'] as TicketStatus[]).map((status) => {
                      const isActive = selectedTicket.status === status;
                      return (
                        <button
                          key={status}
                          disabled={isActive || isUpdating}
                          onClick={() => handleUpdateStatus(selectedTicket.id, status)}
                          className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                            isActive
                              ? 'bg-brand-wine text-white shadow-sm ring-2 ring-brand-wine/20'
                              : 'border border-brand-earth/20 bg-white text-stone-700 hover:bg-brand-light/30'
                          } disabled:cursor-not-allowed`}
                        >
                          {status === 'Pending'
                            ? 'Pendiente'
                            : status === 'InProgress'
                            ? 'En Progreso'
                            : status === 'Resolved'
                            ? 'Resuelto'
                            : 'Cerrado'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
