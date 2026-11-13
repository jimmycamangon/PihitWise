
namespace PihitWise.Application.Auth
{
    public enum AccountError { None, NotFound, EmailTaken, WrongPassword }

    // Profile changes return a fresh token, since the old one still carries the old name and email.
    public record AccountResult(AccountError Error, LoginResponse? Login = null);
}
