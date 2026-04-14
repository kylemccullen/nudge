﻿using System.ComponentModel.DataAnnotations;

namespace Nudge.Shared.Data;

public class BaseEntity
{
    [Key]
    public Guid Id { get; set; }
}
