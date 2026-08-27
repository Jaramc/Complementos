using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using PQRS.Infrastructure.Persistence;

namespace PQRS.Infrastructure.Services;

public sealed class TenantStore : ITenantStore
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);
    private readonly ApplicationDbContext _dbContext;
    private readonly IMemoryCache _cache;

    public TenantStore(ApplicationDbContext dbContext, IMemoryCache cache)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
    }

    public Task<PQRS.Domain.Entities.Tenant?> GetActiveByIdAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty)
        {
            return Task.FromResult<PQRS.Domain.Entities.Tenant?>(null);
        }

        return GetOrCreateAsync($"tenant:id:{tenantId:N}", cancellationToken, () =>
            _dbContext.Tenants.AsNoTracking().SingleOrDefaultAsync(
                tenant => tenant.Id == tenantId && tenant.IsActive,
                cancellationToken));
    }

    public Task<PQRS.Domain.Entities.Tenant?> GetActiveByApiKeyHashAsync(string apiKeyHash, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(apiKeyHash))
        {
            return Task.FromResult<PQRS.Domain.Entities.Tenant?>(null);
        }

        return GetOrCreateAsync($"tenant:key:{apiKeyHash}", cancellationToken, () =>
            _dbContext.Tenants.AsNoTracking().SingleOrDefaultAsync(
                tenant => tenant.ApiKey == apiKeyHash && tenant.IsActive,
                cancellationToken));
    }

    public static string HashApiKey(string apiKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(apiKey);
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(apiKey.Trim()));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private async Task<PQRS.Domain.Entities.Tenant?> GetOrCreateAsync(
        string cacheKey,
        CancellationToken cancellationToken,
        Func<Task<PQRS.Domain.Entities.Tenant?>> factory)
    {
        if (_cache.TryGetValue(cacheKey, out PQRS.Domain.Entities.Tenant? tenant))
        {
            return tenant;
        }

        tenant = await factory().ConfigureAwait(false);
        _cache.Set(cacheKey, tenant, CacheDuration);

        return tenant;
    }
}
