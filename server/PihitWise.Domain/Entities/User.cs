namespace PihitWise.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        // Only the SHA-256 hash of the emailed reset token is kept, never the token itself.
        public string? PasswordResetTokenHash { get; set; }
        public DateTime? PasswordResetExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}