

namespace PihitWise.Application.Reminders
{
    public interface IReminderService
    {
        Task<List<ReminderResponse>?> GetByVehicleAsync(Guid userId, Guid vehicleId);
        Task<ReminderResponse?> CreateAsync(Guid userId, Guid vehicleId, ReminderRequest request);
        Task<ReminderResponse?> UpdateAsync(Guid userId, Guid id, ReminderRequest request);
        Task<bool> DeleteAsync(Guid userId, Guid id);
        Task<ReminderResponse?> MarkDoneAsync(Guid userId, Guid id);
    }
}
