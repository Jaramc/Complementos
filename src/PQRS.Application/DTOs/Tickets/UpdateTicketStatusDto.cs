using System.ComponentModel.DataAnnotations;
using PQRS.Domain.Enums;

namespace PQRS.Application.DTOs.Tickets;

public sealed class UpdateTicketStatusDto
{
    [Required]
    public TicketStatus Status { get; set; }

    public UpdateTicketStatusDto() { }

    public UpdateTicketStatusDto(TicketStatus status)
    {
        Status = status;
    }
}

