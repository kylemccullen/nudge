using Microsoft.AspNetCore.Mvc;
using Nudge.API.Exceptions;
using Nudge.API.Interfaces;
using Nudge.Shared.DTOs;

namespace Nudge.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        try
        {
            var result = await authService.RegisterAsync(request);

            return Ok(result);
        }
        catch (RegistrationException e)
        {
            return BadRequest(e.Message);
        }
        catch
        {
            return BadRequest("An unknown error occurred.");
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await authService.LoginAsync(request);

        if (result is null)
        {
            return Unauthorized("Invalid email or password.");
        }

        return Ok(result);
    }
}
