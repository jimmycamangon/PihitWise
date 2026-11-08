
namespace PihitWise.Domain.Entities
{
    public class FuelLog
    {
        public Guid VehicleId { get; set; }
        public Vehicle Vehicle { get; set; } = null!;
        public DateOnly Date { get; set; }
        public decimal Cost { get; set; }
        public Guid Id { get; set; }
        public int Odometer { get; set; }
        public decimal Liters { get; set; }
        public bool IsFullTank { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
