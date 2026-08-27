import { BookOpen, LayoutDashboard, MessageSquareText, PanelLeftClose, PanelLeftOpen, Settings, Ticket } from 'lucide-react';

interface SidebarProps {
  activeView: 'overview' | 'tickets' | 'knowledge';
  onNavigate: (view: SidebarProps['activeView']) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const links = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'knowledge', label: 'Base de conocimiento', icon: BookOpen },
] as const;

export function Sidebar({ activeView, onNavigate, collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`flex shrink-0 flex-col border-r border-brand-earth/20 bg-brand-surface px-3 py-5 transition-all duration-300 ${collapsed ? 'w-[76px]' : 'w-64'}`}>
      <div className="mb-10 flex items-center justify-between px-2">
        {!collapsed && <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-wine">PQRS</p><p className="mt-1 text-xs text-stone-500">Operations desk</p></div>}
        <button onClick={onToggle} className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-brand-light/50 hover:text-brand-wine" aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}>
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
        </button>
      </div>
      <nav className="space-y-1" aria-label="Navegación principal">
        {links.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return <button key={id} onClick={() => onNavigate(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${active ? 'bg-brand-light/50 font-semibold text-brand-wine' : 'text-stone-600 hover:bg-brand-light/30 hover:text-stone-900'}`}>
            <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
            {!collapsed && <span>{label}</span>}
          </button>;
        })}
      </nav>
      <div className="mt-auto space-y-1 border-t border-brand-earth/15 pt-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-stone-600 transition-colors hover:bg-brand-light/30"><MessageSquareText size={18} /><span className={collapsed ? 'sr-only' : ''}>Actividad</span></button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-stone-600 transition-colors hover:bg-brand-light/30"><Settings size={18} /><span className={collapsed ? 'sr-only' : ''}>Configuración</span></button>
      </div>
    </aside>
  );
}
