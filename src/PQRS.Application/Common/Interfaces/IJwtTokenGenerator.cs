using PQRS.Domain.Entities;

namespace PQRS.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
