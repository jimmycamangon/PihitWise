
namespace PihitWise.Application.Expenses
{
    public record ExpenseResponse
    (
        Guid Id,
        Guid VehicleId,
        DateOnly Date,
        string Label,
        decimal Cost,
        string? Notes,
        DateTime CreatedAt
    );
}
