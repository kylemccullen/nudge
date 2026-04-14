using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nudge.API.Interfaces;
using System.Security.Claims;

namespace Nudge.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(IAdminService adminService) : ControllerBase
{
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers() =>
        Ok(await adminService.GetUsersAsync());

    [HttpPost("invites")]
    public async Task<IActionResult> CreateInvite()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var invite = await adminService.CreateInviteAsync(userId);
        return Ok(invite);
    }

    [HttpGet("invites")]
    public async Task<IActionResult> GetInvites() =>
        Ok(await adminService.GetInvitesAsync());
}
