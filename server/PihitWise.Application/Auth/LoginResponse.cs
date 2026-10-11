
namespace PihitWise.Application.Auth
{
    public record LoginResponse (
        string Token,
        UserResponse User
    );
}
