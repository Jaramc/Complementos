namespace PQRS.Application.DTOs.Rag;

public sealed record RagSearchResponseDto(
    bool HasAnswer,
    string? Answer,
    double SimilarityScore,
    List<Guid> MatchedArticleIds);
