using System.Security.Claims;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace PQRS.Infrastructure.Services;

public interface ITenantCorsPolicyProvider : ICorsPolicyProvider
{
}

public sealed class TenantCorsPolicyProvider : ITenantCorsPolicyProvider
{
    private static readonly string[] FallbackOrigins = ["http://localhost:5173", "http://localhost:3000"];

    private static readonly CorsPolicy FallbackPolicy = new CorsPolicyBuilder()
        .WithOrigins(FallbackOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        .Build();

    public async Task<CorsPolicy?> GetPolicyAsync(HttpContext context, string? policyName)
    {
        ArgumentNullException.ThrowIfNull(context);

        var tenantStore = context.RequestServices.GetService<ITenantStore>();
        if (tenantStore is null)
        {
            return FallbackPolicy;
        }

        var cancellationToken = context.RequestAborted;

        var tenantHeader = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(tenantHeader) && Guid.TryParse(tenantHeader, out var tenantId))
        {
            var tenant = await tenantStore.GetActiveByIdAsync(tenantId, cancellationToken).ConfigureAwait(false);
            if (tenant is not null)
            {
                return BuildPolicy(tenant.AllowedOrigins);
            }
        }

        var apiKey = context.Request.Headers["X-API-Key"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            var apiKeyHash = TenantStore.HashApiKey(apiKey);
            var tenant = await tenantStore.GetActiveByApiKeyHashAsync(apiKeyHash, cancellationToken).ConfigureAwait(false);
            if (tenant is not null)
            {
                return BuildPolicy(tenant.AllowedOrigins);
            }
        }

        var tenantClaim = context.User?.FindFirstValue("tenant_id");
        if (!string.IsNullOrWhiteSpace(tenantClaim) && Guid.TryParse(tenantClaim, out var claimTenantId))
        {
            var tenant = await tenantStore.GetActiveByIdAsync(claimTenantId, cancellationToken).ConfigureAwait(false);
            if (tenant is not null)
            {
                return BuildPolicy(tenant.AllowedOrigins);
            }
        }

        return FallbackPolicy;
    }

    private static CorsPolicy BuildPolicy(IEnumerable<string> allowedOrigins)
    {
        var origins = allowedOrigins
            .Concat(FallbackOrigins)
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return new CorsPolicyBuilder()
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .Build();
    }
}
