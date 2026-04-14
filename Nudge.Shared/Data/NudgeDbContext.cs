using Microsoft.EntityFrameworkCore;
using Nudge.Shared.Data.Domain;

namespace Nudge.Shared.Data;

public class NudgeDbContext(DbContextOptions<NudgeDbContext> options) : DbContext(options)
{
    public DbSet<TaskItem> Tasks { get; set; }

    public DbSet<User> Users { get; set; }

    public DbSet<DayCapacityOverride> DayCapacityOverrides { get; set; }

    public DbSet<InviteCode> InviteCodes { get; set; }
}
