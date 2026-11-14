namespace PihitWise.Application.Admin
{
    // One row in the admin user list: account info and how much they've logged, never the logs themselves.
    public record AdminUserResponse
    (
        Guid Id,
        string FullName,
        string Email,
        DateTime CreatedAt,
        DateTime? LastActiveAt,
        int Bikes,
        int FuelLogs,
        int ServiceLogs,
        int Expenses,
        int Reminders
    );
}
