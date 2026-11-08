using Microsoft.EntityFrameworkCore;
using PihitWise.Application.FuelLogs;
using PihitWise.Infrastructure.Persistence;
using PihitWise.Domain.Entities;


namespace PihitWise.Infrastructure.FuelLogs
{
    public class FuelLogService : IFuelLogService
    {
        private readonly AppDbContext _db;
        public FuelLogService(AppDbContext db)
        {
            _db = db;
        }
        public async Task<List<FuelLogResponse>?> GetByVehicleAsync(Guid userId, Guid vehicleId)
        {
            var owns = await _db.Vehicles
                .AnyAsync(v => v.Id == vehicleId && v.UserId == userId);
            if (!owns) return null;
            var fuelLogs = await _db.FuelLogs
                .Where(fl => fl.Vehicle.UserId == userId && fl.VehicleId == vehicleId)
                .OrderByDescending(fl => fl.Date)
                .ToListAsync();
            return fuelLogs.Select(ToResponse).ToList();
        }

        public async Task<FuelLogResponse?> CreateAsync(Guid userId, Guid vehicleId, FuelLogRequest request)
        {
            var vehicle = await _db.Vehicles
                .FirstOrDefaultAsync(v => v.Id == vehicleId && v.UserId == userId);
            if (vehicle is null) return null;
            var fuelLog = new FuelLog
            {
                Id = Guid.NewGuid(),
                VehicleId = vehicleId,
                Date = request.Date,
                Odometer = request.Odometer,
                Liters = request.Liters,
                Cost = request.Cost,
                IsFullTank = request.IsFullTank,
                CreatedAt = DateTime.UtcNow
            };
            _db.FuelLogs.Add(fuelLog);
            if (request.Odometer > vehicle.Odometer)
            {
                vehicle.Odometer = request.Odometer;
            }
            await _db.SaveChangesAsync();
            return ToResponse(fuelLog);
        }

        public async Task<FuelLogResponse?> UpdateAsync(Guid userId, Guid id, FuelLogRequest request)
        {
            var fuelLog = await _db.FuelLogs
                .Include(fl => fl.Vehicle)
                .FirstOrDefaultAsync(fl => fl.Id == id && fl.Vehicle.UserId == userId);
            if (fuelLog is null) return null;
            fuelLog.Date = request.Date;
            fuelLog.Odometer = request.Odometer;
            fuelLog.Liters = request.Liters;
            fuelLog.Cost = request.Cost;
            fuelLog.IsFullTank = request.IsFullTank;
            if (request.Odometer > fuelLog.Vehicle.Odometer)
            {
                fuelLog.Vehicle.Odometer = request.Odometer;
            }
            await _db.SaveChangesAsync();
            return ToResponse(fuelLog);
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid id)
        {
            var fuelLog = await _db.FuelLogs
                .Include(fl => fl.Vehicle)
                .FirstOrDefaultAsync(fl => fl.Id == id && fl.Vehicle.UserId == userId);
            if (fuelLog is null) return false;
            _db.FuelLogs.Remove(fuelLog);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<FuelEconomyResponse?> GetEconomyAsync(Guid userId, Guid vehicleId)
        {
            var owns = await _db.Vehicles
                .AnyAsync(v => v.Id == vehicleId && v.UserId == userId);
            if (!owns) return null;

            // Oldest first: we walk forward in time.
            var fuelLogs = await _db.FuelLogs
                .Where(fl => fl.VehicleId == vehicleId)
                .OrderBy(fl => fl.Date)
                .ThenBy(fl => fl.Odometer)
                .ToListAsync();

            var points = new List<FuelEconomyPoint>();
            decimal totalKm = 0;
            decimal totalLiters = 0;

            FuelLog? lastFull = null;   // the last full tank = start point
            decimal liters = 0;         // liters added since that start point

            foreach (var log in fuelLogs)
            {
                // Liters only count after we have a start point.
                if (lastFull is not null)
                    liters += log.Liters;

                if (!log.IsFullTank) continue;

                // Full tank again: km since the last full tank / liters since then.
                if (lastFull is not null && liters > 0)
                {
                    var km = log.Odometer - lastFull.Odometer;
                    if (km > 0)
                    {
                        var kmPerLiter = km / liters;
                        points.Add(new FuelEconomyPoint(log.Id, log.Date, Math.Round(kmPerLiter, 1)));
                        totalKm += km;
                        totalLiters += liters;
                    }
                }

                // This full tank is the new start point.
                lastFull = log;
                liters = 0;
            }

            decimal? average = totalLiters > 0 ? Math.Round(totalKm / totalLiters, 1) : null;
            return new FuelEconomyResponse(average, points);
        }

        private static FuelLogResponse ToResponse(FuelLog fuelLog)
        {
            return new FuelLogResponse(
                fuelLog.Id,
                fuelLog.VehicleId,
                fuelLog.Date,
                fuelLog.Odometer,
                fuelLog.Liters,
                fuelLog.Cost,
                fuelLog.IsFullTank,
                fuelLog.CreatedAt
            );
        }
    }
}
