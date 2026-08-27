namespace PQRS.Application.Common.Interfaces;

public interface ILlmService
{
    Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        bool jsonMode = false,
        CancellationToken cancellationToken = default);
}
