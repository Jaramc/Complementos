using System.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using PQRS.Application.Common.Interfaces;
using PQRS.Domain.Entities;
using PQRS.Infrastructure.Middleware;
using PQRS.Infrastructure.Persistence;
using PQRS.Infrastructure.Services;
using Xunit;

namespace PQRS.Infrastructure.Tests;

public sealed class TenantIsolationTests
{
    [Fact]
    public async Task TenantA_CannotListOrAccessById_TenantBData()
    {
        var tenantA = Guid.NewGuid();
        var tenantB = Guid.NewGuid();
        var databaseName = await SeedTicketsAndArticlesAsync(tenantA, tenantB);

        await using var context = CreateContext(tenantA, databaseName, out var tenantService);
        var tenantBTicketId = await context.Tickets.IgnoreQueryFilters().Where(ticket => ticket.TenantId == tenantB).Select(ticket => ticket.Id).SingleAsync();
        var tenantBArticleId = await context.KnowledgeBaseArticles.IgnoreQueryFilters().Where(article => article.TenantId == tenantB).Select(article => article.Id).SingleAsync();

        var visibleTickets = await context.Tickets.ToListAsync();
        var visibleArticles = await context.KnowledgeBaseArticles.ToListAsync();
        var hiddenTicket = await context.Tickets.SingleOrDefaultAsync(ticket => ticket.Id == tenantBTicketId);
        var hiddenArticle = await context.KnowledgeBaseArticles.SingleOrDefaultAsync(article => article.Id == tenantBArticleId);

        Assert.All(visibleTickets, ticket => Assert.Equal(tenantA, ticket.TenantId));
        Assert.All(visibleArticles, article => Assert.Equal(tenantA, article.TenantId));
        Assert.Single(visibleTickets);
        Assert.Single(visibleArticles);
        Assert.Null(hiddenTicket);
        Assert.Null(hiddenArticle);
        Assert.Equal(tenantA, tenantService.TenantId);
    }

    [Fact]
    public async Task SaveChangesAsync_RejectsEntityFromAnotherTenant()
    {
        var tenantA = Guid.NewGuid();
        var tenantB = Guid.NewGuid();
        await using var context = CreateContext(tenantA, Guid.NewGuid().ToString(), out _);
        var foreignTicket = new Ticket(tenantB, "FOREIGN-001", "Customer", "customer@example.com", "Subject", "Description", PQRS.Domain.Enums.TicketType.Peticion);
        context.Tickets.Add(foreignTicket);

        await Assert.ThrowsAsync<SecurityException>(() => context.SaveChangesAsync());
    }

    [Fact]
    public async Task SaveChangesAsync_AssignsActiveTenantId_WhenNewEntityHasEmptyTenantGuid()
    {
        var tenantA = Guid.NewGuid();
        await using var context = CreateContext(tenantA, Guid.NewGuid().ToString(), out _);
        var newTicket = new Ticket(Guid.Empty, "NEW-001", "Customer", "customer@example.com", "Subject", "Description", PQRS.Domain.Enums.TicketType.Peticion);
        context.Tickets.Add(newTicket);

        await context.SaveChangesAsync();

        Assert.Equal(tenantA, newTicket.TenantId);
    }

    [Fact]
    public async Task TenantResolutionMiddleware_RejectsRequestWithoutValidTenantCredentials()
    {
        var currentTenant = new CurrentTenantService();
        var tenantStore = new Mock<ITenantStore>(MockBehavior.Strict);
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/v1/widget/rag-search";
        context.Response.Body = new MemoryStream();
        var middleware = new TenantResolutionMiddleware(_ => Task.CompletedTask);

        await middleware.InvokeAsync(context, currentTenant, tenantStore.Object);

        Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);
        Assert.False(currentTenant.HasTenant);
        tenantStore.VerifyNoOtherCalls();
    }

    private static ApplicationDbContext CreateContext(Guid tenantId, string databaseName, out CurrentTenantService tenantService)
    {
        tenantService = new CurrentTenantService();
        tenantService.SetTenant(tenantId);
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(databaseName).Options;
        return new ApplicationDbContext(options, tenantService);
    }

    private static async Task<string> SeedTicketsAndArticlesAsync(Guid tenantA, Guid tenantB)
    {
        var databaseName = Guid.NewGuid().ToString();
        await using var contextA = CreateContext(tenantA, databaseName, out _);
        contextA.Tickets.Add(new Ticket(tenantA, "TENANTA-001", "Customer A", "a@example.com", "Subject A", "Description A", PQRS.Domain.Enums.TicketType.Peticion));
        contextA.KnowledgeBaseArticles.Add(new KnowledgeBaseArticle(tenantA, "Article A", "Content A", new Pgvector.Vector(new float[1536])));
        await contextA.SaveChangesAsync();

        await using var contextB = CreateContext(tenantB, databaseName, out _);
        contextB.Tickets.Add(new Ticket(tenantB, "TENANTB-001", "Customer B", "b@example.com", "Subject B", "Description B", PQRS.Domain.Enums.TicketType.Queja));
        contextB.KnowledgeBaseArticles.Add(new KnowledgeBaseArticle(tenantB, "Article B", "Content B", new Pgvector.Vector(new float[1536])));
        await contextB.SaveChangesAsync();
        return databaseName;
    }
}
