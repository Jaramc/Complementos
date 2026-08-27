using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.Tickets;

namespace PQRS.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/tickets")]
public sealed class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService ?? throw new ArgumentNullException(nameof(ticketService));
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TicketResponseDto>>> List([FromQuery] TicketFilterDto filter, CancellationToken cancellationToken)
    {
        return Ok(await _ticketService.ListAsync(filter, cancellationToken).ConfigureAwait(false));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<TicketResponseDto>> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusDto request, CancellationToken cancellationToken)
    {
        var result = await _ticketService.UpdateStatusAsync(id, request, cancellationToken).ConfigureAwait(false);
        return result is null ? NotFound() : Ok(result);
    }
}
