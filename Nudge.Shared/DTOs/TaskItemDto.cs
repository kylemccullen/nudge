using Nudge.Shared.Enums;

namespace Nudge.Shared.DTOs;

public record TaskItemDto(
    Guid Id,
    string Title,
    bool IsDone,
    Priority Priority,
    Effort Effort,
    DateTime? CompletedDate,
    int SortOrder
);
