using Microsoft.AspNetCore.SignalR;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.Widget;

namespace PQRS.Infrastructure.SignalR;

public sealed class TicketNotificationService : ITicketNotificationService
{
    private readonly IHubContext<TicketHub> _hubContext;

    public TicketNotificationService(IHubContext<TicketHub> hubContext)
    {
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
    }

    public Task NotifyTicketAlertAsync(Guid tenantId, TicketCreatedResponseDto ticket, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(ticket);
        if (tenantId == Guid.Empty || (ticket.Priority != PQRS.Domain.Enums.TicketPriority.High && ticket.Sentiment != PQRS.Domain.Enums.SentimentType.Negative))
        {
            return Task.CompletedTask;
        }

        return _hubContext.Clients.Group(tenantId.ToString()).SendAsync("ReceiveTicketAlert", ticket, cancellationToken);
    }
}
