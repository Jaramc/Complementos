using PQRS.Domain.Enums;
using PQRS.Domain.Common;

namespace PQRS.Domain.Entities;

public sealed class User : ITenantEntity
{
    private User()
    {
    }

    public User(Guid tenantId, string email, string passwordHash, UserRole role)
    {
        TenantId = RequireTenant(tenantId);
        Email = RequireText(email, nameof(email));
        PasswordHash = RequireText(passwordHash, nameof(passwordHash));
        Role = role;
        Id = Guid.NewGuid();
        IsActive = true;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid TenantId { get; set; }

    public string Email { get; private set; } = string.Empty;

    public string PasswordHash { get; private set; } = string.Empty;

    public UserRole Role { get; private set; }

    public bool IsActive { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private static Guid RequireTenant(Guid tenantId) => tenantId == Guid.Empty
        ? throw new ArgumentException("TenantId must not be empty.", nameof(tenantId))
        : tenantId;

    private static string RequireText(string value, string parameterName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, parameterName);
        return value.Trim();
    }
}
