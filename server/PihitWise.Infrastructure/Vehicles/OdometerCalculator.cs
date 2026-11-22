using Microsoft.EntityFrameworkCore;
using PihitWise.Domain.Entities;
using PihitWise.Infrastructure.Persistence;

namespace PihitWise.Infrastructure.Vehicles;

// A bike's odometer is the highest of: the reading entered in the Garage, every fill-up and every service.
// Recalculating after each change means fixing or deleting a wrong high reading brings the odometer back down.
public static class OdometerCalculator
{
    /// <summary>The highest odometer on any fill-up or service of this bike (null when there are none).</summary>
    public static async Task<int?> HighestLogAsync(AppDbContext db, Guid vehicleId)
    {
        var fuel = await db.FuelLogs.Where(f => f.VehicleId == vehicleId).MaxAsync(f => (int?)f.Odometer);
        var service = await db.ServiceLogs.Where(s => s.VehicleId == vehicleId).MaxAsync(s => (int?)s.Odometer);
        return fuel is null && service is null ? null : Math.Max(fuel ?? 0, service ?? 0);
    }

    /// <summary>Recomputes and saves the bike's odometer. Call after the log change is saved.</summary>
    public static async Task RecalculateAsync(AppDbContext db, Vehicle vehicle)
    {
        var highest = await HighestLogAsync(db, vehicle.Id);
        var odometer = Math.Max(vehicle.StartOdometer, highest ?? 0);
        if (vehicle.Odometer == odometer) return;
        vehicle.Odometer = odometer;
        await db.SaveChangesAsync();
    }
}
