using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PQRS.Application.Common.Interfaces;
using PQRS.Domain.Entities;
using PQRS.Domain.Enums;
using PQRS.Infrastructure.Persistence;

namespace PQRS.Infrastructure.Services;

public sealed class DatabaseSeederHostedService : BackgroundService
{
    private const string DemoApiKey = "demo-api-key";
    private const string AdminEmail = "Ximenajaramc@jaramc.com";
    private const string AdminPassword = "Xmnjaramc";
    private readonly IServiceScopeFactory _scopeFactory;

    public DatabaseSeederHostedService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory ?? throw new ArgumentNullException(nameof(scopeFactory));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var apiKeyHash = TenantStore.HashApiKey(DemoApiKey);
        var tenant = await dbContext.Tenants.SingleOrDefaultAsync(candidate => candidate.ApiKey == apiKeyHash, stoppingToken).ConfigureAwait(false);
        if (tenant is null)
        {
            tenant = new Tenant("Empresa Demo", new[] { "http://localhost:8080", "https://pqrs.jaramc.dev", "https://support.jaramc.dev" }, apiKeyHash);
            dbContext.Tenants.Add(tenant);
            await dbContext.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
        }

        currentTenantService.SetTenant(tenant.Id, tenant.Name, string.Join(',', tenant.AllowedOrigins));

        var user = await dbContext.Users.IgnoreQueryFilters().SingleOrDefaultAsync(
            u => u.TenantId == tenant.Id && u.Email.ToLower() == AdminEmail.ToLower(),
            stoppingToken).ConfigureAwait(false);

        if (user is null)
        {
            dbContext.Users.Add(new User(tenant.Id, AdminEmail, passwordHasher.Hash(AdminPassword), UserRole.Admin));
            await dbContext.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
        }
        else
        {
            user.UpdatePassword(passwordHasher.Hash(AdminPassword));
            await dbContext.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
        }
    }
}
