namespace PihitWise.Infrastructure.Email;

// Values from the "Email" section. ApiKey comes from user-secrets (or Email__ApiKey on the host).
public class EmailSettings
{
    public const string SectionName = "Email";

    public string ApiKey { get; set; } = string.Empty;
    public string From { get; set; } = "PihitWise <onboarding@resend.dev>";
    // Where the web app lives, for links in emails. Never taken from the request.
    public string ClientUrl { get; set; } = "http://localhost:5173";
}
