import { Clock3, UserRound } from 'lucide-react';
import type { Ticket, TicketPriority, TicketSentiment } from '../types';

const priorityClass: Record<TicketPriority, string> = { Low: 'bg-brand-light/40 text-stone-800 border border-brand-accent/40', Medium: 'bg-brand-olive/20 text-stone-900 border border-brand-olive/40', High: 'bg-brand-wine/10 text-brand-wine border border-brand-wine/30' };
const sentimentClass: Record<TicketSentiment, string> = { Positive: 'bg-brand-light/40 text-stone-800 border border-brand-accent/40', Neutral: 'bg-brand-olive/20 text-stone-900 border border-brand-olive/40', Negative: 'bg-brand-wine/10 text-brand-wine border border-brand-wine/30' };
const typeLabel: Record<Ticket['type'], string> = { Peticion: 'P', Queja: 'Q', Reclamo: 'R', Sugerencia: 'S' };

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return <article className="rounded-lg border border-brand-earth/15 bg-white p-4 shadow-sm shadow-stone-900/[0.02] transition-transform hover:-translate-y-0.5">
    <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-brand-light/50 text-sm font-bold text-brand-wine">{typeLabel[ticket.type]}</span><div><p className="font-mono text-xs text-stone-400">{ticket.trackingNumber}</p><h3 className="mt-1 font-semibold text-stone-900">{ticket.subject}</h3></div></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityClass[ticket.priority]}`}>{ticket.priority}</span></div>
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-stone-500"><span className="flex items-center gap-1.5"><UserRound size={14} /> {ticket.customerName}</span><span className="flex items-center gap-1.5"><Clock3 size={14} /> {ticket.createdAt}</span></div><div className="mt-3 flex gap-2"><span className={`rounded-full px-2 py-1 text-[11px] font-medium ${sentimentClass[ticket.sentiment]}`}>{ticket.sentiment}</span><span className="rounded-full border border-stone-200 px-2 py-1 text-[11px] text-stone-500">{ticket.status}</span></div>
  </article>;
}
