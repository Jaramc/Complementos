using System.Text;
using Microsoft.EntityFrameworkCore;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.Rag;
using PQRS.Infrastructure.Persistence;
using Pgvector;
using Pgvector.EntityFrameworkCore;

namespace PQRS.Infrastructure.Services;

public sealed class RagService : IRagService
{
    private const double DistanceThreshold = 0.35;
    private const int MaxArticles = 3;
    private readonly ApplicationDbContext _context;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IEmbeddingService _embeddingService;
    private readonly ILlmService _llmService;

    public RagService(ApplicationDbContext context, ICurrentTenantService currentTenantService, IEmbeddingService embeddingService, ILlmService llmService)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _currentTenantService = currentTenantService ?? throw new ArgumentNullException(nameof(currentTenantService));
        _embeddingService = embeddingService ?? throw new ArgumentNullException(nameof(embeddingService));
        _llmService = llmService ?? throw new ArgumentNullException(nameof(llmService));
    }

    public async Task<RagSearchResponseDto> SearchAndSynthesizeAsync(string query, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(query);
        if (!_currentTenantService.HasTenant)
        {
            throw new UnauthorizedAccessException("A tenant context is required.");
        }

        var queryVector = await _embeddingService.GenerateEmbeddingAsync(query.Trim(), cancellationToken).ConfigureAwait(false);
        var matches = await _context.KnowledgeBaseArticles
            .AsNoTracking()
            .Where(article => article.IsActive)
            .Select(article => new
            {
                Article = article,
                Distance = article.Vector.CosineDistance(queryVector)
            })
            .OrderBy(match => match.Distance)
            .Take(MaxArticles)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        if (matches.Count == 0 || matches[0].Distance > DistanceThreshold)
        {
            return new RagSearchResponseDto(false, null, matches.Count == 0 ? 0 : Math.Max(0, 1 - matches[0].Distance), matches.Select(match => match.Article.Id).ToList());
        }

        var context = new StringBuilder();
        foreach (var match in matches)
        {
            context.Append("[Article ").Append(match.Article.Id).Append("]\n")
                .Append(match.Article.Title).Append("\n")
                .Append(match.Article.Content).Append("\n\n");
        }

        var answer = await _llmService.CompleteAsync(
            "Answer only from the supplied knowledge base context. If the context does not contain the answer, say that there is insufficient information.",
            $"Question:\n{query.Trim()}\n\nKnowledge base context:\n{context}",
            cancellationToken: cancellationToken).ConfigureAwait(false);

        return new RagSearchResponseDto(true, answer, Math.Max(0, 1 - matches[0].Distance), matches.Select(match => match.Article.Id).ToList());
    }
}
