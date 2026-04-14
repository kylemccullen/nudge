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
        new(t.Id, t.Title, t.IsDone, t.Priority, t.Effort, t.CompletedDate, t.SortOrder);

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

        var incompleteTasks = tasks
            .Where(t => !t.IsDone)
            .OrderBy(t => t.SortOrder)
            .ToList();

        for (var i = 0; i < incompleteTasks.Count; i++)
        {
            var task = incompleteTasks[i];
            var cost = task.Effort.Cost();

            foreach (var scheduleDay in scheduleDays)
            {
                if (cost > scheduleDay.RemainingCapacity)
                {
                    continue;
                }

                scheduleDay.Tasks.Add(task);
                scheduleDay.RemainingCapacity -= cost;
                break;
            }
        }

        var todayTasks = scheduleDays
            .First()
            .Tasks
            .Select(ToDto)
            .ToList();
        var futureDayGroups = scheduleDays
            .Skip(1)
            .Where(sd => sd.Tasks.Count != 0)
            .Select(sd => new ScheduledDay(sd.Date, [.. sd.Tasks.Select(ToDto)]))
            .ToList();
        var backlogTasks = incompleteTasks
            .Except(scheduleDays.SelectMany(sd => sd.Tasks))
            .Select(ToDto)
            .ToList();
        var doneTasks = tasks
            .Where(t => t.IsDone)
            .Select(ToDto)
            .ToList();

        return new ScheduledTasksResponse(
            todayTasks,
            futureDayGroups,
            backlogTasks,
            doneTasks,
            todayCompletedCapacity,
            DayCapacity(today) + extraCapacity
        );
    }
}
