using Microsoft.EntityFrameworkCore;
using Nudge.API.Interfaces;
using Nudge.Shared.Data;
using Nudge.Shared.Data.Domain;
using Nudge.Shared.DTOs;

namespace Nudge.API.Services;

public class AdminService(NudgeDbContext context) : IAdminService
{
    public async Task<List<UserDto>> GetUsersAsync() =>
        await context.Users
            .Select(u => new UserDto(u.Id, u.Email, u.IsAdmin))
            .ToListAsync();

    public async Task<InviteCodeDto> CreateInviteAsync(Guid adminUserId)
    {
        var invite = new InviteCode
        {
            Code = Guid.NewGuid().ToString("N"),
            CreatedByUserId = adminUserId,
            CreatedAt = DateTime.UtcNow
        };

        context.InviteCodes.Add(invite);
        await context.SaveChangesAsync();

        return new InviteCodeDto(invite.Code, invite.CreatedAt, false);
    }

    public async Task<List<InviteCodeDto>> GetInvitesAsync() =>
        await context.InviteCodes
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new InviteCodeDto(i.Code, i.CreatedAt, i.UsedByUserId != null))
            .ToListAsync();
}
