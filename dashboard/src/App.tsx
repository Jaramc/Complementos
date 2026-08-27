import { Activity, ArrowUpRight, CheckCircle2, Clock3, Filter, Inbox, Plus } from 'lucide-react';
import { useState } from 'react';
import { Header } from './components/Header';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { Sidebar } from './components/Sidebar';
import { TicketTable } from './components/TicketTable';
import type { KnowledgeArticle, Ticket } from './types';

const tickets: Ticket[] = [
  { id: '1', trackingNumber: 'PQRS-20260827-8B29D594', customerName: 'Laura Méndez', subject: 'Cobro duplicado en factura', type: 'Reclamo', status: 'Pending', priority: 'High', sentiment: 'Negative', createdAt: 'hace 12 min' },
  { id: '2', trackingNumber: 'PQRS-20260827-7F20A1BC', customerName: 'Diego Ramírez', subject: 'Consulta sobre reembolso', type: 'Peticion', status: 'InProgress', priority: 'Medium', sentiment: 'Neutral', createdAt: 'hace 28 min' },
  { id: '3', trackingNumber: 'PQRS-20260826-0C13E5A4', customerName: 'Marta Salcedo', subject: 'Excelente atención del equipo', type: 'Sugerencia', status: 'Resolved', priority: 'Low', sentiment: 'Positive', createdAt: 'ayer' },
  { id: '4', trackingNumber: 'PQRS-20260826-45D89B10', customerName: 'Andrés López', subject: 'Entrega fuera del plazo', type: 'Queja', status: 'Pending', priority: 'High', sentiment: 'Negative', createdAt: 'ayer' },
];

const articles: KnowledgeArticle[] = [
  { id: '1', title: 'Política de reembolsos', content: 'Los reembolsos se procesan dentro de los primeros 15 días hábiles posteriores a la solicitud.', isActive: true, createdAt: '27 ago 2026', vector: Array.from({ length: 1536 }, (_, index) => Math.sin(index) * .8) },
  { id: '2', title: 'Tiempos de respuesta PQRS', content: 'Cada solicitud recibe una respuesta inicial en un plazo máximo de cinco días hábiles.', isActive: true, createdAt: '26 ago 2026', vector: Array.from({ length: 1536 }, (_, index) => Math.cos(index * .7) * .7) },
  { id: '3', title: 'Canales de soporte', content: 'Nuestro equipo atiende solicitudes a través del widget web y los canales oficiales de atención.', isActive: true, createdAt: '24 ago 2026', vector: Array.from({ length: 1536 }, (_, index) => Math.sin(index * .3) * .6) },
];

function App() {
  const [activeView, setActiveView] = useState<'overview' | 'tickets' | 'knowledge'>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const navigate = (view: 'overview' | 'tickets' | 'knowledge') => { setActiveView(view); setMobileNav(false); };
  return <div className="min-h-screen bg-brand-surface text-stone-900"><div className="flex min-h-screen"><div className={`${mobileNav ? 'fixed inset-y-0 left-0 z-30 flex' : 'hidden'} lg:flex`}><Sidebar activeView={activeView} onNavigate={navigate} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} /></div>{mobileNav && <button className="fixed inset-0 z-20 bg-stone-900/20 lg:hidden" onClick={() => setMobileNav(false)} aria-label="Cerrar menú" />}
    <div className="min-w-0 flex-1"><Header onMenu={() => setMobileNav(true)} onLogout={() => window.alert('Sesión cerrada')} /><main className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 md:py-10">{activeView === 'knowledge' ? <KnowledgeBaseView articles={articles} onCreate={() => window.alert('Editor de artículo')} /> : <><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-brand-earth">27 de agosto, 2026</p><h2 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">Buenos días, equipo.</h2><p className="mt-2 text-sm text-stone-500">Aquí tienes el pulso de tu operación.</p></div><button onClick={() => navigate('knowledge')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-wine px-4 py-2 font-medium text-white transition-colors hover:bg-brand-wine-dark"><Plus size={17} /> Nuevo artículo</button></div><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Tickets abiertos', value: '24', delta: '+8.4%', icon: Inbox }, { label: 'En proceso', value: '11', delta: '+2.1%', icon: Activity }, { label: 'Tiempo promedio', value: '3.8 h', delta: '-12.6%', icon: Clock3 }, { label: 'Resueltos', value: '68', delta: '+14.2%', icon: CheckCircle2 }].map(({ label, value, delta, icon: Icon }) => <div key={label} className="rounded-lg border border-brand-earth/15 bg-white p-5"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-lg bg-brand-light/50 text-brand-wine"><Icon size={18} /></span><span className="text-xs font-semibold text-brand-wine">{delta}</span></div><p className="mt-5 text-sm text-stone-500">{label}</p><p className="mt-1 text-2xl font-semibold text-stone-900">{value}</p></div>)}</div><section className="mt-10"><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold text-stone-900">Actividad reciente</h2><p className="mt-1 text-sm text-stone-500">Las solicitudes que requieren atención.</p></div><div className="flex gap-2"><button className="inline-flex items-center gap-2 rounded-lg border border-brand-earth/30 px-3 py-2 text-sm font-medium text-brand-earth hover:bg-brand-light/30"><Filter size={16} /> Filtrar</button><button onClick={() => navigate('tickets')} className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-white">Ver todos <ArrowUpRight size={15} /></button></div></div><TicketTable tickets={tickets} /></section></>}</main></div></div></div>;
}

export default App;
