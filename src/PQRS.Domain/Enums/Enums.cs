namespace PQRS.Domain.Enums;

public enum UserRole
{
    Admin = 1,
    Agent = 2
}

public enum TicketType
{
    Peticion = 1,
    Queja = 2,
    Reclamo = 3,
    Sugerencia = 4
}

public enum TicketStatus
{
    Pending = 1,
    InProgress = 2,
    Resolved = 3
}

public enum TicketPriority
{
    Low = 1,
    Medium = 2,
    High = 3
}

public enum TicketSentiment
{
    Positive = 1,
    Neutral = 2,
    Negative = 3
}

public enum SentimentType
{
    Positive = 1,
    Neutral = 2,
    Negative = 3
}