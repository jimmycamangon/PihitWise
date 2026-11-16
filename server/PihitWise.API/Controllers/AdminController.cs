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

        [HttpGet("users")]  // GET /api/admin/users?search=&page=1&pageSize=50
        public async Task<IActionResult> Users(string? search, int page = 1, int pageSize = 50)
        {
            if (!_adminService.IsAdmin(User.FindFirstValue(JwtRegisteredClaimNames.Email)))
                return Forbid();
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            return Ok(await _adminService.GetUsersAsync(search, page, pageSize));
        }
    }
}
