using Nudge.Shared.Enums;

namespace Nudge.Shared.Data.Domain;

public class TaskItem : BaseEntity
{
    public required string Title { get; set; }

    public required Priority Priority { get; set; }

    public required Effort Effort { get; set; }

    public bool IsDone { get; set; } = false;

    public DateTime? CompletedDate { get; set; }

    public Guid UserId { get; set; }
}
