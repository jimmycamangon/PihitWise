using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.Contact
{
    public record ContactRequest
    (
        [Required, MaxLength(100)] string Name,
        [Required, EmailAddress, MaxLength(200)] string Email,
        [Required, MaxLength(5000)] string Message,
        // Hidden field people never see. Bots that fill every field get a quiet "ok" and nothing is sent.
        string? Website = null
    );
}
