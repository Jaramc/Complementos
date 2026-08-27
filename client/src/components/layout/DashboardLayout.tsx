import { Bell, BookOpen, LayoutDashboard, LogOut, Menu, Settings, Ticket, Wifi } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/useAuth';

const links = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard },
  { to: '/tickets', label: 'Tickets', icon: Ticket },
  { to: '/kb', label: 'Base de conocimiento', icon: BookOpen },
  { to: '/widget-config', label: 'Widget', icon: Settings },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="min-h-screen bg-brand-surface text-stone-900"><div className="flex min-h-screen">
    {mobileOpen && <button className="fixed inset-0 z-20 bg-stone-900/20 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}
    <aside className={`${mobileOpen ? 'fixed inset-y-0 left-0 z-30 flex' : 'hidden'} w-64 shrink-0 flex-col border-r border-brand-earth/20 bg-brand-surface px-4 py-6 lg:static lg:flex`}>
      <div className="mb-10 px-2"><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-wine">PQRS</p><p className="mt-1 text-xs text-stone-500">Operations workspace</p></div>
      <nav className="space-y-1" aria-label="Navegación principal">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${isActive ? 'bg-brand-light/50 font-semibold text-brand-wine' : 'text-stone-600 hover:bg-brand-light/30 hover:text-stone-900'}`}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="mt-auto border-t border-brand-earth/15 pt-4"><p className="px-3 text-xs text-stone-400">Tenant activo</p><p className="mt-1 truncate px-3 text-xs font-medium text-stone-600">{user?.tenantId}</p></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="flex min-h-[76px] items-center justify-between border-b border-brand-earth/15 bg-white/80 px-5 backdrop-blur md:px-8"><div className="flex items-center gap-3"><button className="rounded-lg p-2 text-stone-600 hover:bg-brand-light/30 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-earth">Empresa Demo</p><p className="mt-1 text-sm font-semibold">Panel de agentes</p></div></div><div className="flex items-center gap-3"><span className="hidden items-center gap-2 rounded-full bg-brand-light/40 px-3 py-1.5 text-xs font-medium text-stone-800 sm:flex"><Wifi size={13} className="text-brand-wine" /> Conectado</span><button className="rounded-lg p-2 text-stone-500 hover:bg-brand-light/30" aria-label="Notificaciones"><Bell size={18} /></button><div className="hidden text-right sm:block"><p className="text-sm font-medium">{user?.email}</p><p className="text-xs text-stone-500">{user?.role}</p></div><button onClick={logout} className="rounded-lg p-2 text-stone-500 hover:bg-brand-wine/10 hover:text-brand-wine" aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18} /></button></div></header><main className="mx-auto max-w-7xl px-5 py-8 md:px-8"><Outlet /></main></div>
  </div></div>;
}
