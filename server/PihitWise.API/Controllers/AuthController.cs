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
    }
}
