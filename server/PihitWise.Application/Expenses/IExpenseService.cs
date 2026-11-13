namespace PihitWise.Application.Expenses
{
    public interface IExpenseService
    {
        Task<List<ExpenseResponse>?> GetByVehicleAsync(Guid userId, Guid vehicleId);
        Task<ExpenseResponse?> CreateAsync(Guid userId, Guid vehicleId, ExpenseRequest request);
        Task<ExpenseResponse?> UpdateAsync(Guid userId, Guid id, ExpenseRequest request);
        Task<bool> DeleteAsync(Guid userId, Guid id);
    }
}
