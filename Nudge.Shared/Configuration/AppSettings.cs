namespace Nudge.Shared.Configuration;

public class JwtSettings
{
    public required string Key { get; set; }
    
    public required string Issuer { get; set; }

    public required string Audience { get; set; }
}

public class ConnectionStrings
{
    public required string NudgeDb { get; set; }
}

public class AppSettings
{
    public required JwtSettings Jwt { get; set; }

    public required ConnectionStrings ConnectionStrings { get; set; }
}
