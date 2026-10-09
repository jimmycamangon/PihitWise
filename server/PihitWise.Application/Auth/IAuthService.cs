
namespace PihitWise.Application.Auth
{
    public interface IAuthService
    {
        Task<UserResponse?> RegisterAsync(RegisterRequest request);
    }
}
