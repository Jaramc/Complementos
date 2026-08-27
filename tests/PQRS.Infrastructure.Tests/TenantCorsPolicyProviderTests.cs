using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using PQRS.Domain.Entities;
using PQRS.Infrastructure.Services;
using Xunit;

namespace PQRS.Infrastructure.Tests;

public sealed class TenantCorsPolicyProviderTests
{
    [Fact]
    public async Task GetPolicyAsync_WithTenantAllowedOrigin_ReturnsMatchingPolicy()
    {
        var tenantStore = new Mock<ITenantStore>(MockBehavior.Strict);
        var tenant = new Tenant("Test Tenant", new[] { "https://portal.empresa.com" }, "api-key-123");
        tenantStore.Setup(s => s.GetActiveByOriginAsync("https://portal.empresa.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        var services = new ServiceCollection();
        services.AddSingleton(tenantStore.Object);
        var serviceProvider = services.BuildServiceProvider();

        var context = new DefaultHttpContext
        {
            RequestServices = serviceProvider
        };
        context.Request.Headers.Origin = "https://portal.empresa.com";

        var provider = new TenantCorsPolicyProvider();
        var policy = await provider.GetPolicyAsync(context, null);

        Assert.NotNull(policy);
        Assert.Contains("https://portal.empresa.com", policy.Origins);
        Assert.True(policy.SupportsCredentials);
        Assert.True(policy.AllowAnyHeader);
        Assert.True(policy.AllowAnyMethod);
    }

    [Fact]
    public async Task GetPolicyAsync_WithLocalhostFallbackOrigin_ReturnsPolicyWithoutTenantLookup()
    {
        var tenantStore = new Mock<ITenantStore>(MockBehavior.Strict);
        var services = new ServiceCollection();
        services.AddSingleton(tenantStore.Object);
        var serviceProvider = services.BuildServiceProvider();

        var context = new DefaultHttpContext
        {
            RequestServices = serviceProvider
        };
        context.Request.Headers.Origin = "http://localhost:5173";

        var provider = new TenantCorsPolicyProvider();
        var policy = await provider.GetPolicyAsync(context, null);

        Assert.NotNull(policy);
        Assert.Contains("http://localhost:5173", policy.Origins);
        tenantStore.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task GetPolicyAsync_WithUnknownOrigin_ReturnsNullToRejectPreflight()
    {
        var tenantStore = new Mock<ITenantStore>(MockBehavior.Strict);
        tenantStore.Setup(s => s.GetActiveByOriginAsync("https://malicious-site.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant?)null);

        var services = new ServiceCollection();
        services.AddSingleton(tenantStore.Object);
        var serviceProvider = services.BuildServiceProvider();

        var context = new DefaultHttpContext
        {
            RequestServices = serviceProvider
        };
        context.Request.Headers.Origin = "https://malicious-site.com";

        var provider = new TenantCorsPolicyProvider();
        var policy = await provider.GetPolicyAsync(context, null);

        Assert.Null(policy);
    }

    [Fact]
    public async Task GetPolicyAsync_WithoutOriginHeader_ReturnsFallbackPolicy()
    {
        var context = new DefaultHttpContext();
        var provider = new TenantCorsPolicyProvider();
        var policy = await provider.GetPolicyAsync(context, null);

        Assert.NotNull(policy);
        Assert.Contains("http://localhost:5173", policy.Origins);
        Assert.Contains("http://localhost:3000", policy.Origins);
    }
}
