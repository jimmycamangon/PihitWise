using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.Expenses
{
    public record ExpenseRequest
    (
        DateOnly Date,
        [Required, MaxLength(100)] string Label,
        [Range(0, 1000000)] decimal Cost,
        [MaxLength(500)] string? Notes
    );
}
