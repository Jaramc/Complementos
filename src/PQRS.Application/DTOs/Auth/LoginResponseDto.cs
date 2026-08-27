namespace PQRS.Application.DTOs.Auth;

public sealed record LoginResponseDto(
    string Token,
    DateTime Expiration,
    Guid TenantId,
    string Email,
    string Role);
