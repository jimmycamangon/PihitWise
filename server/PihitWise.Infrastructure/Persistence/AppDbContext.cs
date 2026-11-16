using Microsoft.EntityFrameworkCore;
using PihitWise.Domain.Entities;

namespace PihitWise.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<ServiceLog> ServiceLogs => Set<ServiceLog>();
    public DbSet<FuelLog> FuelLogs => Set<FuelLog>();
    public DbSet<Reminder> Reminders => Set<Reminder>();
    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var user = modelBuilder.Entity<User>();
        // Sign in, register and password reset look users up by email: an index keeps that instant
        // with any number of users, and "unique" stops two accounts sharing an email at the database level.
        user.HasIndex(u => u.Email).IsUnique();
        // The admin list sorts by join date and counts recently active riders.
        user.HasIndex(u => u.CreatedAt);
        user.HasIndex(u => u.LastActiveAt);
    }
}
