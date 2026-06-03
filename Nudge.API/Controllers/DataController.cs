using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nudge.API.Interfaces;
using Nudge.Shared.DTOs;
using System.Security.Claims;

namespace Nudge.API.Controllers;

[ApiController]
[Route("api/data")]
[Authorize]
public class DataController(IDataService dataService) : BaseController
{
    private const int CurrentVersion = 1;

    [HttpGet("export")]
    public async Task<ActionResult<UserExportDto>> Export()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var export = await dataService.ExportAsync(userId);
        return Ok(export);
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import(UserExportDto export)
    {
        if (export.Version > CurrentVersion)
            return BadRequest($"Export version {export.Version} is not supported by this version of the app.");

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await dataService.ImportAsync(export, userId);
        return NoContent();
    }
}
