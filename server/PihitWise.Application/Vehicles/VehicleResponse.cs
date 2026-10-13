
namespace PihitWise.Application.Vehicles
{
    public record VehicleResponse
    (
        Guid Id,
        string Type,
        string Name,
        string Brand,
        string Model,
        int Year,
        string PlateNumber,
        int Odometer,
        DateTime CreatedAt
    );
}
