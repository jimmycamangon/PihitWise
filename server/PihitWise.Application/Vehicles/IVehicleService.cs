
namespace PihitWise.Application.Vehicles
{
    public interface IVehicleService
    {
        Task<List<VehicleResponse>> GetAllAsync(Guid userId);
        Task<VehicleResponse?> GetByIdAsync(Guid userId, Guid id);
        Task<VehicleResponse> CreateAsync(Guid userId, VehicleRequest request);
        Task<VehicleResponse?> UpdateAsync(Guid userId, Guid id, VehicleRequest request);
        Task<bool> DeleteAsync(Guid userId, Guid id);

    }
}
