namespace PQRS.Domain.Entities;

public sealed class Tenant
{
    private Tenant()
    {
    }

    public Tenant(string name, IEnumerable<string> allowedOrigins, string apiKey)
    {
        Name = RequireText(name, nameof(name));
        AllowedOrigins = allowedOrigins?.Where(static origin => !string.IsNullOrWhiteSpace(origin)).Distinct(StringComparer.OrdinalIgnoreCase).ToArray()
            ?? throw new ArgumentNullException(nameof(allowedOrigins));
        ApiKey = RequireText(apiKey, nameof(apiKey));
        Id = Guid.NewGuid();
        IsActive = true;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string[] AllowedOrigins { get; private set; } = Array.Empty<string>();

    public string ApiKey { get; private set; } = string.Empty;

    public bool IsActive { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private static string RequireText(string value, string parameterName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value, parameterName);
        return value.Trim();
    }
}
