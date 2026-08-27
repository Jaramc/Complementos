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
    private const string DemoEmail = "admin@demo.com";
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHostEnvironment _environment;

    public DatabaseSeederHostedService(IServiceScopeFactory scopeFactory, IHostEnvironment environment)
    {
        _scopeFactory = scopeFactory ?? throw new ArgumentNullException(nameof(scopeFactory));
        _environment = environment ?? throw new ArgumentNullException(nameof(environment));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_environment.IsDevelopment())
        {
            return;
        }

        await using var scope = _scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var apiKeyHash = TenantStore.HashApiKey(DemoApiKey);
        var tenant = await dbContext.Tenants.SingleOrDefaultAsync(candidate => candidate.ApiKey == apiKeyHash, stoppingToken).ConfigureAwait(false);
        if (tenant is null)
        {
            tenant = new Tenant("Empresa Demo", new[] { "http://localhost:8080" }, apiKeyHash);
            dbContext.Tenants.Add(tenant);
            await dbContext.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
        }

        currentTenantService.SetTenant(tenant.Id, tenant.Name, string.Join(',', tenant.AllowedOrigins));

        var userExists = await dbContext.Users.IgnoreQueryFilters().AnyAsync(
            user => user.TenantId == tenant.Id && user.Email == DemoEmail,
            stoppingToken).ConfigureAwait(false);
        if (!userExists)
        {
            dbContext.Users.Add(new User(tenant.Id, DemoEmail, passwordHasher.Hash("Admin123*"), UserRole.Admin));
            await dbContext.SaveChangesAsync(stoppingToken).ConfigureAwait(false);
        }
    }
}
