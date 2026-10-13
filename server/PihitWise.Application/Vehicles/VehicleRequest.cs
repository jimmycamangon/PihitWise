
using PihitWise.Domain.Entities;

namespace PihitWise.Application.Vehicles
{
    public record VehicleRequest
    (
        VehicleType Type,
        string Name,
        string Brand,
        string Model,
        int Year,
        string? PlateNumber,
        int Odometer
    );
}
