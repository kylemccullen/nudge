using Nudge.Shared.Enums;

namespace Nudge.Shared.Extensions;

public static class EnumExtensions
{
    public static int Cost(this Effort effort) => effort switch
    {
        Effort.High => 4,
        Effort.Medium => 2,
        Effort.Low => 1,
        _ => 1
    };
}
