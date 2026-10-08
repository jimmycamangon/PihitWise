using Microsoft.EntityFrameworkCore;
using PihitWise.Domain.Entities;

namespace PihitWise.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
}
