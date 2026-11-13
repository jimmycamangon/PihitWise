
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
        // Set = the reminder repeats: marking it done moves DueOdometer to
        // the bike's odometer + this many km, instead of closing it.
        public int? RepeatEveryKm { get; set; }

    }
}
