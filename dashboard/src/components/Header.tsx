import { LogOut, Radio, Search } from 'lucide-react';

interface HeaderProps { onLogout: () => void; onMenu: () => void; }

export function Header({ onLogout, onMenu }: HeaderProps) {
  return <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-brand-earth/15 bg-white/75 px-5 backdrop-blur md:px-8">
    <div className="flex items-center gap-3"><button onClick={onMenu} className="rounded-lg p-2 text-stone-600 hover:bg-brand-light/30 lg:hidden" aria-label="Abrir menú"><span className="text-xl">☰</span></button><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-earth">Workspace</p><h1 className="text-lg font-semibold text-stone-900">Empresa Demo</h1></div></div>
    <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-400 sm:flex"><Search size={16} /><span>Buscar tickets</span><kbd className="ml-5 rounded border border-stone-200 px-1.5 text-[10px]">⌘K</kbd></div><span className="hidden items-center gap-2 rounded-full bg-brand-light/40 px-3 py-1.5 text-xs font-medium text-stone-800 sm:flex"><Radio size={13} className="text-brand-wine" /> En vivo</span><span className="rounded-lg bg-brand-olive/20 px-3 py-1.5 text-xs font-semibold text-stone-900">Admin</span><button onClick={onLogout} className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-brand-wine/10 hover:text-brand-wine" aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18} /></button></div>
  </header>;
}
