using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PihitWise.Application.Reminders;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PihitWise.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api")]
    public class RemindersController : ControllerBase
    {
        private readonly IReminderService reminderService;
        public RemindersController(IReminderService reminderService)
        {
            this.reminderService = reminderService;
        }

        [HttpGet("vehicles/{vehicleId}/reminders")]
        public async Task<IActionResult> GetByVehicle(Guid vehicleId)
        {
            var reminders = await reminderService.GetByVehicleAsync(GetUserId(), vehicleId);
            if (reminders is null)
                return NotFound();
            return Ok(reminders);
        }

        [HttpPost("vehicles/{vehicleId}/reminders")]
        public async Task<IActionResult> Create(Guid vehicleId, ReminderRequest request)
        {
            if (request.DueOdometer is null && request.DueDate is null)
                return BadRequest("Set a due km or a due date.");

            var createdReminder = await reminderService.CreateAsync(GetUserId(), vehicleId, request);
            if (createdReminder is null)
                return NotFound();
            return new CreatedAtActionResult(nameof(GetByVehicle), "Reminders", new { vehicleId = vehicleId }, createdReminder);
        }

        [HttpPut("reminders/{id}")]
        public async Task<IActionResult> Update(Guid id, ReminderRequest request)
        {
            if (request.DueOdometer is null && request.DueDate is null)
                return BadRequest("Set a due km or a due date.");

            var updatedReminder = await reminderService.UpdateAsync(GetUserId(), id, request);
            if (updatedReminder is null)
                return NotFound();
            return Ok(updatedReminder);
        }

        [HttpDelete("reminders/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await reminderService.DeleteAsync(GetUserId(), id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }

        [HttpPatch("reminders/{id}/done")]
        public async Task<IActionResult> MarkAsDone(Guid id)
        {
            var updatedReminder = await reminderService.MarkDoneAsync(GetUserId(), id);
            if (updatedReminder is null)
                return NotFound();
            return Ok(updatedReminder);
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
    }
}
