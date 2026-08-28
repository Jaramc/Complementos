import {
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Ticket,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useSignalR } from '../../context/useSignalR';
import { CommandPalette } from '../common/CommandPalette';
import { ConfirmModal } from '../common/ConfirmModal';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { RealtimeToast } from '../common/Toast';

const navigationLinks = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, badge: null },
  { to: '/tickets', label: 'Cola de PQRS', icon: Ticket, badge: 'IA' },
  { to: '/kb', label: 'Base de Conocimiento', icon: BookOpen, badge: 'pgvector' },
  { to: '/widget-config', label: 'Integración Widget', icon: Settings, badge: null },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { isConnected } = useSignalR();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTicketFromAlert = (trackingNumber: string) => {
    navigate(`/tickets?search=${encodeURIComponent(trackingNumber)}`);
  };

  return (
    <div className="min-h-screen bg-brand-surface text-stone-900 flex flex-col">
      <div className="flex flex-1 min-h-screen">
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            mobileOpen ? 'fixed inset-y-0 left-0 z-50 flex w-72' : 'hidden'
          } shrink-0 flex-col border-r border-brand-periwinkle/30 bg-white px-4 py-6 shadow-xs lg:static lg:flex lg:w-64`}
        >
          {/* Logo & Header */}
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-cornflower text-white shadow-md shadow-brand-violet/25">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="font-extrabold tracking-tight text-base text-brand-wine">PQRS SaaS</p>
                <p className="text-[11px] font-bold text-brand-cornflower uppercase tracking-wider">AI Operations</p>
              </div>
            </div>
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 lg:hidden"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5 flex-1" aria-label="Navegación principal">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Plataforma
            </p>
            {navigationLinks.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-lilac/25 text-brand-wine border-r-4 border-brand-violet shadow-2xs'
                      : 'text-stone-600 hover:bg-brand-periwinkle/20 hover:text-stone-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span className="rounded-md bg-brand-sky/40 px-1.5 py-0.5 text-[10px] font-bold text-brand-wine">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Tenant & User Footer */}
          <div className="mt-auto pt-4 space-y-3 border-t border-stone-100">
            <div className="rounded-xl bg-brand-surface p-3 border border-brand-periwinkle/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Tenant Activo
                </span>
                <span className="flex size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              </div>
              <p className="mt-1 font-bold text-xs text-stone-800">Empresa Demo</p>
              <p className="font-mono text-[10px] text-stone-400 truncate mt-0.5" title={user?.tenantId}>
                {user?.tenantId}
              </p>
            </div>

            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-sky/30 text-brand-wine font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate">{user?.email}</p>
                  <p className="text-[10px] text-stone-400 capitalize">{user?.role || 'Admin'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-brand-lilac/20 hover:text-brand-wine transition"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 flex flex-col">
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-brand-earth/15 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 text-stone-600 hover:bg-brand-light/30 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu size={21} />
              </button>

              {/* Quick Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2.5 rounded-xl border border-brand-earth/20 bg-brand-surface px-3.5 py-2 text-xs text-stone-500 transition hover:border-brand-earth/40 hover:bg-white w-64 shadow-2xs"
              >
                <Search size={15} className="text-stone-400" />
                <span className="flex-1 text-left">Buscar o comando...</span>
                <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-stone-400 font-semibold shadow-xs">
                  ⌘K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* SignalR Connection Status */}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                  isConnected
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}
                title={isConnected ? 'Conectado al Hub SignalR' : 'Reconectando con el servidor...'}
              >
                <span
                  className={`size-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="hidden sm:inline">
                  {isConnected ? 'SignalR Conectado' : 'SignalR Desconectado'}
                </span>
              </div>

              {/* Notifications */}
              <NotificationDropdown onSelectTicket={handleSelectTicketFromAlert} />

              {/* Help & Docs button */}
              <a
                href="http://localhost:8080/swagger"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex rounded-lg p-2 text-stone-500 hover:bg-brand-light/30 hover:text-stone-800 transition"
                title="Documentación Swagger API"
                aria-label="Documentación Swagger API"
              >
                <HelpCircle size={18} />
              </a>
            </div>
          </header>

          {/* Page Outlet */}
          <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Realtime Toast */}
      <RealtimeToast onSelectTicket={handleSelectTicketFromAlert} />

      {/* Command Palette Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="¿Cerrar sesión?"
        description="Terminarás tu sesión de trabajo actual en el workspace de Empresa Demo. Tendrás que volver a autenticarte para ingresar."
        confirmLabel="Cerrar sesión"
        cancelLabel="Permanecer"
        isDestructive={true}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
