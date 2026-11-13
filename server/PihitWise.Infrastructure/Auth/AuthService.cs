using Microsoft.AspNetCore.Identity;
using PihitWise.Application.Auth;
using PihitWise.Domain.Entities;
using PihitWise.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using PihitWise.Application.Email;
using PihitWise.Infrastructure.Email;


namespace PihitWise.Infrastructure.Auth
{
    public class AuthService : IAuthService
    {
        private static readonly TimeSpan ResetTokenLifetime = TimeSpan.FromHours(1);

        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _hasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IEmailSender _email;
        private readonly EmailSettings _emailSettings;

        public AuthService(AppDbContext db, IPasswordHasher<User> hasher, IJwtTokenGenerator jwtTokenGenerator,
            IEmailSender email, IOptions<EmailSettings> emailSettings)
        {
            _db = db;
            _hasher = hasher;
            _jwtTokenGenerator = jwtTokenGenerator;
            _email = email;
            _emailSettings = emailSettings.Value;
        }
        public async Task<UserResponse?> RegisterAsync(RegisterRequest request)
        {
            if (await _db.Users.AnyAsync(u => u.Email == request.Email))
                return null;


            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = request.FullName,
                Email = request.Email,
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _hasher.HashPassword(user, request.Password);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new UserResponse(user.Id, user.FullName, user.Email);
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            if (await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email) is not User user || user.PasswordHash is null)
                return null;

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (result == PasswordVerificationResult.Failed)
                return null;

            return new LoginResponse
            (
                _jwtTokenGenerator.GenerateToken(user),
                new UserResponse(user.Id, user.FullName, user.Email)
            );
        }

        public async Task<AccountResult> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
        {
            if (await _db.Users.FindAsync(userId) is not User user)
                return new AccountResult(AccountError.NotFound);

            var email = request.Email.Trim();
            if (email != user.Email && await _db.Users.AnyAsync(u => u.Email == email && u.Id != userId))
                return new AccountResult(AccountError.EmailTaken);

            user.FullName = request.FullName.Trim();
            user.Email = email;
            await _db.SaveChangesAsync();

            return new AccountResult(AccountError.None, new LoginResponse
            (
                _jwtTokenGenerator.GenerateToken(user),
                new UserResponse(user.Id, user.FullName, user.Email)
            ));
        }

        public async Task<AccountError> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
        {
            if (await _db.Users.FindAsync(userId) is not User user || user.PasswordHash is null)
                return AccountError.NotFound;

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
            if (result == PasswordVerificationResult.Failed)
                return AccountError.WrongPassword;

            user.PasswordHash = _hasher.HashPassword(user, request.NewPassword);
            await _db.SaveChangesAsync();
            return AccountError.None;
        }

        public async Task RequestPasswordResetAsync(ForgotPasswordRequest request)
        {
            // Unknown emails get the same quiet "ok" so nobody can test which emails have accounts.
            var email = request.Email.Trim();
            if (await _db.Users.FirstOrDefaultAsync(u => u.Email == email) is not User user)
                return;

            var token = ToUrlSafe(RandomNumberGenerator.GetBytes(32));
            user.PasswordResetTokenHash = Hash(token);
            user.PasswordResetExpiresAt = DateTime.UtcNow.Add(ResetTokenLifetime);
            await _db.SaveChangesAsync();

            var link = $"{_emailSettings.ClientUrl.TrimEnd('/')}/reset-password" +
                $"?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(token)}";
            var name = WebUtility.HtmlEncode(user.FullName);

            await _email.SendAsync(
                user.Email,
                "Reset your PihitWise password",
                $"<p>Hi {name},</p><p>Someone asked to reset your PihitWise password. " +
                $"<a href=\"{WebUtility.HtmlEncode(link)}\">Choose a new password</a>.</p>" +
                "<p>The link works for 1 hour. If it wasn't you, ignore this email and your password stays the same.</p>",
                $"Hi {user.FullName},\n\nReset your PihitWise password here (works for 1 hour):\n{link}\n\n" +
                "If it wasn't you, ignore this email and your password stays the same.");
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var email = request.Email.Trim();
            if (await _db.Users.FirstOrDefaultAsync(u => u.Email == email) is not User user
                || user.PasswordResetTokenHash is null
                || user.PasswordResetExpiresAt is null
                || user.PasswordResetExpiresAt < DateTime.UtcNow)
                return false;

            var given = Encoding.ASCII.GetBytes(Hash(request.Token));
            var stored = Encoding.ASCII.GetBytes(user.PasswordResetTokenHash);
            if (!CryptographicOperations.FixedTimeEquals(given, stored))
                return false;

            user.PasswordHash = _hasher.HashPassword(user, request.NewPassword);
            // One use only.
            user.PasswordResetTokenHash = null;
            user.PasswordResetExpiresAt = null;
            await _db.SaveChangesAsync();
            return true;
        }

        private static string Hash(string token) =>
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

        // URL-safe base64 without padding.
        private static string ToUrlSafe(byte[] bytes) =>
            Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }
}
