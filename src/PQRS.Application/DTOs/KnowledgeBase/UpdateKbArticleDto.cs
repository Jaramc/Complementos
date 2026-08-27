using System.ComponentModel.DataAnnotations;

namespace PQRS.Application.DTOs.KnowledgeBase;

public sealed class UpdateKbArticleDto
{
    [Required, MaxLength(300)]
    public string Title { get; init; } = string.Empty;

    [Required]
    public string Content { get; init; } = string.Empty;

    public bool IsActive { get; init; } = true;
}
