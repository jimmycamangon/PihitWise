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

        public AuthService(AppDbContext db, IPasswordHasher<User> hasher)
        {
            _db = db;
            _hasher = hasher;
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
    }
}
