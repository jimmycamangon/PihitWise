using PihitWise.Domain.Entities;

namespace PihitWise.Application.Auth;

// Creates the signed token (JWT) a user gets after logging in.
public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
