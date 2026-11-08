

namespace PihitWise.Application.FuelLogs
{
    public interface IFuelLogService
    {
        Task<List<FuelLogResponse>?> GetByVehicleAsync(Guid userId, Guid vehicleId);
        Task<FuelLogResponse?> CreateAsync(Guid userId, Guid vehicleId, FuelLogRequest request);
        Task<FuelLogResponse?> UpdateAsync(Guid userId, Guid id, FuelLogRequest request);
        Task<bool> DeleteAsync(Guid userId, Guid id);
        Task<FuelEconomyResponse?> GetEconomyAsync(Guid userId, Guid vehicleId);
    }
}
