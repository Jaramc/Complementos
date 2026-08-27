using PQRS.Application.DTOs.Widget;

namespace PQRS.Application.Common.Interfaces;

public interface ITicketNotificationService
{
    Task NotifyTicketAlertAsync(Guid tenantId, TicketCreatedResponseDto ticket, CancellationToken cancellationToken = default);
}
