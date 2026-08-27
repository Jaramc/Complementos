import {
  AlertCircle,
  BookOpen,
  Bot,
  CheckCircle2,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { kbApi, ragApi } from '../api/client';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/useAuth';
import type { KbArticle, RagSearchResponse } from '../types';

export function KnowledgeBasePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation State
  const [articleToDelete, setArticleToDelete] = useState<KbArticle | null>(null);

  // RAG Sandbox Query State
  const [sandboxQuery, setSandboxQuery] = useState('¿Cuál es la política de reembolsos?');
  const [isQueryingRag, setIsQueryingRag] = useState(false);
  const [ragResult, setRagResult] = useState<RagSearchResponse | null>(null);

  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await kbApi.list();
      setArticles(data);
    } catch {
      setError('No fue posible cargar los artículos de la base de conocimiento.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleCreateArticle = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSaving(true);
    try {
      const created = await kbApi.create({
        title: newTitle.trim(),
        content: newContent.trim(),
      });
      setArticles((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewContent('');
    } catch {
      alert('Error al guardar el artículo en la base de datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    try {
      await kbApi.delete(articleToDelete.id);
      setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
      setArticleToDelete(null);
    } catch {
      alert('Error al eliminar el artículo.');
    }
  };

  const handleTestRagQuery = async (e: FormEvent) => {
    e.preventDefault();
    if (!sandboxQuery.trim()) return;

    setIsQueryingRag(true);
    try {
      const result = await ragApi.search(sandboxQuery.trim(), user?.tenantId);
      setRagResult(result);
    } catch {
      alert('Error al consultar el servicio RAG.');
    } finally {
      setIsQueryingRag(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-earth">
            <BookOpen size={15} className="text-brand-wine" /> AI Knowledge Layer
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">Base de Conocimiento RAG</h1>
          <p className="mt-1 text-sm text-stone-500">
            Documentación indexada en PostgreSQL mediante embeddings vectoriales (1536 dimensiones).
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-wine px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-wine-dark"
        >
          <Plus size={16} /> Nuevo Artículo
        </button>
      </div>

      {/* RAG Sandbox Tester Card */}
      <section className="rounded-2xl border border-brand-earth/20 bg-gradient-to-br from-white via-white to-brand-light/20 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-brand-wine text-white">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Sandbox RAG en Vivo</h2>
              <p className="text-xs text-stone-500">Prueba cómo la IA responde preguntas utilizando los artículos activos.</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brand-light/60 px-3 py-1 text-xs font-bold text-brand-wine">
            <Sparkles size={13} /> pgvector HNSW
          </span>
        </div>

        <form onSubmit={handleTestRagQuery} className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-stone-400" size={17} />
            <input
              type="text"
              value={sandboxQuery}
              onChange={(e) => setSandboxQuery(e.target.value)}
              placeholder="Escribe una pregunta para probar el RAG (ej: ¿Cuáles son los plazos?)..."
              className="w-full rounded-xl border border-brand-earth/20 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none transition focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/10"
            />
          </div>
          <button
            type="submit"
            disabled={isQueryingRag}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-earth px-5 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {isQueryingRag ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
            {isQueryingRag ? 'Consultando...' : 'Probar Consulta'}
          </button>
        </form>

        {ragResult && (
          <div className="mt-4 rounded-xl border border-brand-accent/30 bg-white p-4 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-wine uppercase tracking-wider flex items-center gap-1.5">
                {ragResult.hasAnswer ? <CheckCircle2 size={15} className="text-emerald-600" /> : <AlertCircle size={15} className="text-amber-600" />}
                {ragResult.hasAnswer ? 'Respuesta Sintetizada por IA' : 'Sin Respuesta Suficiente'}
              </span>
              <span className="font-mono text-stone-400">
                Similitud Coseno: {Math.round(ragResult.similarityScore * 100)}%
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
              {ragResult.answer || 'No se encontró un artículo con suficiente similitud semántica para contestar.'}
            </p>
          </div>
        )}
      </section>

      {/* Error state */}
      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-brand-wine/30 bg-brand-wine/10 p-4 text-sm text-brand-wine">
          <AlertCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-brand-earth/15 bg-white p-5 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-brand-earth/15 bg-white py-16 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-light/40 text-brand-wine mb-4">
            <FileText size={28} />
          </div>
          <h3 className="text-base font-semibold text-stone-800">No hay artículos indexados</h3>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            Crea tu primer artículo para que los clientes puedan resolver dudas antes de radicar un ticket formal.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-wine px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-wine-dark"
          >
            <Plus size={15} /> Crear Primer Artículo
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="rounded-2xl border border-brand-earth/15 bg-white p-5 shadow-xs flex flex-col justify-between transition hover:shadow-md hover:border-brand-earth/30 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-light/60 text-brand-wine">
                      <FileText size={18} />
                    </span>
                    <h3 className="font-bold text-sm text-stone-900 leading-tight group-hover:text-brand-wine transition">
                      {article.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setArticleToDelete(article)}
                    className="rounded-lg p-1.5 text-stone-300 hover:bg-brand-wine/10 hover:text-brand-wine transition"
                    title="Eliminar artículo"
                    aria-label="Eliminar artículo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="mt-4 text-xs text-stone-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                  {article.content}
                </p>
              </div>

              {/* Vector info footer */}
              <div className="mt-6 border-t border-stone-100 pt-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1 text-stone-500 font-semibold">
                    <Sparkles size={13} className="text-brand-olive" /> pgvector 1536d
                  </span>
                  <span>{new Date(article.createdAtUtc).toLocaleDateString('es-CO')}</span>
                </div>
                <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-stone-100">
                  {Array.from({ length: 24 }, (_, bar) => (
                    <span
                      key={bar}
                      className={`flex-1 rounded-sm ${
                        bar % 3 === 0 ? 'bg-brand-wine/60' : bar % 2 === 0 ? 'bg-brand-accent' : 'bg-brand-light'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal: Crear Artículo */}
      {isCreateModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isSaving && setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-lg animate-fade-in rounded-2xl border border-brand-earth/20 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-light/60 text-brand-wine">
                  <BookOpen size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Nuevo Artículo de Conocimiento</h3>
                  <p className="text-xs text-stone-500">Se generará un embedding vectorial al guardar.</p>
                </div>
              </div>
              <button
                onClick={() => !isSaving && setIsCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Título del Artículo
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Política de Garantías y Devoluciones"
                  className="w-full rounded-xl border border-brand-earth/25 bg-white p-3 text-sm text-stone-900 outline-none transition focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/10"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Contenido Explicativo
                </label>
                <textarea
                  id="content"
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Detalla de manera clara el procedimiento, tiempos o condiciones para que el modelo RAG lo sintetice adecuadamente..."
                  className="w-full rounded-xl border border-brand-earth/25 bg-white p-3 text-sm text-stone-900 outline-none transition focus:border-brand-wine focus:ring-2 focus:ring-brand-wine/10"
                />
              </div>

              <div className="rounded-xl bg-brand-surface p-3 border border-brand-earth/15 flex items-center gap-2 text-xs text-stone-600">
                <Sparkles size={16} className="text-brand-wine shrink-0" />
                <span>Al guardar, el servidor creará un vector con OpenAI `text-embedding-3-small` y lo almacenará en pgvector.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-brand-earth/25 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-wine px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-wine-dark disabled:opacity-60"
                >
                  {isSaving && <RefreshCw size={14} className="animate-spin" />}
                  {isSaving ? 'Indexando Vector...' : 'Guardar e Indexar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Eliminación */}
      <ConfirmModal
        isOpen={!!articleToDelete}
        title="¿Eliminar artículo?"
        description={`Se removerá "${articleToDelete?.title}" y su vector asociado. La IA ya no responderá con este contenido.`}
        confirmLabel="Eliminar Artículo"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleDeleteArticle}
        onCancel={() => setArticleToDelete(null)}
      />
    </div>
  );
}
