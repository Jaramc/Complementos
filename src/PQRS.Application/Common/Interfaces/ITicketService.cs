using PQRS.Application.DTOs.Tickets;
using PQRS.Application.DTOs.Widget;

namespace PQRS.Application.Common.Interfaces;

public interface ITicketService
{
    Task<TicketCreatedResponseDto> CreateWithTriageAsync(WidgetCreateTicketDto request, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TicketResponseDto>> ListAsync(TicketFilterDto filter, CancellationToken cancellationToken = default);

    Task<TicketResponseDto?> UpdateStatusAsync(Guid id, UpdateTicketStatusDto request, CancellationToken cancellationToken = default);
}
