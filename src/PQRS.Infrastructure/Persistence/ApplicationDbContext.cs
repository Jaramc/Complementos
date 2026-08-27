using System.Linq.Expressions;
using System.Security;
using Microsoft.EntityFrameworkCore;
using PQRS.Application.Common.Interfaces;
using PQRS.Domain.Common;
using PQRS.Domain.Entities;
using Pgvector.EntityFrameworkCore;

namespace PQRS.Infrastructure.Persistence;

public sealed class ApplicationDbContext : DbContext
{
    private readonly ICurrentTenantService _currentTenantService;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentTenantService currentTenantService)
        : base(options)
    {
        _currentTenantService = currentTenantService ?? throw new ArgumentNullException(nameof(currentTenantService));
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();

    public DbSet<User> Users => Set<User>();

    public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles => Set<KnowledgeBaseArticle>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<RagDeflection> RagDeflections => Set<RagDeflection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasPostgresExtension("vector");
        ConfigureTenant(modelBuilder);
        ConfigureUser(modelBuilder);
        ConfigureKnowledgeBaseArticle(modelBuilder);
        ConfigureTicket(modelBuilder);
        ConfigureRagDeflection(modelBuilder);
        ApplyTenantFilters(modelBuilder);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ValidateTenantBoundChanges();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override int SaveChanges()
    {
        return SaveChanges(true);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return SaveChangesAsync(true, cancellationToken);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ValidateTenantBoundChanges();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ValidateTenantBoundChanges()
    {
        var tenantEntries = ChangeTracker.Entries()
            .Where(entry => entry.Entity is ITenantEntity && entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .Select(entry => (Entry: entry, Entity: (ITenantEntity)entry.Entity))
            .ToArray();

        if (tenantEntries.Length == 0)
        {
            return;
        }

        if (!_currentTenantService.HasTenant || !_currentTenantService.TenantId.HasValue)
        {
            throw new SecurityException("A tenant context is required to persist tenant-bound entities.");
        }

        var activeTenantId = _currentTenantService.TenantId.Value;
        foreach (var tenantEntry in tenantEntries)
        {
            if (tenantEntry.Entry.State == EntityState.Added && tenantEntry.Entity.TenantId == Guid.Empty)
            {
                tenantEntry.Entity.TenantId = activeTenantId;
            }

            if (tenantEntry.Entity.TenantId != activeTenantId)
            {
                throw new SecurityException("The entity tenant does not match the active tenant.");
            }
        }
    }

    private void ApplyTenantFilters(ModelBuilder modelBuilder)
    {
        var entityTypes = modelBuilder.Model.GetEntityTypes()
            .Where(entityType => typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType));

        foreach (var entityType in entityTypes)
        {
            var entityParameter = Expression.Parameter(entityType.ClrType, "entity");
            var tenantId = Expression.Property(entityParameter, nameof(ITenantEntity.TenantId));
            var context = Expression.Constant(this);
            var hasTenant = Expression.Property(context, nameof(HasCurrentTenant));
            var currentTenantId = Expression.Property(context, nameof(CurrentTenantId));
            var tenantMatches = Expression.Equal(Expression.Convert(tenantId, typeof(Guid?)), currentTenantId);
            var filter = Expression.Lambda(Expression.AndAlso(hasTenant, tenantMatches), entityParameter);

            entityType.SetQueryFilter(filter);
        }
    }

    private bool HasCurrentTenant => _currentTenantService.HasTenant;

    private Guid? CurrentTenantId => _currentTenantService.TenantId;

    private static void ConfigureTenant(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(tenant => tenant.Id);
            entity.Property(tenant => tenant.Name).HasMaxLength(200).IsRequired();
            entity.Property(tenant => tenant.ApiKey).HasMaxLength(256).IsRequired();
            entity.Property(tenant => tenant.AllowedOrigins).HasColumnType("text[]").IsRequired();
            entity.HasIndex(tenant => tenant.ApiKey).IsUnique();
        });
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.Property(user => user.Email).HasMaxLength(320).IsRequired();
            entity.Property(user => user.PasswordHash).HasMaxLength(512).IsRequired();
            entity.Property(user => user.Role).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(user => user.IsActive).IsRequired();
            entity.HasIndex(user => new { user.TenantId, user.Email }).IsUnique();
        });
    }

    private void ConfigureKnowledgeBaseArticle(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<KnowledgeBaseArticle>(entity =>
        {
            entity.HasKey(article => article.Id);
            entity.Property(article => article.Title).HasMaxLength(300).IsRequired();
            entity.Property(article => article.Content).IsRequired();
            if (Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory")
            {
                entity.Ignore(article => article.Vector);
            }
            else
            {
                entity.Property(article => article.Vector).HasColumnType("vector(1536)").IsRequired();
            }
            entity.HasIndex(article => article.TenantId);
        });
    }

    private static void ConfigureTicket(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(ticket => ticket.Id);
            entity.Property(ticket => ticket.TrackingNumber).HasMaxLength(100).IsRequired();
            entity.Property(ticket => ticket.CustomerName).HasMaxLength(200).IsRequired();
            entity.Property(ticket => ticket.CustomerEmail).HasMaxLength(320).IsRequired();
            entity.Property(ticket => ticket.Subject).HasMaxLength(300).IsRequired();
            entity.Property(ticket => ticket.Description).IsRequired();
            entity.Property(ticket => ticket.Type).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(ticket => ticket.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(ticket => ticket.Priority).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(ticket => ticket.Sentiment).HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(ticket => ticket.Summary).HasMaxLength(2000);
            entity.HasIndex(ticket => new { ticket.TenantId, ticket.TrackingNumber }).IsUnique();
            entity.HasIndex(ticket => new { ticket.TenantId, ticket.Status });
            entity.HasIndex(ticket => new { ticket.TenantId, ticket.Priority });
        });
    }

    private void ConfigureRagDeflection(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RagDeflection>(entity =>
        {
            entity.HasKey(deflection => deflection.Id);
            if (Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
            {
                entity.Property(deflection => deflection.ArticleIds).HasColumnType("uuid[]").IsRequired();
            }
            else
            {
                entity.Property(deflection => deflection.ArticleIds).IsRequired();
            }
            entity.HasIndex(deflection => deflection.TenantId);
            entity.HasIndex(deflection => deflection.CreatedAtUtc);
        });
    }
}
