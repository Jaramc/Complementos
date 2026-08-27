using PQRS.Application.DTOs.Auth;

namespace PQRS.Application.Common.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken);
}
