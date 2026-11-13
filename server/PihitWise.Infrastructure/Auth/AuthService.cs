using Microsoft.AspNetCore.Identity;
using PihitWise.Application.Auth;
using PihitWise.Domain.Entities;
using PihitWise.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace PihitWise.Infrastructure.Auth
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _hasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(AppDbContext db, IPasswordHasher<User> hasher, IJwtTokenGenerator jwtTokenGenerator)
        {
            _db = db;
            _hasher = hasher;
            _jwtTokenGenerator = jwtTokenGenerator;
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
    }
}
