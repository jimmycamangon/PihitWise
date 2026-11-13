using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.Auth
{
    public record ForgotPasswordRequest([Required, EmailAddress] string Email);
}
