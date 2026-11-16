namespace PihitWise.Application.Admin
{
    public interface IAdminService
    {
        /// <summary>True when this email is in the Admin:Emails setting.</summary>
        bool IsAdmin(string? email);
        /// <summary>One page of users (newest first), optionally filtered by name or email.</summary>
        Task<AdminUsersPage> GetUsersAsync(string? search, int page, int pageSize);
    }
}
