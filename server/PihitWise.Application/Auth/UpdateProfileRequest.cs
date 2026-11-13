using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.Auth
{
    public record UpdateProfileRequest
    (
        [Required, MaxLength(100)] string FullName,
        [Required, EmailAddress, MaxLength(200)] string Email
    );
}
