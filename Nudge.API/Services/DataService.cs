using Microsoft.EntityFrameworkCore;
using Nudge.API.Interfaces;
using Nudge.Shared.Data;
using Nudge.Shared.Data.Domain;
using Nudge.Shared.DTOs;

namespace Nudge.API.Services;

public class DataService(NudgeDbContext context) : IDataService
{
    public async Task<UserExportDto> ExportAsync(Guid userId)
    {
        var tasks = await context.Tasks
            .Where(t => t.UserId == userId)
            .ToListAsync();

        var overrides = await context.DayCapacityOverrides
            .Where(o => o.UserId == userId)
            .ToListAsync();

        return new UserExportDto(
            Version: 1,
            ExportedAt: DateTime.UtcNow,
            Tasks: tasks.Select(t => new TaskExportDto(
                t.Id, t.Title, t.IsDone, t.Priority, t.Effort,
                t.CompletedDate, t.DueDate, t.CreatedAt, t.UpdatedAt)).ToList(),
            CapacityOverrides: overrides.Select(o => new CapacityOverrideExportDto(
                o.Date, o.ExtraCapacity)).ToList()
        );
    }

    public async Task ImportAsync(UserExportDto export, Guid userId)
    {
        foreach (var t in export.Tasks)
        {
            var existing = await context.Tasks
                .FirstOrDefaultAsync(x => x.Id == t.Id && x.UserId == userId);

            if (existing is null)
            {
                context.Tasks.Add(new TaskItem
                {
                    Id = t.Id,
                    Title = t.Title,
                    IsDone = t.IsDone,
                    Priority = t.Priority,
                    Effort = t.Effort,
                    CompletedDate = t.CompletedDate,
                    DueDate = t.DueDate,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                    UserId = userId
                });
            }
            else
            {
                existing.Title = t.Title;
                existing.IsDone = t.IsDone;
                existing.Priority = t.Priority;
                existing.Effort = t.Effort;
                existing.CompletedDate = t.CompletedDate;
                existing.DueDate = t.DueDate;
                existing.UpdatedAt = t.UpdatedAt;
            }
        }

        foreach (var o in export.CapacityOverrides)
        {
            var existing = await context.DayCapacityOverrides
                .FirstOrDefaultAsync(x => x.UserId == userId && x.Date == o.Date);

            if (existing is null)
            {
                context.DayCapacityOverrides.Add(new DayCapacityOverride
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Date = o.Date,
                    ExtraCapacity = o.ExtraCapacity
                });
            }
            else
            {
                existing.ExtraCapacity = o.ExtraCapacity;
            }
        }

        await context.SaveChangesAsync();
    }
}
