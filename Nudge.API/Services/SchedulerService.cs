using Nudge.API.Interfaces;
using Nudge.Shared.Data.Domain;
using Nudge.Shared.DTOs;
using Nudge.Shared.Extensions;

namespace Nudge.API.Services;

public class SchedulingDay
{
    public DateOnly Date { get; set; }
    public List<TaskItem> Tasks { get; set; } = [];
    public int RemainingCapacity { get; set; }
}

public class SchedulerService : ISchedulerService
{
    private const int ScheduleAheadDays = 7;

    private static int DayCapacity(DateOnly d) =>
        d.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday ? 6 : 4;

    private static TaskItemDto ToDto(TaskItem t) =>
        new(t.Id, t.Title, t.IsDone, t.Priority, t.Effort, t.CompletedDate, t.DueDate);

    private static List<SchedulingDay> CreateScheduleDays(DateOnly today, int todayCompletedCapacity, int extraCapacity)
    {
        var dayCapacity = DayCapacity(today) + extraCapacity;

        var schedulingDays = new List<SchedulingDay>
        {
            new()
            {
                Date = today,
                RemainingCapacity = dayCapacity - todayCompletedCapacity
            }
        };

        for (var i = 1; i <= ScheduleAheadDays; i++)
        {
            var day = today.AddDays(i);
            schedulingDays.Add(new SchedulingDay
            {
                Date = day,
                RemainingCapacity = DayCapacity(day)
            });
        }

        return schedulingDays;
    }

    public ScheduledTasksResponse Schedule(List<TaskItem> tasks, DateOnly today, int extraCapacity = 0, TimeZoneInfo? tz = null)
    {
        var resolvedTz = tz ?? TimeZoneInfo.Utc;
        var todayCompletedCapacity = tasks
            .Where(t => t.CompletedDate.HasValue &&
                DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(t.CompletedDate.Value, resolvedTz)) == today)
            .Sum(t => t.Effort.Cost());

        var scheduleDays = CreateScheduleDays(today, todayCompletedCapacity, extraCapacity);
        var todayCapacityLimit = DayCapacity(today) + extraCapacity;

        var incompleteTasks = tasks.Where(t => !t.IsDone).ToList();

        // Tasks with a past due date surface in the Overdue section, not the schedule
        var overdueTasks = incompleteTasks
            .Where(t => t.DueDate.HasValue && t.DueDate.Value < today)
            .OrderBy(t => t.DueDate)
            .ThenBy(t => t.Priority)
            .ToList();

        // Tasks pinned to a specific future (or today) date
        var dueDateTasks = incompleteTasks
            .Where(t => t.DueDate.HasValue && t.DueDate.Value >= today)
            .OrderBy(t => t.DueDate)
            .ThenBy(t => t.Priority)
            .ToList();

        // Undated tasks fill remaining capacity
        var undatedTasks = incompleteTasks
            .Where(t => !t.DueDate.HasValue)
            .OrderBy(t => t.Priority)
            .ThenBy(t => t.CreatedAt)
            .ToList();

        // Pin due-date tasks to their specific day (allow overflow)
        foreach (var task in dueDateTasks)
        {
            var dueDate = task.DueDate!.Value;
            var scheduleDay = scheduleDays.FirstOrDefault(sd => sd.Date == dueDate);
            if (scheduleDay == null)
            {
                scheduleDay = new SchedulingDay { Date = dueDate, RemainingCapacity = DayCapacity(dueDate) };
                scheduleDays.Add(scheduleDay);
            }
            scheduleDay.Tasks.Add(task);
            scheduleDay.RemainingCapacity -= task.Effort.Cost();
        }

        // Fill remaining capacity greedily with undated tasks
        foreach (var task in undatedTasks)
        {
            var cost = task.Effort.Cost();
            foreach (var scheduleDay in scheduleDays.OrderBy(sd => sd.Date))
            {
                if (cost > scheduleDay.RemainingCapacity) continue;
                scheduleDay.Tasks.Add(task);
                scheduleDay.RemainingCapacity -= cost;
                break;
            }
        }

        var allScheduledTasks = scheduleDays.SelectMany(sd => sd.Tasks).ToHashSet();

        var todayTasks = scheduleDays.First(sd => sd.Date == today).Tasks.Select(ToDto).ToList();
        var futureDayGroups = scheduleDays
            .Where(sd => sd.Date > today && sd.Tasks.Count > 0)
            .OrderBy(sd => sd.Date)
            .Select(sd => new ScheduledDay(sd.Date, [.. sd.Tasks.Select(ToDto)]))
            .ToList();
        var backlogTasks = undatedTasks
            .Where(t => !allScheduledTasks.Contains(t))
            .Select(ToDto)
            .ToList();
        var doneTasks = tasks.Where(t => t.IsDone).Select(ToDto).ToList();
        var overdueDtos = overdueTasks.Select(ToDto).ToList();

        return new ScheduledTasksResponse(
            todayTasks,
            futureDayGroups,
            backlogTasks,
            doneTasks,
            overdueDtos,
            todayCompletedCapacity,
            todayCapacityLimit
        );
    }
}
