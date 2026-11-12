
namespace PihitWise.Domain.Entities
{
    public class Reminder
    {
        public Guid Id { get; set; }
        public Vehicle Vehicle { get; set; } = null!;
        public Guid VehicleId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? DueOdometer { get; set; }
        public DateOnly? DueDate { get; set; }
        public bool IsDone { get; set; }

    }
}
