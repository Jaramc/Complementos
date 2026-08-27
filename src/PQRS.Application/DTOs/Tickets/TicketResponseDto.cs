using PQRS.Domain.Enums;

namespace PQRS.Application.DTOs.Tickets;

public sealed record TicketResponseDto(
    Guid Id,
    Guid TenantId,
    string TrackingNumber,
    string CustomerName,
    string CustomerEmail,
    string Subject,
    string Description,
    TicketType Type,
    TicketStatus Status,
    TicketPriority Priority,
    TicketSentiment Sentiment,
    string? Summary,
    DateTime CreatedAtUtc);
