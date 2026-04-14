namespace Nudge.Shared.DTOs;

public record InviteCodeDto(string Code, DateTime CreatedAt, bool IsUsed);
