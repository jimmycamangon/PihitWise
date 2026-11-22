
namespace PihitWise.Application.Vehicles
{
    public interface IVehicleService
    {
        Task<List<VehicleResponse>> GetAllAsync(Guid userId);
        Task<VehicleResponse?> GetByIdAsync(Guid userId, Guid id);
        Task<VehicleResponse> CreateAsync(Guid userId, VehicleRequest request);
        Task<VehicleResponse?> UpdateAsync(Guid userId, Guid id, VehicleRequest request);
        Task<bool> DeleteAsync(Guid userId, Guid id);
        Task<bool> PlateExistsAsync(Guid userId, string plateNumber, Guid? exceptId);
        /// <summary>Highest odometer on this rider's bike's fill-ups and services (null when none).</summary>
        Task<int?> HighestLogOdometerAsync(Guid userId, Guid vehicleId);

    }
}
