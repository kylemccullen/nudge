using Nudge.Shared.Data.Domain;
using Nudge.Shared.DTOs;

namespace Nudge.API.Interfaces;

public interface ISchedulerService
{
    ScheduledTasksResponse Schedule(List<TaskItem> tasks, DateOnly today, int extraCapacity = 0, TimeZoneInfo? tz = null);
}
