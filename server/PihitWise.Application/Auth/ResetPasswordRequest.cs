using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.Auth
{
    public record ResetPasswordRequest
    (
        [Required, EmailAddress] string Email,
        [Required] string Token,
        [Required, MinLength(8)] string NewPassword
    );
}
