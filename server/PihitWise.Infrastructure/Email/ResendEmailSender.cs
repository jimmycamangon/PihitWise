using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PihitWise.Application.Email;

namespace PihitWise.Infrastructure.Email;

// Sends email through Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
public class ResendEmailSender : IEmailSender
{
    private readonly HttpClient _http;
    private readonly EmailSettings _settings;
    private readonly ILogger<ResendEmailSender> _logger;

    public ResendEmailSender(HttpClient http, IOptions<EmailSettings> settings, ILogger<ResendEmailSender> logger)
    {
        _http = http;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<bool> SendAsync(string to, string subject, string html, string text)
    {
        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            // No key yet (local setup): write the email to the log so the flow can still be tried.
            _logger.LogWarning("Email:ApiKey is not set. Email to {To} not sent. Subject: {Subject}\n{Text}", to, subject, text);
            return false;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = JsonContent.Create(new { from = _settings.From, to = new[] { to }, subject, html, text })
        };
        request.Headers.Authorization = new("Bearer", _settings.ApiKey);

        try
        {
            using var response = await _http.SendAsync(request);
            if (response.IsSuccessStatusCode) return true;
            _logger.LogError("Resend refused the email to {To}: {Status} {Body}",
                to, (int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Could not reach Resend to email {To}", to);
        }
        return false;
    }
}
