using PQRS.Application.DTOs.Rag;

namespace PQRS.Application.Common.Interfaces;

public interface IRagService
{
    Task<RagSearchResponseDto> SearchAndSynthesizeAsync(string query, CancellationToken cancellationToken = default);

    Task RecordDeflectionAsync(IEnumerable<Guid>? articleIds, CancellationToken cancellationToken = default);
}
