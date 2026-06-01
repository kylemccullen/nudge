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

        var t = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var today = DateOnly.FromDateTime(DateTime.Today);

        context.Tasks.AddRange(
            // --- Overdue: past due dates, will appear in Overdue section ---
            new TaskItem { Title = "Submit expense report", Priority = Priority.Critical, Effort = Effort.Low, DueDate = today.AddDays(-4), CreatedAt = t.AddMinutes(1), UpdatedAt = t.AddMinutes(1), UserId = user.Id },
            new TaskItem { Title = "Reply to client proposal", Priority = Priority.High, Effort = Effort.Medium, DueDate = today.AddDays(-2), CreatedAt = t.AddMinutes(2), UpdatedAt = t.AddMinutes(2), UserId = user.Id },

            // --- Due today: 4 + 2 = 6 pts on a weekday (limit 4) → triggers ⚠ overflow ---
            new TaskItem { Title = "Deploy hotfix to production", Priority = Priority.Critical, Effort = Effort.High, DueDate = today, CreatedAt = t.AddMinutes(3), UpdatedAt = t.AddMinutes(3), UserId = user.Id },
            new TaskItem { Title = "Update API documentation", Priority = Priority.High, Effort = Effort.Medium, DueDate = today, CreatedAt = t.AddMinutes(4), UpdatedAt = t.AddMinutes(4), UserId = user.Id },

            // --- Due tomorrow: pinned to that day ---
            new TaskItem { Title = "Code review for PR #42", Priority = Priority.Medium, Effort = Effort.Low, DueDate = today.AddDays(1), CreatedAt = t.AddMinutes(5), UpdatedAt = t.AddMinutes(5), UserId = user.Id },

            // --- Due in 4 days: pinned to future day group ---
            new TaskItem { Title = "Prepare sprint retrospective", Priority = Priority.Medium, Effort = Effort.Medium, DueDate = today.AddDays(4), CreatedAt = t.AddMinutes(6), UpdatedAt = t.AddMinutes(6), UserId = user.Id },

            // --- Undated: scheduler fills remaining capacity across the week ---
            new TaskItem { Title = "Fix login page crash on Safari", Priority = Priority.Critical, Effort = Effort.Medium, CreatedAt = t.AddMinutes(7), UpdatedAt = t.AddMinutes(7), UserId = user.Id },
            new TaskItem { Title = "Write unit tests for auth module", Priority = Priority.High, Effort = Effort.Low, CreatedAt = t.AddMinutes(8), UpdatedAt = t.AddMinutes(8), UserId = user.Id },
            new TaskItem { Title = "Refactor database query layer", Priority = Priority.Medium, Effort = Effort.High, CreatedAt = t.AddMinutes(9), UpdatedAt = t.AddMinutes(9), UserId = user.Id },
            new TaskItem { Title = "Consolidate error handling patterns", Priority = Priority.Medium, Effort = Effort.High, CreatedAt = t.AddMinutes(10), UpdatedAt = t.AddMinutes(10), UserId = user.Id },
            new TaskItem { Title = "Audit third-party dependencies", Priority = Priority.Medium, Effort = Effort.High, CreatedAt = t.AddMinutes(11), UpdatedAt = t.AddMinutes(11), UserId = user.Id },
            new TaskItem { Title = "Update .gitignore to exclude build artifacts", Priority = Priority.Low, Effort = Effort.Low, CreatedAt = t.AddMinutes(12), UpdatedAt = t.AddMinutes(12), UserId = user.Id },
            new TaskItem { Title = "Add favicon to marketing site", Priority = Priority.Low, Effort = Effort.Low, CreatedAt = t.AddMinutes(13), UpdatedAt = t.AddMinutes(13), UserId = user.Id },
            new TaskItem { Title = "Update copyright year in footer", Priority = Priority.Low, Effort = Effort.Medium, CreatedAt = t.AddMinutes(14), UpdatedAt = t.AddMinutes(14), UserId = user.Id },
            new TaskItem { Title = "Write blog post about v2 launch", Priority = Priority.Low, Effort = Effort.High, CreatedAt = t.AddMinutes(15), UpdatedAt = t.AddMinutes(15), UserId = user.Id },
            new TaskItem { Title = "Research competitor pricing", Priority = Priority.Low, Effort = Effort.Medium, CreatedAt = t.AddMinutes(16), UpdatedAt = t.AddMinutes(16), UserId = user.Id },
            new TaskItem { Title = "Archive stale git branches", Priority = Priority.Low, Effort = Effort.Low, CreatedAt = t.AddMinutes(17), UpdatedAt = t.AddMinutes(17), UserId = user.Id },
            new TaskItem { Title = "Update team onboarding guide", Priority = Priority.Low, Effort = Effort.High, CreatedAt = t.AddMinutes(18), UpdatedAt = t.AddMinutes(18), UserId = user.Id },
            new TaskItem { Title = "Configure error monitoring alerts", Priority = Priority.Low, Effort = Effort.Medium, CreatedAt = t.AddMinutes(19), UpdatedAt = t.AddMinutes(19), UserId = user.Id },
            new TaskItem { Title = "Migrate legacy config to env vars", Priority = Priority.Low, Effort = Effort.Medium, CreatedAt = t.AddMinutes(20), UpdatedAt = t.AddMinutes(20), UserId = user.Id },
            new TaskItem { Title = "Document internal REST API", Priority = Priority.Low, Effort = Effort.Low, CreatedAt = t.AddMinutes(21), UpdatedAt = t.AddMinutes(21), UserId = user.Id },
            new TaskItem { Title = "Draft Q3 engineering roadmap", Priority = Priority.Low, Effort = Effort.High, CreatedAt = t.AddMinutes(22), UpdatedAt = t.AddMinutes(22), UserId = user.Id },
            new TaskItem { Title = "Triage open GitHub issues", Priority = Priority.Low, Effort = Effort.Low, CreatedAt = t.AddMinutes(23), UpdatedAt = t.AddMinutes(23), UserId = user.Id },
            new TaskItem { Title = "Update translation strings", Priority = Priority.Low, Effort = Effort.Medium, CreatedAt = t.AddMinutes(24), UpdatedAt = t.AddMinutes(24), UserId = user.Id },

            // --- Done ---
            new TaskItem { Title = "Set up CI/CD pipeline", Priority = Priority.High, Effort = Effort.High, IsDone = true, CompletedDate = t.AddDays(1), CreatedAt = t, UpdatedAt = t.AddDays(1), UserId = user.Id },
            new TaskItem { Title = "Initialize project repository", Priority = Priority.Critical, Effort = Effort.Low, IsDone = true, CompletedDate = t, CreatedAt = t, UpdatedAt = t, UserId = user.Id }
        );

        await context.SaveChangesAsync();
    }
}
