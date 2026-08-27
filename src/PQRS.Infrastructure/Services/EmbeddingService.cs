using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Http;
using PQRS.Application.Common.Interfaces;
using Pgvector;

namespace PQRS.Infrastructure.Services;

public sealed class EmbeddingService : IEmbeddingService
{
    private const int Dimensions = 1536;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public EmbeddingService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    public async Task<Vector> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(text);
        var apiKey = _configuration["OpenAI:ApiKey"] ?? _configuration["OPENAI_API_KEY"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return CreateDeterministicEmbedding(text);
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/embeddings");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
        request.Content = JsonContent.Create(new { model = "text-embedding-3-small", input = text });
        using var response = await _httpClientFactory.CreateClient("OpenAI").SendAsync(request, cancellationToken).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();
        using var document = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false), cancellationToken: cancellationToken).ConfigureAwait(false);
        var embedding = document.RootElement.GetProperty("data")[0].GetProperty("embedding").EnumerateArray().Select(value => value.GetSingle()).ToArray();
        if (embedding.Length != Dimensions)
        {
            throw new InvalidOperationException($"OpenAI returned {embedding.Length} dimensions; expected {Dimensions}.");
        }

        return new Vector(embedding);
    }

    private static Vector CreateDeterministicEmbedding(string text)
    {
        var values = new float[Dimensions];
        var bytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(text.Trim()));
        for (var index = 0; index < values.Length; index++)
        {
            var hashByte = bytes[index % bytes.Length];
            values[index] = (hashByte / 255f) * 2f - 1f;
        }

        var norm = MathF.Sqrt(values.Sum(value => value * value));
        for (var index = 0; index < values.Length; index++)
        {
            values[index] /= norm;
        }

        return new Vector(values);
    }
}
