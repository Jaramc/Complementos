using Microsoft.EntityFrameworkCore;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.KnowledgeBase;
using PQRS.Domain.Entities;
using PQRS.Infrastructure.Persistence;
using Pgvector;

namespace PQRS.Infrastructure.Services;

public sealed class KnowledgeBaseService : IKnowledgeBaseService
{
    private const int EmbeddingDimensions = 1536;
    private readonly ApplicationDbContext _dbContext;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IEmbeddingService _embeddingService;

    public KnowledgeBaseService(ApplicationDbContext dbContext, ICurrentTenantService currentTenantService, IEmbeddingService embeddingService)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _currentTenantService = currentTenantService ?? throw new ArgumentNullException(nameof(currentTenantService));
        _embeddingService = embeddingService ?? throw new ArgumentNullException(nameof(embeddingService));
    }

    public async Task<IReadOnlyList<KbArticleResponseDto>> ListAsync(CancellationToken cancellationToken)
    {
        EnsureTenant();
        return await _dbContext.KnowledgeBaseArticles.AsNoTracking().OrderByDescending(article => article.CreatedAtUtc)
            .Select(article => ToResponse(article)).ToListAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<KbArticleResponseDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        EnsureTenant();
        return await _dbContext.KnowledgeBaseArticles.AsNoTracking().Where(article => article.Id == id)
            .Select(article => ToResponse(article)).SingleOrDefaultAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<KbArticleResponseDto> CreateAsync(CreateKbArticleDto request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var tenantId = EnsureTenant();
        var title = RequireText(request.Title, nameof(request.Title));
        var content = RequireText(request.Content, nameof(request.Content));
        var vector = await GenerateVectorAsync(title, content, cancellationToken).ConfigureAwait(false);
        var article = new KnowledgeBaseArticle(tenantId, title, content, vector);
        _dbContext.KnowledgeBaseArticles.Add(article);
        await _dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return ToResponse(article);
    }

    public async Task<KbArticleResponseDto?> UpdateAsync(Guid id, UpdateKbArticleDto request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        EnsureTenant();
        var article = await _dbContext.KnowledgeBaseArticles.SingleOrDefaultAsync(article => article.Id == id, cancellationToken).ConfigureAwait(false);
        if (article is null)
        {
            return null;
        }

        var title = RequireText(request.Title, nameof(request.Title));
        var content = RequireText(request.Content, nameof(request.Content));
        var vector = await GenerateVectorAsync(title, content, cancellationToken).ConfigureAwait(false);
        article.Update(title, content, vector, request.IsActive);
        await _dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return ToResponse(article);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        EnsureTenant();
        var article = await _dbContext.KnowledgeBaseArticles.SingleOrDefaultAsync(article => article.Id == id, cancellationToken).ConfigureAwait(false);
        if (article is null)
        {
            return false;
        }

        _dbContext.KnowledgeBaseArticles.Remove(article);
        await _dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return true;
    }

    private async Task<Vector> GenerateVectorAsync(string title, string content, CancellationToken cancellationToken)
    {
        var vector = await _embeddingService.GenerateEmbeddingAsync($"{title}\n{content}", cancellationToken).ConfigureAwait(false);
        if (vector.ToArray().Length != EmbeddingDimensions)
        {
            throw new InvalidOperationException($"Embedding must contain exactly {EmbeddingDimensions} dimensions.");
        }

        return vector;
    }

    private Guid EnsureTenant() => _currentTenantService.TenantId is { } tenantId && tenantId != Guid.Empty
        ? tenantId
        : throw new UnauthorizedAccessException("A tenant context is required.");

    private static KbArticleResponseDto ToResponse(KnowledgeBaseArticle article) =>
        new(article.Id, article.TenantId, article.Title, article.Content, article.IsActive, article.CreatedAtUtc);

    private static string RequireText(string value, string parameterName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, parameterName);
        return value.Trim();
    }
}
