using Microsoft.EntityFrameworkCore;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.Tickets;
using PQRS.Application.DTOs.Widget;
using PQRS.Domain.Entities;
using PQRS.Infrastructure.Persistence;

namespace PQRS.Infrastructure.Services;

public sealed class TicketService : ITicketService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly ITriageService _triageService;

    public TicketService(ApplicationDbContext dbContext, ICurrentTenantService currentTenantService, ITriageService triageService)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _currentTenantService = currentTenantService ?? throw new ArgumentNullException(nameof(currentTenantService));
        _triageService = triageService ?? throw new ArgumentNullException(nameof(triageService));
    }

    public async Task<TicketCreatedResponseDto> CreateWithTriageAsync(WidgetCreateTicketDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        var tenantId = EnsureTenant();
        var triage = await _triageService.AnalyzeTicketAsync(request.Subject, request.Description, cancellationToken).ConfigureAwait(false);
        var trackingNumber = $"PQRS-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..32];
        var ticket = new Ticket(tenantId, trackingNumber, RequireText(request.CustomerName), RequireText(request.CustomerEmail), RequireText(request.Subject), RequireText(request.Description), triage.Type);
        ticket.ApplyTriage(triage.Type, triage.Priority, (PQRS.Domain.Enums.TicketSentiment)triage.Sentiment, triage.Summary);
        _dbContext.Tickets.Add(ticket);
        await _dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return ToCreatedResponse(ticket);
    }

    public async Task<IReadOnlyList<TicketResponseDto>> ListAsync(TicketFilterDto filter, CancellationToken cancellationToken = default)
    {
        EnsureTenant();
        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);
        var query = _dbContext.Tickets.AsNoTracking();
        if (filter.Status.HasValue)
        {
            query = query.Where(ticket => ticket.Status == filter.Status.Value);
        }

        if (filter.Priority.HasValue)
        {
            query = query.Where(ticket => ticket.Priority == filter.Priority.Value);
        }

        return await query.OrderByDescending(ticket => ticket.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ticket => ToResponse(ticket))
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);
    }

    public async Task<TicketResponseDto?> UpdateStatusAsync(Guid id, UpdateTicketStatusDto request, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        EnsureTenant();
        var ticket = await _dbContext.Tickets.SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken).ConfigureAwait(false);
        if (ticket is null)
        {
            return null;
        }

        ticket.UpdateStatus(request.Status);
        await _dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        return ToResponse(ticket);
    }

    private Guid EnsureTenant() => _currentTenantService.TenantId is { } tenantId && tenantId != Guid.Empty
        ? tenantId
        : throw new UnauthorizedAccessException("A tenant context is required.");

    private static TicketCreatedResponseDto ToCreatedResponse(Ticket ticket) =>
        new(ticket.Id, ticket.TrackingNumber, ticket.Type, ticket.Priority, (PQRS.Domain.Enums.SentimentType)ticket.Sentiment, ticket.Summary ?? string.Empty);

    private static TicketResponseDto ToResponse(Ticket ticket) =>
        new(ticket.Id, ticket.TenantId, ticket.TrackingNumber, ticket.CustomerName, ticket.CustomerEmail, ticket.Subject, ticket.Description, ticket.Type, ticket.Status, ticket.Priority, ticket.Sentiment, ticket.Summary, ticket.CreatedAtUtc);

    private static string RequireText(string value, string parameterName = "value")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, parameterName);
        return value.Trim();
    }
}
