using Microsoft.JSInterop;
using Nudge.Shared.DTOs;
using System.Net.Http.Json;

namespace Nudge.Client.Services;

public class AuthService(
    IHttpClientFactory httpClientFactory,
    IJSRuntime jsRuntime,
    CustomAuthStateProvider authStateProvider)
{
    private const string TokenKey = "authToken";

    public async Task<string?> GetTokenAsync() =>
        await jsRuntime.InvokeAsync<string?>("localStorage.getItem", TokenKey);

    public async Task<(bool Success, string? Error)> LoginAsync(LoginRequest request)
    {
        var client = httpClientFactory.CreateClient("WebAPI");
        var response = await client.PostAsJsonAsync("api/auth/login", request);

        if (!response.IsSuccessStatusCode)
            return (false, "Invalid email or password.");

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        await SetTokenAsync(authResponse!.Token);
        return (true, null);
    }

    public async Task<(bool Success, string? Error)> RegisterAsync(RegisterRequest request)
    {
        var client = httpClientFactory.CreateClient("WebAPI");
        var response = await client.PostAsJsonAsync("api/auth/register", request);

        if (!response.IsSuccessStatusCode)
            return (false, await response.Content.ReadAsStringAsync());

        return (true, null);
    }

    public async Task LogoutAsync()
    {
        await jsRuntime.InvokeVoidAsync("localStorage.removeItem", TokenKey);
        authStateProvider.NotifyStateChanged();
    }

    private async Task SetTokenAsync(string token)
    {
        await jsRuntime.InvokeVoidAsync("localStorage.setItem", TokenKey, token);
        authStateProvider.NotifyStateChanged();
    }
}
