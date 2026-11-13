namespace PihitWise.Application.Email
{
    public interface IEmailSender
    {
        /// <summary>Sends one email. Returns false when it could not be sent.</summary>
        Task<bool> SendAsync(string to, string subject, string html, string text);
    }
}
