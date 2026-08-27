using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace PQRS.Infrastructure.Services;

public interface ITenantCorsPolicyProvider : ICorsPolicyProvider
{
}

public sealed class TenantCorsPolicyProvider : ITenantCorsPolicyProvider
{
    private static readonly HashSet<string> FallbackOrigins = new(StringComparer.OrdinalIgnoreCase)
    {
        "http://localhost:5173",
        "http://localhost:3000"
    };

    public async Task<CorsPolicy?> GetPolicyAsync(HttpContext context, string? policyName)
    {
        ArgumentNullException.ThrowIfNull(context);

        var origin = context.Request.Headers.Origin.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(origin))
        {
            return BuildFallbackPolicy();
        }

        var normalizedOrigin = origin.Trim().TrimEnd('/');
        if (FallbackOrigins.Contains(normalizedOrigin))
        {
            return BuildPolicy(origin);
        }

        var tenantStore = context.RequestServices.GetService<ITenantStore>();
        if (tenantStore is not null)
        {
            var tenant = await tenantStore.GetActiveByOriginAsync(normalizedOrigin, context.RequestAborted).ConfigureAwait(false);
            if (tenant is not null)
            {
                return BuildPolicy(origin);
            }
        }

        return null;
    }

    private static CorsPolicy BuildPolicy(string origin)
    {
        return new CorsPolicyBuilder()
            .WithOrigins(origin)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .Build();
    }

    private static CorsPolicy BuildFallbackPolicy()
    {
        return new CorsPolicyBuilder()
            .WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .Build();
    }
}
