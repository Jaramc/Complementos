using System.ComponentModel.DataAnnotations;
using PQRS.Domain.Enums;

namespace PQRS.Application.DTOs.Tickets;

public sealed record UpdateTicketStatusDto([property: Required] TicketStatus Status);
