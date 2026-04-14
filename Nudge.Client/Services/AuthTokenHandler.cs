using System.Net.Http.Headers;

namespace Nudge.Client.Services;

public class AuthTokenHandler(AuthService authService, TimezoneService timezoneService) : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var token = await authService.GetTokenAsync();
        if (!string.IsNullOrEmpty(token))
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        request.Headers.Add("X-Timezone", timezoneService.TimeZoneId);

        return await base.SendAsync(request, cancellationToken);
    }
}
