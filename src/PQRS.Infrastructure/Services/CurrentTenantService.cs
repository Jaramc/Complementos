using PQRS.Application.Common.Interfaces;

namespace PQRS.Infrastructure.Services;

public sealed class CurrentTenantService : ICurrentTenantService
{
    public Guid? TenantId { get; private set; }

    public string? TenantName { get; private set; }

    public string? AllowedOrigins { get; private set; }

    public bool HasTenant => TenantId.HasValue;

    public void SetTenant(Guid tenantId, string? name = null, string? allowedOrigins = null)
    {
        if (tenantId == Guid.Empty)
        {
            throw new ArgumentException("TenantId must not be empty.", nameof(tenantId));
        }

        TenantId = tenantId;
        TenantName = name;
        AllowedOrigins = allowedOrigins;
    }

    public void ClearTenant()
    {
        TenantId = null;
        TenantName = null;
        AllowedOrigins = null;
    }
}
