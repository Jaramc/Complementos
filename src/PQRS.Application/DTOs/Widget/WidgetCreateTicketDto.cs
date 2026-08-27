using System.ComponentModel.DataAnnotations;

namespace PQRS.Application.DTOs.Widget;

public sealed record WidgetCreateTicketDto(
    [Required, MaxLength(200)] string CustomerName,
    [Required, EmailAddress, MaxLength(320)] string CustomerEmail,
    [Required, MaxLength(300)] string Subject,
    [Required] string Description);
