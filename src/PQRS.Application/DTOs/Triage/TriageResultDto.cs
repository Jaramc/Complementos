using PQRS.Domain.Enums;

namespace PQRS.Application.DTOs.Triage;

public sealed record TriageResultDto(
    TicketType Type,
    TicketPriority Priority,
    SentimentType Sentiment,
    string Summary);
