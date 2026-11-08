using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.FuelLogs
{
    public record FuelLogRequest
    (
        DateOnly Date,
        [Range(0, 1000000)] int Odometer,
        [Range(0, 1000000)] decimal Liters,
        [Range(0, 1000000)] decimal Cost,
        [MaxLength(500)] string? Notes
    );
}
