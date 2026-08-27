using Pgvector;
using PQRS.Domain.Common;

namespace PQRS.Domain.Entities;

public sealed class KnowledgeBaseArticle : ITenantEntity
{
    private KnowledgeBaseArticle()
    {
    }

    public KnowledgeBaseArticle(Guid tenantId, string title, string content, Vector vector)
    {
        TenantId = RequireTenant(tenantId);
        Title = RequireText(title, nameof(title));
        Content = RequireText(content, nameof(content));
        Vector = vector ?? throw new ArgumentNullException(nameof(vector));
        Id = Guid.NewGuid();
        IsActive = true;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid TenantId { get; set; }

    public string Title { get; private set; } = string.Empty;

    public string Content { get; private set; } = string.Empty;

    public Vector Vector { get; private set; } = null!;

    public bool IsActive { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    public void Update(string title, string content, Vector vector, bool isActive)
    {
        Title = RequireText(title, nameof(title));
        Content = RequireText(content, nameof(content));
        Vector = vector ?? throw new ArgumentNullException(nameof(vector));
        IsActive = isActive;
    }

    private static Guid RequireTenant(Guid tenantId) => tenantId == Guid.Empty
        ? throw new ArgumentException("TenantId must not be empty.", nameof(tenantId))
        : tenantId;

    private static string RequireText(string value, string parameterName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, parameterName);
        return value.Trim();
    }
}
