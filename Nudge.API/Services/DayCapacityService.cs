using Microsoft.EntityFrameworkCore;
using Nudge.API.Interfaces;
using Nudge.Shared.Data;
using Nudge.Shared.Data.Domain;

namespace Nudge.API.Services;

public class DayCapacityService(NudgeDbContext context) : IDayCapacityService
{
    public async Task<int> GetExtraCapacityAsync(Guid userId, DateOnly date)
    {
        var existing = await context.DayCapacityOverrides
            .FirstOrDefaultAsync(o => o.UserId == userId && o.Date == date);

        return existing?.ExtraCapacity ?? 0;
    }

    public async Task AddExtraCapacityAsync(Guid userId, DateOnly date, int extraPoints)
    {
        var existing = await context.DayCapacityOverrides
            .FirstOrDefaultAsync(o => o.UserId == userId && o.Date == date);

        if (existing is null)
        {
            context.DayCapacityOverrides.Add(new DayCapacityOverride
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Date = date,
                ExtraCapacity = extraPoints
            });
        }
        else
        {
            existing.ExtraCapacity += extraPoints;
        }

        await context.SaveChangesAsync();
    }
}
