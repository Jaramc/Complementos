using System.ComponentModel.DataAnnotations;

namespace PQRS.Application.DTOs.KnowledgeBase;

public sealed class CreateKbArticleDto
{
    [Required, MaxLength(300)]
    public string Title { get; init; } = string.Empty;

    [Required]
    public string Content { get; init; } = string.Empty;
}
