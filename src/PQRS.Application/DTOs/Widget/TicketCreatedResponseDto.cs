using PQRS.Domain.Enums;

namespace PQRS.Application.DTOs.Widget;

public sealed record TicketCreatedResponseDto(
    Guid Id,
    string TrackingNumber,
    TicketType Type,
    TicketPriority Priority,
    SentimentType Sentiment,
    string Summary);
