using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using PQRS.Application.Common.Interfaces;
using Pgvector.EntityFrameworkCore;

namespace PQRS.Infrastructure.Persistence;

public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(GetConnectionString(), npgsql => npgsql.UseVector());

        return new ApplicationDbContext(optionsBuilder.Options, new DesignTimeTenantService());
    }

    private static string GetConnectionString()
    {
        return Environment.GetEnvironmentVariable("PQRS_CONNECTION_STRING")
            ?? "Host=localhost;Port=5432;Database=pqrs;Username=pqrs_app;Password=local-development-password";
    }

    private sealed class DesignTimeTenantService : ICurrentTenantService
    {
        public Guid? TenantId => null;

        public string? TenantName => null;

        public string? AllowedOrigins => null;

        public bool HasTenant => false;

        public void SetTenant(Guid tenantId, string? name = null, string? allowedOrigins = null)
        {
            throw new InvalidOperationException("The design-time tenant service cannot be changed.");
        }
    }
}
