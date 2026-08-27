using Pgvector;

namespace PQRS.Application.Common.Interfaces;

public interface IEmbeddingService
{
    Task<Vector> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken);
}
