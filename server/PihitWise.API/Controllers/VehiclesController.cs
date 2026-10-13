using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PihitWise.Infrastructure.Persistence;
using PihitWise.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using PihitWise.Application.Vehicles;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PihitWise.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/vehicles")]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehiclesController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vehicles = await _vehicleService.GetAllAsync(GetUserId());
            return Ok(vehicles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var vehicle = await _vehicleService.GetByIdAsync(GetUserId(), id);
            if (vehicle is null) return NotFound();
            return Ok(vehicle);
        }

        [HttpPost]
        public async Task<IActionResult> Create(VehicleRequest request)
        {
            var createdVehicle = await _vehicleService.CreateAsync(GetUserId(), request);

            return CreatedAtAction(nameof(GetById), new { id = createdVehicle.Id }, createdVehicle);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, VehicleRequest request)
        {
            var updatedVehicle = await _vehicleService.UpdateAsync(GetUserId(), id, request);
            
            if (updatedVehicle is null) return NotFound();
            
            return Ok(updatedVehicle);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _vehicleService.DeleteAsync(GetUserId(), id);

            if (!deleted) return NotFound();

            return NoContent();
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);

    }
}
