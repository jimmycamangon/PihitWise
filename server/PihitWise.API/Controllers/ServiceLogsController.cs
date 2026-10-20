using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PihitWise.Application.ServiceLogs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;



namespace PihitWise.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api")]
    public class ServiceLogsController : ControllerBase
    {
        private readonly IServiceLogService _serviceLogService;

        public ServiceLogsController(IServiceLogService serviceLogService)
        {
            _serviceLogService = serviceLogService;
        }

        [HttpGet("vehicles/{vehicleId}/services")]
        public async Task<IActionResult> GetByVehicle(Guid vehicleId)
        {

            var serviceLogs = await _serviceLogService.GetByVehicleAsync(GetUserId(), vehicleId);

            if (serviceLogs is null)
                return NotFound();

            return Ok(serviceLogs);
        }


        [HttpPost("vehicles/{vehicleId}/services")]
        public async Task<IActionResult> Create(Guid vehicleId, ServiceLogRequest request)
        {
            var createdServiceLog = await _serviceLogService.CreateAsync(GetUserId(), vehicleId, request);
            if (createdServiceLog is null)
                return NotFound();
            return CreatedAtAction(nameof(GetByVehicle), new { vehicleId = vehicleId }, createdServiceLog);
        }

        [HttpPut("vehicles/services/{id}")]
        public async Task<IActionResult> Update(Guid serviceLogId, ServiceLogRequest request)
        {
            var updatedServiceLog = await _serviceLogService.UpdateAsync(GetUserId(), serviceLogId, request);
            if (updatedServiceLog is null)
                return NotFound();
            return Ok(updatedServiceLog);
        }

        [HttpDelete("vehicles/services/{id}")]
        public async Task<IActionResult> Delete(Guid serviceLogId)
        {
            var deleted = await _serviceLogService.DeleteAsync(GetUserId(), serviceLogId);
            if (!deleted)
                return NotFound();
            return NoContent();
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
    }
}
