using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PihitWise.Application.FuelLogs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;


namespace PihitWise.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api")]
    public class FuelLogsController : ControllerBase
    {
        private readonly IFuelLogService fuelLogService;

        public FuelLogsController(IFuelLogService fuelLogService)
        {
            this.fuelLogService = fuelLogService;
        }

        [HttpGet("vehicles/{vehicleId}/fuel")]
        public async Task<IActionResult> GetByVehicle(Guid vehicleId)
        {
            var fuelLogs = await fuelLogService.GetByVehicleAsync(GetUserId(), vehicleId);
            if (fuelLogs is null)
                return NotFound();
            return Ok(fuelLogs);
        }
        [HttpGet("vehicles/{vehicleId}/fuel/economy")]
        public async Task<IActionResult> GetEconomy(Guid vehicleId)
        {
            var fuelEconomy = await fuelLogService.GetEconomyAsync(GetUserId(), vehicleId);
            if (fuelEconomy is null)
                return NotFound();
            return Ok(fuelEconomy);
        }

        [HttpPost("vehicles/{vehicleId}/fuel")]
        public async Task<IActionResult> Create(Guid vehicleId, FuelLogRequest request)
        {
            var createdFuelLog = await fuelLogService.CreateAsync(GetUserId(), vehicleId, request);
            if (createdFuelLog is null)
                return NotFound();
            return CreatedAtAction(nameof(GetByVehicle), new { vehicleId = vehicleId }, createdFuelLog);
        }

        [HttpPut("fuel/{id}")]
        public async Task<IActionResult> Update(Guid id, FuelLogRequest request)
        {
            var updatedFuelLog = await fuelLogService.UpdateAsync(GetUserId(), id, request);
            if (updatedFuelLog is null)
                return NotFound();
            return Ok(updatedFuelLog);
        }

        [HttpDelete("fuel/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await fuelLogService.DeleteAsync(GetUserId(), id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);

    }
}
