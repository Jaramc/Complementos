using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PQRS.Application.Common.Interfaces;
using PQRS.Application.DTOs.Auth;
using PQRS.Infrastructure.Persistence;

namespace PQRS.Infrastructure.Services;

public sealed class AuthService : IAuthService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext dbContext, IPasswordHasher passwordHasher, IJwtTokenGenerator tokenGenerator, IConfiguration configuration)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
        _tokenGenerator = tokenGenerator ?? throw new ArgumentNullException(nameof(tokenGenerator));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var email = request.Email.Trim().ToUpperInvariant();
        var user = await _dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(
            candidate => candidate.Email.ToUpper() == email,
            cancellationToken).ConfigureAwait(false);

        if (user is null || !user.IsActive || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var tenant = await _dbContext.Tenants.AsNoTracking().FirstOrDefaultAsync(
            candidate => candidate.Id == user.TenantId && candidate.IsActive,
            cancellationToken).ConfigureAwait(false);
        if (tenant is null)
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var expiryMinutes = int.TryParse(_configuration["JwtSettings:ExpiryMinutes"], out var configuredExpiry) ? configuredExpiry : 60;
        var expiration = DateTime.UtcNow.AddMinutes(expiryMinutes);
        return new LoginResponseDto(_tokenGenerator.GenerateToken(user), expiration, user.TenantId, user.Email, user.Role.ToString());
    }
}
