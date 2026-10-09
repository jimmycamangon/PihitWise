using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PihitWise.Infrastructure.Persistence;
using PihitWise.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using PihitWise.Application.Auth;

namespace PihitWise.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _hasher;

        // ASP.NET gives us these automatically (this is called dependency injection)
        public AuthController(AppDbContext db, IPasswordHasher<User> hasher)
        {
            _db = db;
            _hasher = hasher;
        }

        [HttpPost("register")]  // POST /api/auth/register
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            if (await _db.Users.AnyAsync(u => u.Email == request.Email))
                return Conflict("Email is already registered");


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

            return Ok(new { user.Id, user.FullName, user.Email });
        }
    }
}
