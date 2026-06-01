using Microsoft.AspNetCore.Identity;
using Nudge.Shared.Data;
using Nudge.Shared.Data.Domain;
using Nudge.Shared.Enums;

namespace Nudge.API.Services;

public class SeedData
{
    public static async Task Initialize(NudgeDbContext context, PasswordHasher<User> passwordHasher)
    {
        if (context.Users.Any()) return;

        var user = new User { Email = "test@example.com", PasswordHash = "", IsAdmin = true };
        user.PasswordHash = passwordHasher.HashPassword(user, "password");

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var baseTime = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        context.Tasks.AddRange(
            new TaskItem { Title = "Fix login page crash on Safari", Priority = Priority.Critical, Effort = Effort.Medium, CreatedAt = baseTime.AddMinutes(1), UpdatedAt = baseTime.AddMinutes(1), UserId = user.Id },
            new TaskItem { Title = "Write integration tests for checkout flow", Priority = Priority.High, Effort = Effort.Low, CreatedAt = baseTime.AddMinutes(2), UpdatedAt = baseTime.AddMinutes(2), UserId = user.Id },
            new TaskItem { Title = "Update README with setup instructions", Priority = Priority.Medium, Effort = Effort.High, CreatedAt = baseTime.AddMinutes(3), UpdatedAt = baseTime.AddMinutes(3), UserId = user.Id },
            new TaskItem { Title = "Add favicon", Priority = Priority.Medium, Effort = Effort.Medium, CreatedAt = baseTime.AddMinutes(4), UpdatedAt = baseTime.AddMinutes(4), UserId = user.Id },
            new TaskItem { Title = "Patch SQL injection in search endpoint", Priority = Priority.Medium, Effort = Effort.Low, CreatedAt = baseTime.AddMinutes(5), UpdatedAt = baseTime.AddMinutes(5), UserId = user.Id },
            new TaskItem { Title = "Update .gitignore to exclude build artifacts", Priority = Priority.Low, Effort = Effort.Low, CreatedAt = baseTime.AddMinutes(6), UpdatedAt = baseTime.AddMinutes(6), UserId = user.Id },
            new TaskItem { Title = "Update copyright year in footer", Priority = Priority.Low, Effort = Effort.Medium, CreatedAt = baseTime.AddMinutes(7), UpdatedAt = baseTime.AddMinutes(7), UserId = user.Id },
            new TaskItem { Title = "Pin meeting notes to project wiki", Priority = Priority.Low, Effort = Effort.Low, CreatedAt = baseTime.AddMinutes(8), UpdatedAt = baseTime.AddMinutes(8), UserId = user.Id }
        );

        await context.SaveChangesAsync();
    }
}
