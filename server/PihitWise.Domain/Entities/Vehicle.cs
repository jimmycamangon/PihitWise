
namespace PihitWise.Domain.Entities
{
    public class Vehicle
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public VehicleType Type { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string? PlateNumber { get; set; }
        public int Odometer { get; set; }
        // The reading the rider entered in the Garage. Odometer = the highest of this and all fill-up / service readings.
        public int StartOdometer { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
