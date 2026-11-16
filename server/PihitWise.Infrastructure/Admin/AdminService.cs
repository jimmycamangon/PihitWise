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

    public async Task<AdminUsersPage> GetUsersAsync(string? search, int page, int pageSize)
    {
        var users = _db.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            // Case-insensitive "contains"; % and _ typed by the admin are matched literally.
            var term = "%" + search.Trim().Replace(@"\", @"\\").Replace("%", @"\%").Replace("_", @"\_") + "%";
            users = users.Where(u => EF.Functions.ILike(u.FullName, term) || EF.Functions.ILike(u.Email, term));
        }

        var total = await users.CountAsync();

        // Only this page's users are loaded, each with its counts in the same query.
        var items = await users
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var activeSince = now.AddDays(-30);

        return new AdminUsersPage(
            items,
            total,
            page,
            pageSize,
            await _db.Users.CountAsync(),
            await _db.Users.CountAsync(u => u.CreatedAt >= monthStart),
            await _db.Users.CountAsync(u => u.LastActiveAt >= activeSince));
    }
}
