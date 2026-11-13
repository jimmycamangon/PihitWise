namespace PihitWise.Infrastructure.Auth;

// Values from the "Jwt" section of appsettings.json (Key comes from user-secrets).
public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 60;
    // How long "Remember me" keeps the rider signed in.
    public int RememberDays { get; set; } = 30;
}
