using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.JSInterop;

namespace Nudge.Client.Services;

public class CustomAuthStateProvider(IJSRuntime jsRuntime) : AuthenticationStateProvider
{
    private const string TokenKey = "authToken";

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        var token = await jsRuntime.InvokeAsync<string?>("localStorage.getItem", TokenKey);

        if (string.IsNullOrEmpty(token))
            return Unauthenticated();

        var principal = ParseClaimsFromJwt(token);
        return new AuthenticationState(principal);
    }

    public void NotifyStateChanged() =>
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());

    private static AuthenticationState Unauthenticated() =>
        new(new ClaimsPrincipal(new ClaimsIdentity()));

    private static ClaimsPrincipal ParseClaimsFromJwt(string jwt)
    {
        var payload = jwt.Split('.')[1];
        var jsonBytes = ParseBase64WithoutPadding(payload);
        var keyValuePairs = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonBytes);

        var claims = keyValuePairs!.Select(kvp => new Claim(kvp.Key, kvp.Value.ToString()));
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "jwt"));
    }

    private static byte[] ParseBase64WithoutPadding(string base64)
    {
        base64 = base64.Replace('-', '+').Replace('_', '/');
        var remainder = base64.Length % 4;
        if (remainder == 2) base64 += "==";
        else if (remainder == 3) base64 += "=";
        return Convert.FromBase64String(base64);
    }
}
