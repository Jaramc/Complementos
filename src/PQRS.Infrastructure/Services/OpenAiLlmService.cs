using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using PQRS.Application.Common.Interfaces;

namespace PQRS.Infrastructure.Services;

public sealed class OpenAiLlmService : ILlmService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public OpenAiLlmService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    public async Task<string> CompleteAsync(string systemPrompt, string userPrompt, bool jsonMode = false, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(systemPrompt);
        ArgumentException.ThrowIfNullOrWhiteSpace(userPrompt);
        var apiKey = _configuration["OPENAI_API_KEY"]
            ?? _configuration["OpenAI:ApiKey"]
            ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return CreateFallbackResponse(systemPrompt, userPrompt, jsonMode);
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Content = JsonContent.Create(new
        {
            model = _configuration["OpenAI:ChatModel"] ?? "gpt-4o-mini",
            temperature = 0,
            response_format = jsonMode ? new { type = "json_object" } : null,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            }
        });

        using var response = await _httpClientFactory.CreateClient("OpenAI").SendAsync(request, cancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();
        using var document = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false),
            cancellationToken: cancellationToken).ConfigureAwait(false);
        return document.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()
            ?? throw new InvalidOperationException("OpenAI returned an empty completion.");
    }

    private static string CreateFallbackResponse(string systemPrompt, string userPrompt, bool jsonMode)
    {
        if (!jsonMode)
        {
            return "Respuesta local basada exclusivamente en los artículos recuperados:\n" + userPrompt;
        }

        var normalized = userPrompt.ToLowerInvariant();
        var type = normalized.Contains("reclamo") ? "Reclamo"
            : normalized.Contains("queja") ? "Queja"
            : normalized.Contains("suger") ? "Sugerencia"
            : "Peticion";
        var priority = normalized.Contains("urgente") || normalized.Contains("fraude") || normalized.Contains("incumpl") ? "High"
            : normalized.Contains("pronto") ? "Medium"
            : "Low";
        var sentiment = normalized.Contains("gracias") || normalized.Contains("excelente") || normalized.Contains("feliz") ? "Positive"
            : normalized.Contains("enoja") || normalized.Contains("molest") || normalized.Contains("pésim") || normalized.Contains("pesim") ? "Negative"
            : "Neutral";
        var summary = userPrompt.Replace('\n', ' ').Trim();
        if (summary.Length > 240)
        {
            summary = summary[..240];
        }

        return JsonSerializer.Serialize(new { type, priority, sentiment, summary });
    }
}
