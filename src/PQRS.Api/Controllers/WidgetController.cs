using Microsoft.AspNetCore.Mvc;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.Rag;
using PQRS.Application.DTOs.Widget;

namespace PQRS.Api.Controllers;

[ApiController]
[Route("api/v1/widget")]
public sealed class WidgetController : ControllerBase
{
    private readonly IRagService _ragService;
    private readonly ITicketService _ticketService;
    private readonly ITicketNotificationService _notificationService;
    private readonly ICurrentTenantService _currentTenantService;

    public WidgetController(IRagService ragService, ITicketService ticketService, ITicketNotificationService notificationService, ICurrentTenantService currentTenantService)
    {
        _ragService = ragService ?? throw new ArgumentNullException(nameof(ragService));
        _ticketService = ticketService ?? throw new ArgumentNullException(nameof(ticketService));
        _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
        _currentTenantService = currentTenantService ?? throw new ArgumentNullException(nameof(currentTenantService));
    }

    [HttpPost("rag-search")]
    public async Task<ActionResult<RagSearchResponseDto>> RagSearch([FromBody] WidgetRagSearchDto request, CancellationToken cancellationToken)
    {
        var result = await _ragService.SearchAndSynthesizeAsync(request.Query, cancellationToken).ConfigureAwait(false);
        return Ok(result);
    }

    [HttpPost("tickets")]
    public async Task<ActionResult<TicketCreatedResponseDto>> CreateTicket([FromBody] WidgetCreateTicketDto request, CancellationToken cancellationToken)
    {
        var result = await _ticketService.CreateWithTriageAsync(request, cancellationToken).ConfigureAwait(false);
        await _notificationService.NotifyTicketAlertAsync(_currentTenantService.TenantId!.Value, result, cancellationToken).ConfigureAwait(false);
        return StatusCode(StatusCodes.Status201Created, result);
    }
}
