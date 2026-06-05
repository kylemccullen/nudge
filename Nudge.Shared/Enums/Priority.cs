using System.Text.Json.Serialization;

namespace Nudge.Shared.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Priority
{
    Critical,
    High,
    Medium,
    Low
}
