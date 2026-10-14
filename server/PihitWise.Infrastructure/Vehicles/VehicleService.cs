using PihitWise.Infrastructure.Persistence;
using PihitWise.Application.Vehicles;
using PihitWise.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace PihitWise.Infrastructure.Vehicles
{
    public class VehicleService : IVehicleService
    {
        private readonly AppDbContext _db;
        public VehicleService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<VehicleResponse?> GetByIdAsync(Guid userId, Guid id)
        {
           var vehicle = await _db.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);

            if (vehicle is null) return null;
            return ToResponse(vehicle);
        }

        public async Task<List<VehicleResponse>> GetAllAsync(Guid userId)
        {
            var vehicles = await _db.Vehicles
                .Where(v => v.UserId == userId)
                .OrderBy(v => v.CreatedAt)
                .ToListAsync();
            return vehicles.Select(ToResponse).ToList();
        }

        public async Task<VehicleResponse> CreateAsync(Guid userId, VehicleRequest request)
        {
            var vehicle = new Vehicle
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = request.Type,
                Name = request.Name,
                Brand = request.Brand,
                Model = request.Model,
                Year = request.Year,
                PlateNumber = request.PlateNumber,
                Odometer = request.Odometer,
                CreatedAt = DateTime.UtcNow
            };
            _db.Vehicles.Add(vehicle);

            await _db.SaveChangesAsync();

            return ToResponse(vehicle);
        }

        public async Task<VehicleResponse?> UpdateAsync(Guid userId, Guid id, VehicleRequest request)
        {
            var vehicle = await _db.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);

            if (vehicle is null) return null;

            vehicle.Type = request.Type;
            vehicle.Name = request.Name;
            vehicle.Brand = request.Brand;
            vehicle.Model = request.Model;
            vehicle.Year = request.Year;
            vehicle.PlateNumber = request.PlateNumber;
            vehicle.Odometer = request.Odometer;

            await _db.SaveChangesAsync();

            return ToResponse(vehicle);
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid id)
        {
            var vehicle = await _db.Vehicles
                .FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);

            if (vehicle is null) return false;

            _db.Vehicles.Remove(vehicle);

            await _db.SaveChangesAsync();

            return true;
        }

        public async Task<bool> PlateExistsAsync(Guid userId, string plateNumber, Guid? exceptId)
        {
            var query = _db.Vehicles
                .Where(v => v.UserId == userId && v.PlateNumber == plateNumber);
            if (exceptId.HasValue)
            {
                query = query.Where(v => v.Id != exceptId.Value);
            }
            return await query.AnyAsync();
        }

        private static VehicleResponse ToResponse(Vehicle v) =>
            new VehicleResponse
            (
                v.Id,
                v.Type,
                v.Name,
                v.Brand,
                v.Model,
                v.Year,
                v.PlateNumber,
                v.Odometer,
                v.CreatedAt
            );
    }
}
