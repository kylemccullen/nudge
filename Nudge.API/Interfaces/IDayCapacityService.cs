namespace Nudge.API.Interfaces;

public interface IDayCapacityService
{
    Task<int> GetExtraCapacityAsync(Guid userId, DateOnly date);
    Task AddExtraCapacityAsync(Guid userId, DateOnly date, int extraPoints);
}
