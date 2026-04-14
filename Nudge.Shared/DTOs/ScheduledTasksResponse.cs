namespace Nudge.Shared.DTOs;

public record ScheduledTasksResponse(
    List<TaskItemDto> TodayTasks,
    List<ScheduledDay> FutureDayGroups,
    List<TaskItemDto> BacklogTasks,
    List<TaskItemDto> DoneTasks,
    int TodayCompletedCapacity,
    int TodayTotalCapacity
);
