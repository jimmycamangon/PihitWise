namespace PihitWise.Application.Auth
{
    public interface IAuthService
    {
        Task<UserResponse?> RegisterAsync(RegisterRequest request);
        Task<LoginResponse?> LoginAsync(LoginRequest request);
        Task<AccountResult> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
        Task<AccountError> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    }
}
