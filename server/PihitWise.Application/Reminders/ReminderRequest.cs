
using System.ComponentModel.DataAnnotations;

namespace PihitWise.Application.Reminders
{
    public record ReminderRequest
    (
        [Required, MaxLength(100)] string Title,
        [Range(0, 1000000)] int? DueOdometer,
        DateOnly? DueDate,
        [Range(1, 100000)] int? RepeatEveryKm = null
    );
}
