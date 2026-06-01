using Nudge.Shared.Enums;

namespace Nudge.Shared.DTOs;

public record CreateTaskRequest(
    string Title,
    Priority Priority,
    Effort Effort,
    DateOnly? DueDate
);
