using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PihitWise.Application.Admin;

namespace PihitWise.API.Controllers
{
    // Only for emails in the Admin:Emails setting. Everyone else gets 403, even if they find the address.
    [ApiController]
    [Authorize]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("users")]  // GET /api/admin/users
        public async Task<IActionResult> Users()
        {
            if (!_adminService.IsAdmin(User.FindFirstValue(JwtRegisteredClaimNames.Email)))
                return Forbid();
            return Ok(await _adminService.GetUsersAsync());
        }
    }
}
