
namespace PihitWise.Application.Auth
{

    public record UserResponse(
        Guid Id,
        string FullName,
        string Email
        );
}
