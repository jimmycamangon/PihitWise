using PihitWise.Domain.Entities;

namespace PihitWise.Application.Auth;

// Creates the signed token (JWT) a user gets after logging in.
public interface IJwtTokenGenerator
{
    // remember = "Remember me" on sign in: a long-lived token instead of the usual short one.
    string GenerateToken(User user, bool remember = false);
}
