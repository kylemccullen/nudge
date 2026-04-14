using Microsoft.AspNetCore.Mvc;

namespace Nudge.API.Controllers;

public abstract class BaseController : ControllerBase
{
    protected DateOnly GetLocalToday()
    {
        var tzId = Request.Headers["X-Timezone"].FirstOrDefault() ?? "UTC";
        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById(tzId);
            return DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz));
        }
        catch
        {
            return DateOnly.FromDateTime(DateTime.UtcNow);
        }
    }

    protected TimeZoneInfo GetLocalTimeZone()
    {
        var tzId = Request.Headers["X-Timezone"].FirstOrDefault() ?? "UTC";
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(tzId);
        }
        catch
        {
            return TimeZoneInfo.Utc;
        }
    }
}
