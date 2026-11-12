using Microsoft.EntityFrameworkCore;
using PihitWise.Application.Reminders;
using PihitWise.Infrastructure.Persistence;
using PihitWise.Domain.Entities;


namespace PihitWise.Infrastructure.Reminders
{
    public class ReminderService : IReminderService
    {
        private readonly AppDbContext _db;

        public ReminderService(AppDbContext db)
        {
            _db = db;
        }
        public async Task<List<ReminderResponse>?> GetByVehicleAsync(Guid userId, Guid vehicleId)
        {
            var owns = await _db.Vehicles
                .AnyAsync(v => v.Id == vehicleId && v.UserId == userId);
            if (!owns) return null;
            var reminders = await _db.Reminders
                .Include(r => r.Vehicle)
                .Where(r => r.Vehicle.UserId == userId && r.VehicleId == vehicleId)
                .OrderByDescending(r => r.DueDate)
                .ToListAsync();
            return reminders.Select(ToResponse).OrderBy(r => Rank(r.Status)).ToList();
        }
        public async Task<ReminderResponse?> CreateAsync(Guid userId, Guid vehicleId, ReminderRequest request)
        {
            var vehicle = await _db.Vehicles
                .FirstOrDefaultAsync(v => v.Id == vehicleId && v.UserId == userId);
            if (vehicle is null) return null;
            var reminder = new Reminder
            {
                Vehicle = vehicle,
                Id = Guid.NewGuid(),
                VehicleId = vehicleId,
                Title = request.Title,
                DueOdometer = request.DueOdometer,
                DueDate = request.DueDate,
                IsDone = false,
                CreatedAt = DateTime.UtcNow
            };
            _db.Reminders.Add(reminder);
            await _db.SaveChangesAsync();
            return ToResponse(reminder);
        }

        public async Task<ReminderResponse?> UpdateAsync(Guid userId, Guid id, ReminderRequest request)
        {
            var reminder = await _db.Reminders
                .Include(r => r.Vehicle)
                .FirstOrDefaultAsync(r => r.Id == id && r.Vehicle.UserId == userId);
            if (reminder is null) return null;
            reminder.Title = request.Title;
            reminder.DueOdometer = request.DueOdometer;
            reminder.DueDate = request.DueDate;
            await _db.SaveChangesAsync();
            return ToResponse(reminder);
        }

        public async Task<ReminderResponse?> MarkDoneAsync(Guid userId, Guid id)
        {
            var reminder = await _db.Reminders
                .Include(r => r.Vehicle)
                .FirstOrDefaultAsync(r => r.Id == id && r.Vehicle.UserId == userId);
            if (reminder is null) return null;
            reminder.IsDone = true;
            await _db.SaveChangesAsync();
            return ToResponse(reminder);
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid id)
        {
            var reminder = await _db.Reminders
                .Include(r => r.Vehicle)
                .FirstOrDefaultAsync(r => r.Id == id && r.Vehicle.UserId == userId);
            if (reminder is null) return false;
            _db.Reminders.Remove(reminder);
            await _db.SaveChangesAsync();
            return true;
        }

        private static ReminderResponse ToResponse(Reminder r)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            int? kmLeft = r.DueOdometer is null ? null : r.DueOdometer - r.Vehicle.Odometer;
            int? daysLeft = r.DueDate is null ? null : r.DueDate.Value.DayNumber - today.DayNumber;

            string status;
            if (r.IsDone) status = "done";
            else if (kmLeft < 0 || daysLeft < 0) status = "overdue";
            else if (kmLeft <= 500 || daysLeft <= 30) status = "soon";
            else status = "ok";

            return new ReminderResponse(
                r.Id,
                r.VehicleId,
                r.Title,
                r.DueOdometer,
                r.DueDate,
                r.IsDone,
                status,
                kmLeft,
                daysLeft,
                r.CreatedAt
                );
        }

        private static int Rank(string status) => status switch
        {
            "overdue" => 0,
            "soon" => 1,
            "ok" => 2,
            _ => 3
        };
    }
}
