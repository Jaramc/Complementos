import { BookOpen, LayoutDashboard, Search, Settings, Ticket, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const navigationItems = [
    { title: 'Resumen y Métricas', subtitle: 'Vista general del dashboard', path: '/', icon: LayoutDashboard, category: 'Navegación' },
    { title: 'Gestión de Tickets PQRS', subtitle: 'Cola de atención y triaje IA', path: '/tickets', icon: Ticket, category: 'Navegación' },
    { title: 'Base de Conocimiento RAG', subtitle: 'Artículos y vectores pgvector', path: '/kb', icon: BookOpen, category: 'Navegación' },
    { title: 'Configuración de Widget', subtitle: 'Snippet web y demo interactiva', path: '/widget-config', icon: Settings, category: 'Navegación' },
  ];

  const filteredItems = navigationItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (isOpen) onClose();
      }
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20"
    >
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl animate-fade-in rounded-2xl border border-brand-earth/20 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center border-b border-stone-100 px-4 py-3">
          <Search size={19} className="text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para buscar comandos o navegar..."
            className="w-full bg-transparent px-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            aria-label="Cerrar buscador"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500">
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-earth">
                Acceso Rápido
              </p>
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-brand-light/30 text-stone-800"
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-light/60 text-brand-wine">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-stone-500 truncate">{item.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-stone-100 bg-stone-50 px-4 py-2 flex items-center justify-between text-[11px] text-stone-400">
          <span>Usa <kbd className="rounded bg-white px-1.5 py-0.5 border border-stone-200 font-mono text-[10px]">ESC</kbd> para salir</span>
          <span>Navegación inteligente PQRS</span>
        </div>
      </div>
    </div>
  );
}
