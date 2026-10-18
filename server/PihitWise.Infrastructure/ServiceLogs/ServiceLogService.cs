using Microsoft.EntityFrameworkCore;
using PihitWise.Application.ServiceLogs;
using PihitWise.Infrastructure.Persistence;
using PihitWise.Domain.Entities;


namespace PihitWise.Infrastructure.ServiceLogs
{

    public class ServiceLogService : IServiceLogService
    {

        private readonly AppDbContext _db;

        public ServiceLogService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<ServiceLogResponse>?> GetByVehicleAsync(Guid userId, Guid vehicleId)
        {
            var serviceLogs = await _db.ServiceLogs
                .Where(sl => sl.Vehicle.UserId == userId && sl.VehicleId == vehicleId)
                .OrderByDescending(sl => sl.Date)
                .ToListAsync();

            var owns = await _db.Vehicles
                .AnyAsync(v => v.Id == vehicleId && v.UserId == userId);

            if (!owns) return null;

            return serviceLogs.Select(ToResponse).ToList();
        }

        public async Task<ServiceLogResponse?> CreateAsync(Guid userId, Guid vehicleId, ServiceLogRequest request)
        {
            var vehicle = await _db.Vehicles
                .FirstOrDefaultAsync(v => v.Id == vehicleId && v.UserId == userId);

            if (vehicle is null) return null;

            var serviceLog = new ServiceLog
            {
                Id = Guid.NewGuid(),
                VehicleId = vehicleId,
                Date = request.Date,
                Odometer = request.Odometer,
                Type = request.Type,
                Shop = request.Shop,
                Cost = request.Cost,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow
            };
            _db.ServiceLogs.Add(serviceLog);

            if (request.Odometer > vehicle.Odometer)
            {
                vehicle.Odometer = request.Odometer;
            }

            await _db.SaveChangesAsync();

            return ToResponse(serviceLog);
        }

        public async Task<ServiceLogResponse?> UpdateAsync(Guid userId, Guid id, ServiceLogRequest request)
        {
            var serviceLog = await _db.ServiceLogs
                .Include(sl => sl.Vehicle)
                .FirstOrDefaultAsync(sl => sl.Id == id && sl.Vehicle.UserId == userId);
            
            if (serviceLog is null) return null;

            serviceLog.Date = request.Date;
            serviceLog.Odometer = request.Odometer;
            serviceLog.Type = request.Type;
            serviceLog.Shop = request.Shop;
            serviceLog.Cost = request.Cost;
            serviceLog.Notes = request.Notes;

            if (request.Odometer > serviceLog.Vehicle.Odometer)
            {
                serviceLog.Vehicle.Odometer = request.Odometer;
            }

            await _db.SaveChangesAsync();

            return ToResponse(serviceLog);
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid id)
        {
            var serviceLog = await _db.ServiceLogs
                .FirstOrDefaultAsync(sl => sl.Id == id && sl.Vehicle.UserId == userId);

            if (serviceLog is null) return false;

            _db.ServiceLogs.Remove(serviceLog);

            await _db.SaveChangesAsync();

            return true;
        }

        private static ServiceLogResponse ToResponse(ServiceLog sl) =>
         new ServiceLogResponse
            (
                sl.Id,
                sl.VehicleId,
                sl.Date,
                sl.Odometer,
                sl.Type,
                sl.Shop,
                sl.Cost,
                sl.Notes,
                sl.CreatedAt
            );
        
    }
}
