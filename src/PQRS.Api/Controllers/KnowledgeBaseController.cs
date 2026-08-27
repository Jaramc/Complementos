using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.KnowledgeBase;

namespace PQRS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/kb-articles")]
public sealed class KnowledgeBaseController : ControllerBase
{
    private readonly IKnowledgeBaseService _knowledgeBaseService;

    public KnowledgeBaseController(IKnowledgeBaseService knowledgeBaseService)
    {
        _knowledgeBaseService = knowledgeBaseService ?? throw new ArgumentNullException(nameof(knowledgeBaseService));
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<KbArticleResponseDto>>> List(CancellationToken cancellationToken) =>
        Ok(await _knowledgeBaseService.ListAsync(cancellationToken).ConfigureAwait(false));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<KbArticleResponseDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var article = await _knowledgeBaseService.GetByIdAsync(id, cancellationToken).ConfigureAwait(false);
        return article is null ? NotFound() : Ok(article);
    }

    [HttpPost]
    public async Task<ActionResult<KbArticleResponseDto>> Create([FromBody] CreateKbArticleDto request, CancellationToken cancellationToken)
    {
        var article = await _knowledgeBaseService.CreateAsync(request, cancellationToken).ConfigureAwait(false);
        return CreatedAtAction(nameof(GetById), new { id = article.Id }, article);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<KbArticleResponseDto>> Update(Guid id, [FromBody] UpdateKbArticleDto request, CancellationToken cancellationToken)
    {
        var article = await _knowledgeBaseService.UpdateAsync(id, request, cancellationToken).ConfigureAwait(false);
        return article is null ? NotFound() : Ok(article);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken) =>
        await _knowledgeBaseService.DeleteAsync(id, cancellationToken).ConfigureAwait(false) ? NoContent() : NotFound();
}
