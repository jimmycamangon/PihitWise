namespace PihitWise.Application.Admin
{
    // One page of the admin user list plus the summary counts, all worked out in the database.
    public record AdminUsersPage
    (
        List<AdminUserResponse> Items,
        int Total,          // users matching the search (for paging)
        int Page,
        int PageSize,
        int TotalUsers,
        int NewThisMonth,
        int ActiveLast30Days
    );
}
