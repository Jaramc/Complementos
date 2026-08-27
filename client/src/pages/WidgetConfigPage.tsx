import {
  Check,
  Code2,
  Copy,
  Globe,
  Laptop,
  MessageSquare,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/useAuth';

export function WidgetConfigPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Widget Mockup Interactive State
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [mockQuery, setMockQuery] = useState('');
  const [mockAnswer, setMockAnswer] = useState<string | null>(null);
  const [isSearchingMock, setIsSearchingMock] = useState(false);

  const tenantId = user?.tenantId || '5303da30-d1f9-4a61-922f-fd4319e45037';
  const apiUrl = import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).origin : 'http://localhost:8080';

  const scriptSnippet = `<!-- Widget PQRS SaaS -->
<script
  src="${apiUrl}/pqrs-widget.js"
  data-tenant="${tenantId}"
  data-api-url="${apiUrl}">
</script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scriptSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Error al copiar al portapapeles.');
    }
  };

  const handleMockSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!mockQuery.trim()) return;

    setIsSearchingMock(true);
    setTimeout(() => {
      setMockAnswer(
        'Los reembolsos y solicitudes de garantía se gestionan en un plazo máximo de 5 días hábiles conforme a nuestra política corporativa.',
      );
      setIsSearchingMock(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-earth">
          <Settings size={15} className="text-brand-wine" /> Customer Touchpoint
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Integración del Widget Web</h1>
        <p className="mt-1 text-sm text-stone-500">
          Incrusta el asistente inteligente de PQRS en cualquier portal web o tienda con un solo tag HTML.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Code Snippet & Instructions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-earth/15 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-light/60 text-brand-wine">
                  <Code2 size={20} />
                </span>
                <div>
                  <h2 className="font-bold text-base text-stone-900">Código de Instalación</h2>
                  <p className="text-xs text-stone-500">Tenant ID vinculado: Empresa Demo</p>
                </div>
              </div>

              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-wine px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-wine-dark"
              >
                {copied ? <Check size={16} className="text-brand-light" /> : <Copy size={16} />}
                {copied ? 'Copiado al Portapapeles' : 'Copiar Snippet'}
              </button>
            </div>

            <div className="relative">
              <pre className="overflow-x-auto rounded-xl bg-stone-950 p-5 text-xs font-mono leading-relaxed text-brand-light shadow-inner border border-stone-800">
                <code>{scriptSnippet}</code>
              </pre>
            </div>

            {/* Instruction list */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-earth">Pasos para la integración</p>
              <ol className="list-decimal list-inside space-y-2 text-xs text-stone-600 leading-relaxed">
                <li>Copia el bloque <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">&lt;script&gt;</code> anterior.</li>
                <li>Pégalo antes de la etiqueta de cierre <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">&lt;/body&gt;</code> en tu sitio web.</li>
                <li>El widget cargará aislado en Shadow DOM con colores corporativos y asistente RAG integrado.</li>
              </ol>
            </div>
          </div>

          {/* Architecture info */}
          <div className="rounded-2xl border border-brand-earth/15 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck size={17} className="text-brand-accent" /> Seguridad y CORS Aislado
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              El widget envía el header <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">X-Tenant-Id</code> y se valida dinámicamente contra los orígenes permitidos (<code className="bg-stone-100 px-1 py-0.5 rounded font-mono">AllowedOrigins</code>) de tu tenant para garantizar total aislamiento.
            </p>
          </div>
        </div>

        {/* Right: Live Interactive Simulation Mockup */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-earth flex items-center gap-2">
              <Laptop size={16} className="text-brand-wine" /> Simulación en Vivo de Sitio Web
            </h2>
            <span className="text-[11px] font-semibold text-stone-400">Mockup Interactivo</span>
          </div>

          {/* Browser Window Mockup */}
          <div className="relative rounded-2xl border border-stone-300 bg-stone-100 shadow-xl overflow-hidden min-h-[460px] flex flex-col">
            {/* Browser Top Bar */}
            <div className="flex items-center gap-2 bg-stone-200 px-4 py-2.5 border-b border-stone-300">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-rose-400" />
                <span className="size-3 rounded-full bg-amber-400" />
                <span className="size-3 rounded-full bg-emerald-400" />
              </div>
              <div className="mx-auto flex w-3/4 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1 text-[11px] font-mono text-stone-500 shadow-2xs">
                <Globe size={11} className="text-stone-400" />
                <span>https://tu-tienda-online.com</span>
              </div>
            </div>

            {/* Host Web Page Content */}
            <div className="p-6 space-y-4 flex-1 bg-white relative">
              <div className="h-6 w-32 bg-stone-200 rounded-md" />
              <div className="h-28 w-full bg-gradient-to-r from-stone-100 to-stone-50 rounded-xl p-4 flex flex-col justify-center space-y-2">
                <div className="h-4 w-48 bg-stone-300 rounded" />
                <div className="h-3 w-64 bg-stone-200 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-20 bg-stone-50 rounded-lg border border-stone-200" />
                <div className="h-20 bg-stone-50 rounded-lg border border-stone-200" />
              </div>

              {/* Floating Widget Launcher */}
              <button
                type="button"
                onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                className="absolute bottom-5 right-5 z-20 flex size-12 items-center justify-center rounded-full bg-brand-wine text-white shadow-xl transition hover:scale-105 active:scale-95"
                title="Abrir asistente PQRS"
                aria-label="Abrir asistente PQRS"
              >
                {isWidgetOpen ? <X size={20} /> : <MessageSquare size={20} />}
              </button>

              {/* Floating Widget Drawer Mockup */}
              {isWidgetOpen && (
                <div className="absolute bottom-20 right-5 z-20 w-80 rounded-2xl border border-brand-earth/20 bg-white p-4 shadow-2xl space-y-3 animate-fade-in text-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-wine">PQRS / ASISTENTE</p>
                      <h4 className="font-bold text-stone-900">¿En qué podemos ayudarte?</h4>
                    </div>
                    <button
                      onClick={() => setIsWidgetOpen(false)}
                      className="rounded p-1 text-stone-400 hover:text-stone-700"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-500 leading-tight">
                    Consulta nuestra base de conocimiento antes de radicar una PQRS formal.
                  </p>

                  <form onSubmit={handleMockSearch} className="space-y-2">
                    <textarea
                      rows={2}
                      value={mockQuery}
                      onChange={(e) => setMockQuery(e.target.value)}
                      placeholder="Escribe tu duda aquí..."
                      className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-brand-wine"
                    />
                    <button
                      type="submit"
                      disabled={isSearchingMock}
                      className="w-full rounded-lg bg-brand-wine py-2 text-xs font-bold text-white hover:bg-brand-wine-dark transition"
                    >
                      {isSearchingMock ? 'Consultando RAG...' : 'Consultar'}
                    </button>
                  </form>

                  {mockAnswer && (
                    <div className="rounded-lg bg-brand-light/30 border-l-3 border-brand-wine p-2.5 text-[11px] text-stone-800 space-y-2">
                      <p>{mockAnswer}</p>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMockAnswer(null);
                            setMockQuery('');
                            setIsWidgetOpen(false);
                          }}
                          className="flex-1 rounded bg-brand-wine py-1 text-[10px] font-bold text-white"
                        >
                          Sí, resolvió mi duda
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
