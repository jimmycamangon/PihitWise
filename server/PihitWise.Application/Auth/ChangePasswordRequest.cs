using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.Auth
{
    public record ChangePasswordRequest
    (
        [Required] string CurrentPassword,
        [Required, MinLength(8)] string NewPassword
    );
}
