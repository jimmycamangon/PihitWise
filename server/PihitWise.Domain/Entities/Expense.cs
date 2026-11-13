
namespace PihitWise.Domain.Entities
{
    // A cost that is not a fill-up or a service: a bike wash, a phone holder,
    // insurance, registration. Fuel and maintenance costs live on their own logs.
    public class Expense
    {
        public Guid Id { get; set; }
        public Guid VehicleId { get; set; }
        public Vehicle Vehicle { get; set; } = null!;
        public DateOnly Date { get; set; }
        public string Label { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
