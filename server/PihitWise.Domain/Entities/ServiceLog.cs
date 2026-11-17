
namespace PihitWise.Domain.Entities
{
    public class ServiceLog
    {
        public Guid VehicleId { get; set; }
        public Vehicle Vehicle { get; set; } = null!;
        public DateOnly Date { get; set; }
        public decimal Cost { get; set; }
        public string? Shop { get; set; }

        public Guid Id { get; set; }
        public int Odometer { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        // Last time the entry was changed after it was first saved (null = never edited). Shown on exported reports.
        public DateTime? UpdatedAt { get; set; }
    }
}
