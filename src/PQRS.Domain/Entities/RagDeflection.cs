using PQRS.Domain.Common;

namespace PQRS.Domain.Entities;

public sealed class RagDeflection : ITenantEntity
{
    private RagDeflection()
    {
    }

    public RagDeflection(Guid tenantId, IEnumerable<Guid>? articleIds = null)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        ArticleIds = articleIds?.ToArray() ?? Array.Empty<Guid>();
        CreatedAtUtc = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid TenantId { get; set; }

    public Guid[] ArticleIds { get; private set; } = Array.Empty<Guid>();

    public DateTime CreatedAtUtc { get; private set; }
}
