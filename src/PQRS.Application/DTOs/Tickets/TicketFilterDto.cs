using PQRS.Domain.Enums;

namespace PQRS.Application.DTOs.Tickets;

public sealed record TicketFilterDto(
    TicketStatus? Status,
    TicketPriority? Priority,
    int Page = 1,
    int PageSize = 20);
