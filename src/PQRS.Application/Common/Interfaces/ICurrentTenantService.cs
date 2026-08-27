namespace PQRS.Application.Common.Interfaces;

public interface ICurrentTenantService
{
    Guid? TenantId { get; }

    string? TenantName { get; }

    string? AllowedOrigins { get; }

    bool HasTenant { get; }

    void SetTenant(Guid tenantId, string? name = null, string? allowedOrigins = null);
}
