using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.Rag;
using PQRS.Domain.Entities;
using PQRS.Infrastructure.Persistence;
using Pgvector.EntityFrameworkCore;

namespace PQRS.Infrastructure.Services;

public sealed class RagService : IRagService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IEmbeddingService _embeddingService;
    private readonly ILlmService _llmService;
    private readonly ILogger<RagService> _logger;

    private const string BaseCompanyContext = @"
- Nombre de la plataforma: Sistema Integral de Gestión y Atención al Cliente (SaaS PQRS).
- Horarios de atención humana: Lunes a Viernes de 8:00 AM a 6:00 PM, Sábados de 8:00 AM a 1:00 PM.
- Envíos y entregas: Cobertura nacional con entregas entre 2 y 5 días hábiles.
- Garantías y reembolsos: 30 días calendario para garantía de fábrica; reembolsos procesados entre 3 y 5 días hábiles tras recibir el producto.
- Medios de pago: Tarjetas de crédito/débito, transferencias PSE y facturación electrónica.";

    public RagService(
        ApplicationDbContext context,
        ICurrentTenantService currentTenantService,
        IEmbeddingService embeddingService,
        ILlmService llmService)
        : this(context, currentTenantService, embeddingService, llmService, Microsoft.Extensions.Logging.Abstractions.NullLogger<RagService>.Instance)
    {
    }

    public RagService(
        ApplicationDbContext context,
        ICurrentTenantService currentTenantService,
        IEmbeddingService embeddingService,
        ILlmService llmService,
        ILogger<RagService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _currentTenantService = currentTenantService ?? throw new ArgumentNullException(nameof(currentTenantService));
        _embeddingService = embeddingService ?? throw new ArgumentNullException(nameof(embeddingService));
        _llmService = llmService ?? throw new ArgumentNullException(nameof(llmService));
        _logger = logger ?? Microsoft.Extensions.Logging.Abstractions.NullLogger<RagService>.Instance;
    }

    public async Task<RagSearchResponseDto> SearchAndSynthesizeAsync(string query, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(query);
        if (!_currentTenantService.HasTenant)
        {
            throw new UnauthorizedAccessException("A tenant context is required.");
        }

        var cleanQuery = query.Trim().ToLowerInvariant();

        // 1. Detección de saludos e intenciones de cortesía
        var greetings = new[] { "hola", "buenas", "buenos dias", "buenos días", "buenas tardes", "buenas noches", "saludos", "hi", "hello", "buen dia", "buen día" };
        if (greetings.Any(g => cleanQuery == g || cleanQuery.StartsWith(g + " ") || cleanQuery.StartsWith(g + ",") || cleanQuery.StartsWith(g + "!")))
        {
            return new RagSearchResponseDto(
                true,
                "Hola. Soy tu copiloto de atencion. Preguntame sobre envios, politicas de garantia, pagos o servicios. Si necesitas radicar una peticion, queja o reclamo formal, puedes usar la pestana 'Radicar PQRS' de la cabecera.",
                1.0,
                new List<Guid>());
        }

        // 2. Recuperación Híbrida: Búsqueda de Texto Directo
        var allArticles = await _context.KnowledgeBaseArticles
            .AsNoTracking()
            .Where(a => a.IsActive)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        var terms = cleanQuery.Split(new[] { ' ', ',', '.', '?', '¿', '!', '¡' }, StringSplitOptions.RemoveEmptyEntries);
        var relevantArticles = allArticles
            .Where(a => terms.Any(t => t.Length > 2 && (a.Title.ToLower().Contains(t) || a.Content.ToLower().Contains(t))))
            .Take(4)
            .ToList();

        // Si la búsqueda por texto no encontró suficientes coincidencias, complementar con búsqueda vectorial
        if (relevantArticles.Count < 2)
        {
            try
            {
                var queryVector = await _embeddingService.GenerateEmbeddingAsync(query.Trim(), cancellationToken).ConfigureAwait(false);
                var vectorMatches = await _context.KnowledgeBaseArticles
                    .AsNoTracking()
                    .Where(a => a.IsActive)
                    .Select(a => new
                    {
                        Article = a,
                        Distance = a.Vector.CosineDistance(queryVector)
                    })
                    .OrderBy(m => m.Distance)
                    .Take(3)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                foreach (var vm in vectorMatches)
                {
                    if (relevantArticles.All(r => r.Id != vm.Article.Id))
                    {
                        relevantArticles.Add(vm.Article);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Fallo al generar embedding vectorial. Continuando con contexto base.");
            }
        }

        // 3. Ensamblar Contexto Completo
        var articlesText = relevantArticles.Count > 0
            ? string.Join("\n---\n", relevantArticles.Select(a => $"Título: {a.Title}\nContenido: {a.Content}"))
            : "No hay artículos específicos adicionales.";

        var fullContext = $"{BaseCompanyContext}\n\nArtículos de Soporte:\n{articlesText}";

        var systemPrompt = @"Eres el Copiloto Virtual y Asesor Oficial de Atención al Cliente de la empresa.
Tu misión es resolver las dudas del usuario de manera amigable, concreta, empática y explicativa.
Utiliza el siguiente contexto oficial de la empresa:
---------------------
" + fullContext + @"
---------------------
Reglas:
- Si la información está en el contexto, respóndele paso a paso con claridad y empatía.
- Si el usuario requiere un trámite humano formal, un cobro no autorizado o un caso particular no cubierto, oriéntalo amablemente a abrir la pestaña 'Radicar PQRS' de la cabecera.
- Mantén las respuestas en un tono conciso y humano (2 a 4 oraciones).";

        try
        {
            var answer = await _llmService.CompleteAsync(systemPrompt, $"Consulta del usuario: {query.Trim()}", false, cancellationToken).ConfigureAwait(false);
            return new RagSearchResponseDto(
                true,
                answer,
                relevantArticles.Count > 0 ? 0.9 : 0.6,
                relevantArticles.Select(a => a.Id).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al invocar el LLM.");
            return new RagSearchResponseDto(
                true,
                "Para compras y entregas disponemos de cobertura nacional (2 a 5 días hábiles) y 30 días de garantía. Si requieres gestionar un caso particular, puedes radicar tu solicitud en la pestaña 'Radicar PQRS'.",
                0.5,
                relevantArticles.Select(a => a.Id).ToList());
        }
    }

    public async Task RecordDeflectionAsync(IEnumerable<Guid>? articleIds, CancellationToken cancellationToken = default)
    {
        if (!_currentTenantService.HasTenant || !_currentTenantService.TenantId.HasValue)
        {
            throw new UnauthorizedAccessException("A tenant context is required.");
        }

        var deflection = new RagDeflection(
            _currentTenantService.TenantId.Value,
            articleIds);

        _context.RagDeflections.Add(deflection);
        await _context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}
