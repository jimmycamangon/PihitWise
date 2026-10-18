

using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.ServiceLogs
{
    public record ServiceLogRequest
    (
        DateOnly Date,
        [Range(0, 1000000)] int Odometer,
        [Required, MaxLength(50)] string Type,
        [MaxLength(100)] string? Shop,
        [Range(0, 1000000)] decimal Cost,
        [MaxLength(500)] string? Notes
    );
}
