using Nudge.Shared.DTOs;

namespace Nudge.API.Interfaces;

public interface IAdminService
{
    Task<List<UserDto>> GetUsersAsync();
    Task<InviteCodeDto> CreateInviteAsync(Guid adminUserId);
    Task<List<InviteCodeDto>> GetInvitesAsync();
}
