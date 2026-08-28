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
    private readonly string? _apiKey;
    private readonly string _chatModel;

    public OpenAiLlmService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _apiKey = _configuration["OPENAI_API_KEY"]
            ?? _configuration["OpenAI:ApiKey"]
            ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        _chatModel = _configuration["OPENAI_CHAT_MODEL"]
            ?? _configuration["OpenAI:ChatModel"]
            ?? "gpt-4o-mini";
    }

    public async Task<string> CompleteAsync(string systemPrompt, string userPrompt, bool jsonMode = false, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(systemPrompt);
        ArgumentException.ThrowIfNullOrWhiteSpace(userPrompt);
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return CreateFallbackResponse(systemPrompt, userPrompt, jsonMode);
        }

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            request.Content = JsonContent.Create(new
            {
                model = _chatModel,
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
                ?? CreateFallbackResponse(systemPrompt, userPrompt, jsonMode);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception)
        {
            return CreateFallbackResponse(systemPrompt, userPrompt, jsonMode);
        }
    }

    private static string CreateFallbackResponse(string systemPrompt, string userPrompt, bool jsonMode)
    {
        if (!jsonMode)
        {
            // Extraer artículos y contexto de la empresa del systemPrompt
            var contextMarker = "---------------------\n";
            var startIndex = systemPrompt.IndexOf(contextMarker, StringComparison.Ordinal);
            string context = "";
            if (startIndex >= 0)
            {
                var contentStart = startIndex + contextMarker.Length;
                var endIndex = systemPrompt.IndexOf("---------------------", contentStart, StringComparison.Ordinal);
                if (endIndex > contentStart)
                {
                    context = systemPrompt[contentStart..endIndex].Trim();
                }
            }

            if (string.IsNullOrWhiteSpace(context))
            {
                context = "Disponemos de cobertura nacional con entregas de 2 a 5 días hábiles, garantía de fábrica de 30 días y múltiples métodos de pago (tarjetas, PSE y transferencias).";
            }

            // Limpiar etiquetas de formato interno
            var cleanContext = context
                .Replace("[Artículo: ", "\n- ")
                .Replace("]\n", ": ")
                .Replace("Título: ", "\n- ")
                .Replace("Contenido: ", ": ")
                .Replace("No hay artículos específicos adicionales.", "")
                .Trim();

            // Filtrar líneas relevantes según la consulta
            var cleanQuery = userPrompt.Replace("Consulta del usuario:", "").Trim();
            
            return $"Con base en nuestras politicas oficiales:\n\n{cleanContext}\n\nSi necesitas radicar una peticion, queja o reclamo formal, puedes usar la pestana 'Radicar PQRS'.";
        }

        var normalized = userPrompt.ToLowerInvariant();
        var type = normalized.Contains("reclamo") ? "Reclamo"
            : normalized.Contains("queja") ? "Queja"
            : normalized.Contains("suger") ? "Sugerencia"
            : "Peticion";
        var priority = normalized.Contains("urgente") || normalized.Contains("fraude") || normalized.Contains("incumpl") || normalized.Contains("robo") ? "High"
            : normalized.Contains("pronto") || normalized.Contains("retraso") ? "Medium"
            : "Low";
        var sentiment = normalized.Contains("gracias") || normalized.Contains("excelente") || normalized.Contains("feliz") ? "Positive"
            : normalized.Contains("enoja") || normalized.Contains("molest") || normalized.Contains("pésim") || normalized.Contains("pesim") || normalized.Contains("inconforme") ? "Negative"
            : "Neutral";
        var summary = userPrompt.Replace('\n', ' ').Trim();
        if (summary.Length > 240)
        {
            summary = summary[..240];
        }

        return JsonSerializer.Serialize(new { type, priority, sentiment, summary });
    }
}
