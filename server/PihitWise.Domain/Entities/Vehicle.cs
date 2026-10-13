
namespace PihitWise.Domain.Entities
{
    public class Vehicle
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Type { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string? PlateNumber { get; set; }
        public int Odometer { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
