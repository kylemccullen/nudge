using Microsoft.EntityFrameworkCore;
using Nudge.API.Interfaces;
using Nudge.Shared.Data;
using Nudge.Shared.Data.Domain;
using Nudge.Shared.DTOs;

namespace Nudge.API.Services;

public class TaskService(NudgeDbContext context) : ITasksService
{
    public async Task<List<TaskItem>> GetAsync(Guid userId)
    {
        return await context.Tasks
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Priority)
            .ThenBy(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<TaskItem> AddAsync(CreateTaskRequest request, Guid userId)
    {
        var task = new TaskItem
        {
            Title = request.Title,
            Priority = request.Priority,
            Effort = request.Effort,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            UserId = userId
        };

        await context.Tasks.AddAsync(task);
        await context.SaveChangesAsync();

        return task;
    }

    public async Task<TaskItem?> ToggleAsync(Guid id, Guid userId)
    {
        var task = await context.Tasks.SingleOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task != null)
        {
            task.IsDone = !task.IsDone;
            task.CompletedDate = task.IsDone ? DateTime.UtcNow : null;
            task.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();
        }

        return task;
    }

    public async Task<TaskItem?> UpdateAsync(Guid id, UpdateTaskRequest request, Guid userId)
    {
        var task = await context.Tasks.SingleOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task != null)
        {
            task.Title = request.Title;
            task.Priority = request.Priority;
            task.Effort = request.Effort;
            task.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();
        }

        return task;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var task = await context.Tasks.SingleOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (task is null)
            return false;

        context.Tasks.Remove(task);
        await context.SaveChangesAsync();

        return true;
    }
}
