using PQRS.Domain.Enums;
using PQRS.Domain.Common;

namespace PQRS.Domain.Entities;

public sealed class Ticket : ITenantEntity
{
    private Ticket()
    {
    }

    public Ticket(Guid tenantId, string trackingNumber, string customerName, string customerEmail, string subject, string description, TicketType type)
    {
        TenantId = tenantId;
        TrackingNumber = RequireText(trackingNumber, nameof(trackingNumber));
        CustomerName = RequireText(customerName, nameof(customerName));
        CustomerEmail = RequireText(customerEmail, nameof(customerEmail));
        Subject = RequireText(subject, nameof(subject));
        Description = RequireText(description, nameof(description));
        Type = type;
        Status = TicketStatus.Pending;
        Priority = TicketPriority.Medium;
        Sentiment = TicketSentiment.Neutral;
        Id = Guid.NewGuid();
        CreatedAtUtc = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid TenantId { get; set; }

    public string TrackingNumber { get; private set; } = string.Empty;

    public string CustomerName { get; private set; } = string.Empty;

    public string CustomerEmail { get; private set; } = string.Empty;

    public string Subject { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public TicketType Type { get; private set; }

    public TicketStatus Status { get; private set; }

    public TicketPriority Priority { get; private set; }

    public TicketSentiment Sentiment { get; private set; }

    public string? Summary { get; private set; }

    public bool ResolvedByRag { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    public void ApplyTriage(TicketType type, TicketPriority priority, TicketSentiment sentiment, string summary)
    {
        Type = type;
        Priority = priority;
        Sentiment = sentiment;
        Summary = RequireText(summary, nameof(summary));
    }

    public void UpdateStatus(TicketStatus status)
    {
        Status = status;
    }

    private static string RequireText(string value, string parameterName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, parameterName);
        return value.Trim();
    }
}
