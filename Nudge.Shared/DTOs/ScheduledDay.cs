namespace Nudge.Shared.DTOs;

public record ScheduledDay(DateOnly Day, List<TaskItemDto> Tasks);
