using PQRS.Application.DTOs.KnowledgeBase;

namespace PQRS.Application.Common.Interfaces;

public interface IKnowledgeBaseService
{
    Task<IReadOnlyList<KbArticleResponseDto>> ListAsync(CancellationToken cancellationToken);

    Task<KbArticleResponseDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<KbArticleResponseDto> CreateAsync(CreateKbArticleDto request, CancellationToken cancellationToken);

    Task<KbArticleResponseDto?> UpdateAsync(Guid id, UpdateKbArticleDto request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
