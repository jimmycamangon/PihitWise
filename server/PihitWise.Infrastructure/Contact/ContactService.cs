using System.Net;
using Microsoft.Extensions.Options;
using PihitWise.Application.Contact;
using PihitWise.Application.Email;
using PihitWise.Infrastructure.Email;

namespace PihitWise.Infrastructure.Contact;

// Emails Contact page messages to Email:ContactTo, with the sender as reply-to.
public class ContactService : IContactService
{
    private readonly IEmailSender _email;
    private readonly EmailSettings _settings;

    public ContactService(IEmailSender email, IOptions<EmailSettings> settings)
    {
        _email = email;
        _settings = settings.Value;
    }

    public async Task<ContactResult> SendAsync(ContactRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Website)) return ContactResult.Sent;
        if (string.IsNullOrWhiteSpace(_settings.ContactTo)) return ContactResult.NotConfigured;

        var name = request.Name.Trim();
        var email = request.Email.Trim();
        var message = request.Message.Trim();
        var html = $"<p><strong>{WebUtility.HtmlEncode(name)}</strong> ({WebUtility.HtmlEncode(email)}) wrote:</p>" +
            $"<p style=\"white-space:pre-wrap\">{WebUtility.HtmlEncode(message)}</p>" +
            "<p style=\"color:#888\">Reply to this email to answer them.</p>";
        var text = $"{name} ({email}) wrote:\n\n{message}\n\nReply to this email to answer them.";

        // Name in the subject is trimmed to one line so it can't break the header.
        var subjectName = name.Replace('\r', ' ').Replace('\n', ' ');
        var sent = await _email.SendAsync(_settings.ContactTo, $"PihitWise contact: {subjectName}", html, text, email);
        return sent ? ContactResult.Sent : ContactResult.Failed;
    }
}
