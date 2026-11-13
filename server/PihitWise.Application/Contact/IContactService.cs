namespace PihitWise.Application.Contact
{
    public enum ContactResult { Sent, NotConfigured, Failed }

    public interface IContactService
    {
        Task<ContactResult> SendAsync(ContactRequest request);
    }
}
