using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nudge.API.Interfaces;
using Nudge.Shared.DTOs;
using System.Security.Claims;

namespace Nudge.API.Controllers;

[ApiController]
[Route("api/day-capacity")]
[Authorize]
public class DayCapacityController(IDayCapacityService dayCapacityService) : BaseController
{
    [HttpPost]
    public async Task<IActionResult> AssignMore(AssignMoreTasksRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var today = GetLocalToday();

        await dayCapacityService.AddExtraCapacityAsync(userId, today, request.ExtraPoints);

        return NoContent();
    }
}
