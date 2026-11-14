namespace PihitWise.Infrastructure.Admin;

// "Admin" section. Emails is a comma-separated list, e.g. "you@gmail.com, other@gmail.com".
// Set it in user-secrets locally and as Admin__Emails on the API host.
public class AdminSettings
{
    public const string SectionName = "Admin";

    public string Emails { get; set; } = string.Empty;
}
