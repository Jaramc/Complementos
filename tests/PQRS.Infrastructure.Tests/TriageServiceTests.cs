using Moq;
using PQRS.Application.Common.Interfaces;
using PQRS.Domain.Enums;
using PQRS.Infrastructure.Services;
using Xunit;

namespace PQRS.Infrastructure.Tests;

public sealed class TriageServiceTests
{
    [Fact]
    public async Task AnalyzeTicketAsync_ParsesValidLlmJsonCorrectly()
    {
        var llmService = new Mock<ILlmService>();
        var jsonResponse = """
        {
            "type": "Reclamo",
            "priority": "High",
            "sentiment": "Negative",
            "summary": "Cobro duplicado en factura"
        }
        """;

        llmService.Setup(l => l.CompleteAsync(It.IsAny<string>(), It.IsAny<string>(), true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(jsonResponse);

        var triageService = new TriageService(llmService.Object);
        var result = await triageService.AnalyzeTicketAsync("Cobro indebido", "Me cobraron dos veces la suscripción mensual.");

        Assert.Equal(TicketType.Reclamo, result.Type);
        Assert.Equal(TicketPriority.High, result.Priority);
        Assert.Equal(SentimentType.Negative, result.Sentiment);
        Assert.Equal("Cobro duplicado en factura", result.Summary);
    }

    [Fact]
    public async Task AnalyzeTicketAsync_WithInvalidJson_ThrowsInvalidOperationException()
    {
        var llmService = new Mock<ILlmService>();
        llmService.Setup(l => l.CompleteAsync(It.IsAny<string>(), It.IsAny<string>(), true, It.IsAny<CancellationToken>()))
            .ReturnsAsync("not valid json");

        var triageService = new TriageService(llmService.Object);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            triageService.AnalyzeTicketAsync("Asunto", "Descripcion"));
    }
}
