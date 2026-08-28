import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch {
      setError('Credenciales no válidas. Verifica el correo electrónico y la contraseña asignados a tu cuenta.');
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr] bg-brand-surface">
      {/* Left Column: Form */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-violet to-brand-cornflower text-white shadow-lg shadow-brand-violet/25">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-wine">PQRS SaaS</p>
                <p className="text-xs text-brand-cornflower font-bold">Multi-tenant Operations</p>
              </div>
            </div>

            <div className="mt-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Iniciar Sesión</h1>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                Ingresa tus credenciales para acceder a la cola de atención y triaje automatizado con IA.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-stone-400" size={18} />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@jaramc.com"
                  className="w-full rounded-xl border border-brand-periwinkle/40 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 outline-none transition focus:border-brand-violet focus:ring-3 focus:ring-brand-violet/15"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-3.5 text-stone-400" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-brand-periwinkle/40 bg-white py-3 pl-11 pr-11 text-sm text-stone-900 outline-none transition focus:border-brand-violet focus:ring-3 focus:ring-brand-violet/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-stone-400 hover:text-brand-wine transition"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 animate-fade-in"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="leading-relaxed font-semibold">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cornflower px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-violet/25 transition hover:opacity-95 hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Autenticando...
                </span>
              ) : (
                <>
                  Entrar al Workspace <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Footer badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-stone-400 pt-4">
            <ShieldCheck size={16} className="text-brand-cornflower" />
            <span>Aislamiento estricto multi-tenant y JWT con SHA-256</span>
          </div>
        </div>
      </main>

      {/* Right Column: Hero Visual */}
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-12 text-white">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/95 via-brand-cornflower/90 to-brand-wine/85 backdrop-blur-2xs" />

        {/* Top Header */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-periwinkle backdrop-blur-md">
            <Sparkles size={14} /> AI-Powered Triaging
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Claridad y resolución inmediata para cada solicitud.
          </h2>
          <p className="text-base text-white/90 leading-relaxed font-medium">
            Nuestra plataforma unifica la base de conocimiento vectorial con modelos LLM para clasificar PQRS,
            detectar sentimiento y responder en segundos a tus clientes.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-xl bg-white/15 p-4 backdrop-blur-md border border-white/15">
              <div className="flex items-center gap-2 text-brand-periwinkle">
                <Bot size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">pgvector RAG</span>
              </div>
              <p className="mt-2 text-2xl font-extrabold">1536d</p>
              <p className="text-xs text-white/80 mt-0.5">Búsqueda semántica HNSW</p>
            </div>

            <div className="rounded-xl bg-white/15 p-4 backdrop-blur-md border border-white/15">
              <div className="flex items-center gap-2 text-brand-periwinkle">
                <CheckCircle2 size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Alertas SignalR</span>
              </div>
              <p className="mt-2 text-2xl font-extrabold">&lt; 100ms</p>
              <p className="text-xs text-white/80 mt-0.5">Notificaciones instantáneas</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/80 border-t border-white/15 pt-6">
          <span>PQRS SaaS Platform v2.0</span>
          <span>Soporte Enterprise 24/7</span>
        </div>
      </section>
    </div>
  );
}
