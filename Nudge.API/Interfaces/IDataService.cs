using Nudge.Shared.DTOs;

namespace Nudge.API.Interfaces;

public interface IDataService
{
    Task<UserExportDto> ExportAsync(Guid userId);
    Task ImportAsync(UserExportDto export, Guid userId);
}
