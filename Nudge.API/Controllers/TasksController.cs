using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nudge.API.Interfaces;
using Nudge.Shared.Data.Domain;
using Nudge.Shared.DTOs;
using System.Security.Claims;

namespace Nudge.API.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TasksController(ITasksService tasksService, ISchedulerService schedulerService, IDayCapacityService dayCapacityService) : BaseController
{
    [HttpGet]
    public async Task<ActionResult<List<TaskItem>>> GetAll()
    {
        var userId = GetUserId();
        var tasks = await tasksService.GetAsync(userId);
        var today = GetLocalToday();
        var tz = GetLocalTimeZone();

        var extraCapacity = await dayCapacityService.GetExtraCapacityAsync(userId, today);
        var result = schedulerService.Schedule(tasks, today, extraCapacity, tz);

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> Create(CreateTaskRequest request)
    {
        var userId = GetUserId();
        var result = await tasksService.AddAsync(request, userId);

        return Ok(result);
    }

    [HttpPatch("{id}/toggle")]
    public async Task<ActionResult<TaskItem>> Toggle(Guid id)
    {
        var userId = GetUserId();
        var result = await tasksService.ToggleAsync(id, userId);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskItem>> Update(Guid id, UpdateTaskRequest request)
    {
        var userId = GetUserId();
        var result = await tasksService.UpdateAsync(id, request, userId);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        var deleted = await tasksService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound();

        return NoContent();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
