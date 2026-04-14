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

        var user = new User { Email = "test@example.com", PasswordHash = "" };
        user.PasswordHash = passwordHasher.HashPassword(user, "password");

        context.Users.Add(user);
        await context.SaveChangesAsync();

        context.Tasks.AddRange(
            new TaskItem { Title = "Fix login page crash on Safari", Priority = Priority.Critical, Effort = Effort.Medium, SortOrder = 1000, UserId = user.Id },
            new TaskItem { Title = "Write integration tests for checkout flow", Priority = Priority.High, Effort = Effort.Low, SortOrder = 2000, UserId = user.Id },
            new TaskItem { Title = "Update README with setup instructions", Priority = Priority.Medium, Effort = Effort.High, SortOrder = 3000, UserId = user.Id },
            new TaskItem { Title = "Add favicon", Priority = Priority.Medium, Effort = Effort.Medium, SortOrder = 3001, UserId = user.Id },
            new TaskItem { Title = "Patch SQL injection in search endpoint", Priority = Priority.Medium, Effort = Effort.Low, SortOrder = 3002, UserId = user.Id },
            new TaskItem { Title = "Update .gitignore to exclude build artifacts", Priority = Priority.Low, Effort = Effort.Low, SortOrder = 4000, UserId = user.Id },
            new TaskItem { Title = "Update copyright year in footer", Priority = Priority.Low, Effort = Effort.Medium, SortOrder = 4001, UserId = user.Id },
            new TaskItem { Title = "Pin meeting notes to project wiki", Priority = Priority.Low, Effort = Effort.Low, SortOrder = 4002, UserId = user.Id }
        );

        await context.SaveChangesAsync();
    }
}
