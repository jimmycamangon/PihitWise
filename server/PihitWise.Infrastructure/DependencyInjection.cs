using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PihitWise.Domain.Entities;
using PihitWise.Infrastructure.Persistence;

namespace PihitWise.Infrastructure;

// Registers everything the Infrastructure layer provides, so Program.cs
// only needs one line: builder.Services.AddInfrastructure(builder.Configuration);
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

        // Turns a plain password into a salted hash, and checks a password against a stored hash.
        // Ask for IPasswordHasher<User> in a constructor to use it.
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

        return services;
    }
}
