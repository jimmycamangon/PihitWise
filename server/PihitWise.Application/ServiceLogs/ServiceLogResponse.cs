
namespace PihitWise.Application.ServiceLogs
{
    public record ServiceLogResponse
    (
        Guid Id,
        Guid VehicleId,
        DateOnly Date,
        int Odometer,
        string Type,
        string? Shop,
        decimal Cost,
        string? Notes,
        DateTime CreatedAt
    );
    
}
