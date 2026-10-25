
namespace PihitWise.Application.ServiceLogs
{
    public interface IServiceLogService
    {
        Task<List<ServiceLogResponse>?> GetByVehicleAsync(Guid userId, Guid vehicleId);
        Task<ServiceLogResponse?> CreateAsync(Guid userId, Guid vehicleId, ServiceLogRequest request);
        Task<ServiceLogResponse?> UpdateAsync(Guid userId, Guid id, ServiceLogRequest request);
        Task<bool> DeleteAsync(Guid userId, Guid id);
    }
}
