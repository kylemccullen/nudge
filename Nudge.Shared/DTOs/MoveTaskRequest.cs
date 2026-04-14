namespace Nudge.Shared.DTOs;

public record MoveTaskRequest(Guid? PreviousTaskId, Guid? NextTaskId);
