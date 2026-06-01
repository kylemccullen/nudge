using Nudge.Shared.Enums;

namespace Nudge.Shared.DTOs;

public record UpdateTaskRequest(string Title, Priority Priority, Effort Effort);
