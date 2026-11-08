

namespace PihitWise.Application.FuelLogs
{
    public record FuelLogResponse
    (
        Guid Id,
        Guid VehicleId,
        DateOnly Date,
        int Odometer,
        decimal Liters,
        decimal Cost,
        string? Notes,
        DateTime CreatedAt
    );
    

}
