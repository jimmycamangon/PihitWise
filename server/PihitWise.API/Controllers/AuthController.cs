using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PihitWise.Infrastructure.Persistence;
using PihitWise.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using PihitWise.Application.Auth;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PihitWise.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {

        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]  // POST /api/auth/register
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var userResponse = await _authService.RegisterAsync(request);
            if (userResponse == null)
            {
                return BadRequest("Email is already in use.");
            }
            return Ok(userResponse);
        }

        [HttpPost("login")]  // POST /api/auth/login
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var loginResponse = await _authService.LoginAsync(request);
            if (loginResponse == null)
            {
                return Unauthorized("Invalid email or password.");
            }
            return Ok(loginResponse);
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var id = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var email = User.FindFirstValue(JwtRegisteredClaimNames.Email);
            var name = User.FindFirstValue(JwtRegisteredClaimNames.Name);

            return Ok(new { id, email, name });
        }
    }
}
