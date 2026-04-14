using Microsoft.EntityFrameworkCore;
using Nudge.API.Interfaces;
using Nudge.Shared.Data;
using Nudge.Shared.Data.Domain;
using Nudge.Shared.DTOs;

namespace Nudge.API.Services;

public class TaskService(NudgeDbContext context, ISchedulerService schedulerService) : ITasksService
{
    private const int Gap = 1000;

    public async Task<List<TaskItem>> GetAsync(Guid userId)
    {
        return await context.Tasks
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();
    }

    public async Task<TaskItem> AddAsync(CreateTaskRequest request, Guid userId)
    {
        var task = new TaskItem
        {
            Title = request.Title,
            Priority = request.Priority,
            Effort = request.Effort,
            SortOrder = ((int)request.Priority + 1) * Gap,
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
            task.SortOrder = request.SortOrder;

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

    public async Task<TaskItem?> MoveAsync(Guid id, MoveTaskRequest request, Guid userId, DateOnly today, int extraCapacity)
    {
        var allTasks = await context.Tasks
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        var taskToMove = allTasks.FirstOrDefault(t => t.Id == id);
        if (taskToMove is null) return null;

        var otherTasks = allTasks.Where(t => t.Id != id).ToList();
        var schedule = schedulerService.Schedule(otherTasks, today, extraCapacity);

        var orderedTasks = BuildSectionOrder(otherTasks, schedule);

        int insertIndex = orderedTasks.Count;
        if (request.PreviousTaskId.HasValue)
        {
            int prevIdx = orderedTasks.FindIndex(t => t.Id == request.PreviousTaskId.Value);
            if (prevIdx >= 0) insertIndex = prevIdx + 1;
        }
        else if (request.NextTaskId.HasValue)
        {
            int nextIdx = orderedTasks.FindIndex(t => t.Id == request.NextTaskId.Value);
            if (nextIdx >= 0) insertIndex = nextIdx;
        }

        orderedTasks.Insert(insertIndex, taskToMove);

        for (int i = 0; i < orderedTasks.Count; i++)
            orderedTasks[i].SortOrder = (i + 1) * Gap;

        await context.SaveChangesAsync();
        return taskToMove;
    }

    public async Task ReorderAsync(Guid userId, DateOnly today, int extraCapacity)
    {
        var allTasks = await context.Tasks
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        var schedule = schedulerService.Schedule(allTasks, today, extraCapacity);
        var orderedTasks = BuildSectionOrder(allTasks, schedule);

        for (int i = 0; i < orderedTasks.Count; i++)
            orderedTasks[i].SortOrder = (i + 1) * Gap;

        await context.SaveChangesAsync();
    }

    private static List<TaskItem> BuildSectionOrder(List<TaskItem> tasks, ScheduledTasksResponse schedule)
    {
        var idToTask = tasks.ToDictionary(t => t.Id);

        return schedule.TodayTasks
            .Concat(schedule.FutureDayGroups.SelectMany(g => g.Tasks))
            .Concat(schedule.BacklogTasks)
            .Concat(schedule.DoneTasks)
            .Select(dto => idToTask[dto.Id])
            .ToList();
    }
}
