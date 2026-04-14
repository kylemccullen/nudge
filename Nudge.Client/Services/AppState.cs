namespace Nudge.Client.Services;

public class AppState
{
    public bool ShowAddTaskForm { get; private set; }
    public event Action? OnChange;

    public void ToggleAddTaskForm()
    {
        ShowAddTaskForm = !ShowAddTaskForm;
        OnChange?.Invoke();
    }
}
