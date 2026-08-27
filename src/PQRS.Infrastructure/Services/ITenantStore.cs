using PQRS.Domain.Entities;

namespace PQRS.Infrastructure.Services;

public interface ITenantStore
{
    Task<Tenant?> GetActiveByIdAsync(Guid tenantId, CancellationToken cancellationToken = default);

    Task<Tenant?> GetActiveByApiKeyHashAsync(string apiKeyHash, CancellationToken cancellationToken = default);

    Task<Tenant?> GetActiveByOriginAsync(string origin, CancellationToken cancellationToken = default);
}
