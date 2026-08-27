using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PQRS.Application.Common.Interfaces;
using PQRS.Infrastructure.Services;

namespace PQRS.Infrastructure.Middleware;

public sealed class TenantResolutionMiddleware
{
    private static readonly string[] BypassedPaths =
    [
        "/health",
        "/swagger",
        "/api/v1/auth/login"
    ];

    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
    }

    public async Task InvokeAsync(
        HttpContext context,
        ICurrentTenantService currentTenantService,
        ITenantStore tenantStore)
    {
        if (IsBypassed(context.Request.Path))
        {
            await _next(context).ConfigureAwait(false);
            return;
        }

        var resolution = await ResolveTenantAsync(context, tenantStore, context.RequestAborted).ConfigureAwait(false);
        if (resolution.Tenant is null)
        {
            await WriteProblemAsync(context, resolution.StatusCode, resolution.Title, resolution.Detail).ConfigureAwait(false);
            return;
        }

        currentTenantService.SetTenant(
            resolution.Tenant.Id,
            resolution.Tenant.Name,
            string.Join(',', resolution.Tenant.AllowedOrigins));

        await _next(context).ConfigureAwait(false);
    }

    private static async Task<(PQRS.Domain.Entities.Tenant? Tenant, int StatusCode, string Title, string Detail)> ResolveTenantAsync(
        HttpContext context,
        ITenantStore tenantStore,
        CancellationToken cancellationToken)
    {
        var isAuthenticated = context.User.Identity?.IsAuthenticated == true;
        var tenantClaim = context.User.FindFirstValue("tenant_id");
        if (isAuthenticated)
        {
            if (!Guid.TryParse(tenantClaim, out var tenantId))
            {
                return (null, StatusCodes.Status403Forbidden, "Tenant context forbidden", "The authenticated identity has no valid tenant_id claim.");
            }

            var tenant = await tenantStore.GetActiveByIdAsync(tenantId, cancellationToken).ConfigureAwait(false);
            return tenant is null
                ? (null, StatusCodes.Status403Forbidden, "Tenant context forbidden", "The tenant is missing or inactive.")
                : (tenant, 0, string.Empty, string.Empty);
        }

        var tenantHeader = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(tenantHeader))
        {
            if (!Guid.TryParse(tenantHeader, out var tenantId))
            {
                return (null, StatusCodes.Status401Unauthorized, "Tenant authentication required", "The X-Tenant-Id header is not a valid GUID.");
            }

            var tenant = await tenantStore.GetActiveByIdAsync(tenantId, cancellationToken).ConfigureAwait(false);
            return tenant is null
                ? (null, StatusCodes.Status403Forbidden, "Tenant access forbidden", "The tenant is missing or inactive.")
                : (tenant, 0, string.Empty, string.Empty);
        }

        var apiKey = context.Request.Headers["X-API-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return (null, StatusCodes.Status401Unauthorized, "Tenant authentication required", "Provide a tenant_id claim, X-Tenant-Id, or X-API-Key.");
        }

        var apiKeyHash = TenantStore.HashApiKey(apiKey);
        var tenantByApiKey = await tenantStore.GetActiveByApiKeyHashAsync(apiKeyHash, cancellationToken).ConfigureAwait(false);
        return tenantByApiKey is null
            ? (null, StatusCodes.Status401Unauthorized, "Tenant authentication failed", "The X-API-Key is invalid or inactive.")
            : (tenantByApiKey, 0, string.Empty, string.Empty);
    }

    private static bool IsBypassed(PathString path)
    {
        var pathValue = path.Value ?? string.Empty;
        return BypassedPaths.Any(bypassedPath =>
            pathValue.Equals(bypassedPath, StringComparison.OrdinalIgnoreCase)
            || pathValue.StartsWith($"{bypassedPath}/", StringComparison.OrdinalIgnoreCase));
    }

    private static async Task WriteProblemAsync(HttpContext context, int statusCode, string title, string detail)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";
        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem), context.RequestAborted).ConfigureAwait(false);
    }
}
