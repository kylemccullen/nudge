using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Nudge.API.Exceptions;
using Nudge.API.Interfaces;
using Nudge.Shared.Configuration;
using Nudge.Shared.Data;
using Nudge.Shared.Data.Domain;
using Nudge.Shared.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Nudge.API.Services;

public class AuthService(
    NudgeDbContext context,
    PasswordHasher<User> passwordHasher,
    IOptions<AppSettings> appSettings) : IAuthService
{
    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        if (await context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new RegistrationException("Email already registered.");
        }

        bool isFirstUser = !await context.Users.AnyAsync();

        InviteCode? invite = null;
        if (!isFirstUser)
        {
            if (string.IsNullOrWhiteSpace(request.InviteCode))
                throw new RegistrationException("An invite code is required to register.");

            invite = await context.InviteCodes
                .FirstOrDefaultAsync(i => i.Code == request.InviteCode && i.UsedByUserId == null);

            if (invite == null)
                throw new RegistrationException("Invalid or already-used invite code.");
        }

        var user = new User { Email = request.Email, PasswordHash = "", IsAdmin = isFirstUser };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        context.Users.Add(user);
        await context.SaveChangesAsync();

        if (invite != null)
        {
            invite.UsedByUserId = user.Id;
            invite.UsedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
        }

        return new AuthResponse(GenerateToken(user), user.Email);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await context.Users.SingleOrDefaultAsync(u => u.Email == request.Email);
        if (user is null) return null;

        var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed) return null;

        return new AuthResponse(GenerateToken(user), user.Email);
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettings.Value.Jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
        };

        var token = new JwtSecurityToken(
            issuer: appSettings.Value.Jwt.Issuer,
            audience: appSettings.Value.Jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(90),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
