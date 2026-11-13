
namespace PihitWise.Application.Reminders
{
    public record ReminderResponse
    (
        Guid Id,
        Guid VehicleId,
        string Title,
        int? DueOdometer,
        DateOnly? DueDate,
        bool IsDone,
        string Status,
        int? KmLeft,
        int? DaysLeft,
        DateTime CreatedAt,
        int? RepeatEveryKm
    );
}
