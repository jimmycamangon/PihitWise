using Microsoft.EntityFrameworkCore;
using PihitWise.Application.Expenses;
using PihitWise.Domain.Entities;
using PihitWise.Infrastructure.Persistence;

namespace PihitWise.Infrastructure.Expenses
{
    public class ExpenseService : IExpenseService
    {
        private readonly AppDbContext _db;

        public ExpenseService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<ExpenseResponse>?> GetByVehicleAsync(Guid userId, Guid vehicleId)
        {
            var owns = await _db.Vehicles
                .AnyAsync(v => v.Id == vehicleId && v.UserId == userId);

            if (!owns) return null;

            var expenses = await _db.Expenses
                .Where(e => e.Vehicle.UserId == userId && e.VehicleId == vehicleId)
                .OrderByDescending(e => e.Date)
                .ThenByDescending(e => e.CreatedAt)
                .ToListAsync();

            return expenses.Select(ToResponse).ToList();
        }

        public async Task<ExpenseResponse?> CreateAsync(Guid userId, Guid vehicleId, ExpenseRequest request)
        {
            var owns = await _db.Vehicles
                .AnyAsync(v => v.Id == vehicleId && v.UserId == userId);

            if (!owns) return null;

            var expense = new Expense
            {
                Id = Guid.NewGuid(),
                VehicleId = vehicleId,
                Date = request.Date,
                Label = request.Label.Trim(),
                Cost = request.Cost,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow
            };
            _db.Expenses.Add(expense);

            await _db.SaveChangesAsync();

            return ToResponse(expense);
        }

        public async Task<ExpenseResponse?> UpdateAsync(Guid userId, Guid id, ExpenseRequest request)
        {
            var expense = await _db.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.Vehicle.UserId == userId);

            if (expense is null) return null;

            expense.Date = request.Date;
            expense.Label = request.Label.Trim();
            expense.Cost = request.Cost;
            expense.Notes = request.Notes;

            await _db.SaveChangesAsync();

            return ToResponse(expense);
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid id)
        {
            var expense = await _db.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.Vehicle.UserId == userId);

            if (expense is null) return false;

            _db.Expenses.Remove(expense);

            await _db.SaveChangesAsync();

            return true;
        }

        private static ExpenseResponse ToResponse(Expense e) =>
            new ExpenseResponse
            (
                e.Id,
                e.VehicleId,
                e.Date,
                e.Label,
                e.Cost,
                e.Notes,
                e.CreatedAt
            );
    }
}
