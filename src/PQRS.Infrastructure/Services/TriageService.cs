using System.Text.Json;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.Triage;
using PQRS.Domain.Enums;

namespace PQRS.Infrastructure.Services;

public sealed class TriageService : ITriageService
{
    private readonly ILlmService _llmService;

    public TriageService(ILlmService llmService)
    {
        _llmService = llmService ?? throw new ArgumentNullException(nameof(llmService));
    }

    public async Task<TriageResultDto> AnalyzeTicketAsync(string subject, string description, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(subject);
        ArgumentException.ThrowIfNullOrWhiteSpace(description);
        var systemPrompt = "Classify the PQRS ticket. Return only JSON with string properties type, priority, sentiment, summary. Allowed type: Peticion, Queja, Reclamo, Sugerencia. Allowed priority: Low, Medium, High. Allowed sentiment: Positive, Neutral, Negative.";
        var userPrompt = $"Subject: {subject.Trim()}\nDescription: {description.Trim()}";
        var json = await _llmService.CompleteAsync(systemPrompt, userPrompt, true, cancellationToken).ConfigureAwait(false);
        try
        {
            var result = JsonSerializer.Deserialize<StructuredTriageResult>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? throw new JsonException("Empty triage result.");
            return new TriageResultDto(ParseType(result.Type), ParsePriority(result.Priority), ParseSentiment(result.Sentiment), RequireSummary(result.Summary));
        }
        catch (JsonException exception)
        {
            throw new InvalidOperationException("The LLM returned an invalid triage JSON response.", exception);
        }
    }

    private static TicketType ParseType(string? value) => Enum.TryParse<TicketType>(value, true, out var result) ? result : TicketType.Peticion;

    private static TicketPriority ParsePriority(string? value) => Enum.TryParse<TicketPriority>(value, true, out var result) ? result : TicketPriority.Medium;

    private static SentimentType ParseSentiment(string? value) => Enum.TryParse<SentimentType>(value, true, out var result) ? result : SentimentType.Neutral;

    private static string RequireSummary(string? summary) => string.IsNullOrWhiteSpace(summary) ? "No summary available." : summary.Trim();

    private sealed record StructuredTriageResult(string? Type, string? Priority, string? Sentiment, string? Summary);
}
