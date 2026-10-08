using Microsoft.EntityFrameworkCore;

namespace Revora.Infrastructure.Persistence;

// The DbContext is EF Core's "session" with the database.
// Each DbSet<T> property becomes a table you can query and save to.
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // TODO (Jim): once the User entity exists in Revora.Domain, add:
    // public DbSet<User> Users => Set<User>();
}
