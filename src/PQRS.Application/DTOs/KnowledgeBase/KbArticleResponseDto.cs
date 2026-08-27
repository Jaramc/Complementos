namespace PQRS.Application.DTOs.KnowledgeBase;

public sealed record KbArticleResponseDto(
    Guid Id,
    Guid TenantId,
    string Title,
    string Content,
    bool IsActive,
    DateTime CreatedAtUtc);
