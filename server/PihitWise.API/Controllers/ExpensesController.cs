using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PihitWise.Application.Expenses;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PihitWise.API.Controllers
{
    // "Other" expenses only. Fuel and maintenance costs come from their own logs.
    [ApiController]
    [Authorize]
    [Route("api")]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ExpensesController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        [HttpGet("vehicles/{vehicleId}/expenses")]
        public async Task<IActionResult> GetByVehicle(Guid vehicleId)
        {
            var expenses = await _expenseService.GetByVehicleAsync(GetUserId(), vehicleId);
            if (expenses is null)
                return NotFound();
            return Ok(expenses);
        }

        [HttpPost("vehicles/{vehicleId}/expenses")]
        public async Task<IActionResult> Create(Guid vehicleId, ExpenseRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Label))
                return BadRequest("Enter what the expense was for.");

            var created = await _expenseService.CreateAsync(GetUserId(), vehicleId, request);
            if (created is null)
                return NotFound();
            return CreatedAtAction(nameof(GetByVehicle), new { vehicleId = vehicleId }, created);
        }

        [HttpPut("expenses/{id}")]
        public async Task<IActionResult> Update(Guid id, ExpenseRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Label))
                return BadRequest("Enter what the expense was for.");

            var updated = await _expenseService.UpdateAsync(GetUserId(), id, request);
            if (updated is null)
                return NotFound();
            return Ok(updated);
        }

        [HttpDelete("expenses/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _expenseService.DeleteAsync(GetUserId(), id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
    }
}
