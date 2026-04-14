namespace Nudge.Shared.Data.Domain;

public class DayCapacityOverride : BaseEntity
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public int ExtraCapacity { get; set; }
}
