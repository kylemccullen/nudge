using Nudge.Shared.Enums;

namespace Nudge.Shared.DTOs;

public record TaskExportDto(
    Guid Id,
    string Title,
    bool IsDone,
    Priority Priority,
    Effort Effort,
    DateTime? CompletedDate,
    DateOnly? DueDate,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CapacityOverrideExportDto(
    DateOnly Date,
    int ExtraCapacity
);

public record UserExportDto(
    int Version,
    DateTime ExportedAt,
    List<TaskExportDto> Tasks,
    List<CapacityOverrideExportDto> CapacityOverrides
);
