using System.Security;
using Microsoft.EntityFrameworkCore;
using Moq;
using PQRS.Application.Common.Interfaces;
using PQRS.Domain.Entities;
using PQRS.Infrastructure.Persistence;
using PQRS.Infrastructure.Services;
using Xunit;

namespace PQRS.Infrastructure.Tests;

public sealed class RagDeflectionsTests
{
    [Fact]
    public async Task RecordDeflectionAsync_PersistsDeflectionForActiveTenant()
    {
        var tenantId = Guid.NewGuid();
        var databaseName = Guid.NewGuid().ToString();
        var tenantService = new CurrentTenantService();
        tenantService.SetTenant(tenantId);

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        await using var context = new ApplicationDbContext(options, tenantService);
        var embeddingService = new Mock<IEmbeddingService>();
        var llmService = new Mock<ILlmService>();
        var ragService = new RagService(context, tenantService, embeddingService.Object, llmService.Object);

        var articleId1 = Guid.NewGuid();
        var articleId2 = Guid.NewGuid();

        await ragService.RecordDeflectionAsync(new[] { articleId1, articleId2 });

        var deflections = await context.RagDeflections.ToListAsync();
        Assert.Single(deflections);
        Assert.Equal(tenantId, deflections[0].TenantId);
        Assert.Equal(2, deflections[0].ArticleIds.Length);
        Assert.Contains(articleId1, deflections[0].ArticleIds);
        Assert.Contains(articleId2, deflections[0].ArticleIds);
    }

    [Fact]
    public async Task RecordDeflectionAsync_WithoutTenant_ThrowsUnauthorizedException()
    {
        var databaseName = Guid.NewGuid().ToString();
        var tenantService = new CurrentTenantService();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        await using var context = new ApplicationDbContext(options, tenantService);
        var embeddingService = new Mock<IEmbeddingService>();
        var llmService = new Mock<ILlmService>();
        var ragService = new RagService(context, tenantService, embeddingService.Object, llmService.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            ragService.RecordDeflectionAsync(new[] { Guid.NewGuid() }));
    }
}
