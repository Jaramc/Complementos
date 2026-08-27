using System.ComponentModel.DataAnnotations;

namespace PQRS.Application.DTOs.Widget;

public sealed record WidgetRagSearchDto([Required] string Query);
