import { AlertCircle, ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('Admin123*');
  const [error, setError] = useState('');
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    try { await login(email, password); navigate(from, { replace: true }); }
    catch { setError('No pudimos validar esas credenciales. Revisa el correo y la contraseña.'); }
  }

  return <div className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]"><section className="relative hidden overflow-hidden bg-brand-wine p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-32 -top-32 size-96 rounded-full border-[50px] border-brand-olive/30" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-light">PQRS / OPERATIONS</p><h1 className="mt-24 max-w-xl text-6xl font-semibold leading-[.95] tracking-tight">Claridad para cada solicitud.</h1><p className="mt-7 max-w-md text-base leading-7 text-white/70">Un espacio de trabajo para escuchar, priorizar y resolver lo que importa.</p></div><div className="relative flex items-center gap-3 text-sm text-white/65"><ShieldCheck size={18} /> Entorno seguro por tenant</div></section><main className="flex items-center justify-center bg-brand-surface px-6 py-12"><div className="w-full max-w-md"><div className="mb-12 lg:hidden"><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-wine">PQRS / OPERATIONS</p></div><div className="mb-9"><p className="text-sm font-medium text-brand-earth">Bienvenido de nuevo</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Entra a tu workspace</h2><p className="mt-3 text-sm leading-6 text-stone-500">Gestiona tickets y conocimiento desde un solo lugar.</p></div><form onSubmit={submit} className="space-y-5"><div><label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700">Correo electrónico</label><div className="relative"><Mail className="absolute left-3 top-3 text-stone-400" size={18} /><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-brand-earth/25 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/10" /></div></div><div><label htmlFor="password" className="mb-2 block text-sm font-medium text-stone-700">Contraseña</label><div className="relative"><LockKeyhole className="absolute left-3 top-3 text-stone-400" size={18} /><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-brand-earth/25 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/10" /></div></div>{error && <p role="alert" className="flex items-start gap-2 rounded-lg border border-brand-wine/20 bg-brand-wine/10 p-3 text-sm text-brand-wine"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}<button disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-wine px-4 py-3 font-medium text-white transition-colors hover:bg-brand-wine-dark disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? 'Validando...' : 'Entrar al dashboard'}{!isLoading && <ArrowRight size={17} />}</button></form><p className="mt-8 text-center text-xs text-stone-400">Acceso protegido por autenticación JWT</p></div></main></div>;
}
