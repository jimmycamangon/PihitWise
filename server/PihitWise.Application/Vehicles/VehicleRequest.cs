
using PihitWise.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.Vehicles
{
    public record VehicleRequest
    (
        VehicleType Type,
        [Required, MaxLength(50)] string Name,
        [Required, MaxLength(50)] string Brand,
        [Required, MaxLength(50)] string Model,
        [Range(1900, 2100)] int Year,
        [MaxLength(10)] string? PlateNumber,
        [Range(0, 1000000)] int Odometer
    );
}
