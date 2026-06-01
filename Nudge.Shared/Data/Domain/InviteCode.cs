namespace Nudge.Shared.Data.Domain;

public class InviteCode : BaseEntity
{
    public required string Code { get; set; }

    public required Guid CreatedByUserId { get; set; }

    public Guid? UsedByUserId { get; set; }

    public DateTime? UsedAt { get; set; }
}
