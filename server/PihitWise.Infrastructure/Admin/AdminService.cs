using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PihitWise.Application.Admin;
using PihitWise.Infrastructure.Persistence;

namespace PihitWise.Infrastructure.Admin;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    private readonly HashSet<string> _admins;

    public AdminService(AppDbContext db, IOptions<AdminSettings> settings)
    {
        _db = db;
        _admins = settings.Value.Emails
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    public bool IsAdmin(string? email) => !string.IsNullOrWhiteSpace(email) && _admins.Contains(email.Trim());

    public Task<List<AdminUserResponse>> GetUsersAsync() =>
        _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserResponse(
                u.Id,
                u.FullName,
                u.Email,
                u.CreatedAt,
                u.LastActiveAt,
                _db.Vehicles.Count(v => v.UserId == u.Id),
                _db.FuelLogs.Count(f => f.Vehicle.UserId == u.Id),
                _db.ServiceLogs.Count(s => s.Vehicle.UserId == u.Id),
                _db.Expenses.Count(e => e.Vehicle.UserId == u.Id),
                _db.Reminders.Count(r => r.Vehicle.UserId == u.Id)))
            .ToListAsync();
}
