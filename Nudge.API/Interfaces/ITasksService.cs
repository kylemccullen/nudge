using Nudge.Shared.Data.Domain;
using Nudge.Shared.DTOs;

namespace Nudge.API.Interfaces;

public interface ITasksService
{
    Task<List<TaskItem>> GetAsync(Guid userId);

    Task<TaskItem> AddAsync(CreateTaskRequest request, Guid userId);

    Task<TaskItem?> ToggleAsync(Guid id, Guid userId);

    Task<TaskItem?> UpdateAsync(Guid id, UpdateTaskRequest request, Guid userId);

    Task<bool> DeleteAsync(Guid id, Guid userId);
}
