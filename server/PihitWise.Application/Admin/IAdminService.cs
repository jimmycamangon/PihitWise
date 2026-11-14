namespace PihitWise.Application.Admin
{
    public interface IAdminService
    {
        /// <summary>True when this email is in the Admin:Emails setting.</summary>
        bool IsAdmin(string? email);
        Task<List<AdminUserResponse>> GetUsersAsync();
    }
}
