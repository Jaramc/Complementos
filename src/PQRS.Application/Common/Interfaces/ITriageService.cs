using PQRS.Application.DTOs.Triage;

namespace PQRS.Application.Common.Interfaces;

public interface ITriageService
{
    Task<TriageResultDto> AnalyzeTicketAsync(string subject, string description, CancellationToken cancellationToken = default);
}
