using Nudge.API.Services;
using Nudge.Shared.Data.Domain;
using Nudge.Shared.Enums;
using Nudge.Shared.Extensions;

namespace Nudge.API.Test.Services;

public class ScheduleServiceTest
{
    [Fact]
    public void Schedule_ShouldCreateSchedule()
    {
        var tasks = new List<TaskItem>()
        {
            new()
            {
                Title = "1",
                Priority = Priority.Critical,
                Effort = Effort.Low,
                IsDone = false,
                CompletedDate = null
            }
        };

        var scheduleService = new SchedulerService();

        var schedule = scheduleService.Schedule(tasks, DateOnly.FromDateTime(DateTime.Now.StartOfWeek()));

        Assert.Single(schedule.TodayTasks);
        Assert.Empty(schedule.BacklogTasks);
        Assert.Empty(schedule.FutureDayGroups);
        Assert.Empty(schedule.DoneTasks);
        Assert.Equal(0, schedule.TodayCompletedCapacity);
        Assert.Equal(6, schedule.TodayTotalCapacity);
    }

    [Fact]
    public void Schedule_ShouldCountTasksCompletedTodayAsTodaysCapacity()
    {
        var today = DateOnly.FromDateTime(DateTime.Now.StartOfWeek());

        var tasks = new List<TaskItem>()
        {
            new()
            {
                Title = "1",
                Priority = Priority.Critical,
                Effort = Effort.Medium,
                IsDone = true,
                CompletedDate = today.ToDateTime(TimeOnly.MinValue)
            }
        };

        var scheduleService = new SchedulerService();

        var schedule = scheduleService.Schedule(tasks, today);

        Assert.Empty(schedule.TodayTasks);
        Assert.Empty(schedule.BacklogTasks);
        Assert.Empty(schedule.FutureDayGroups);
        Assert.Single(schedule.DoneTasks);
        Assert.Equal(Effort.Medium.Cost(), schedule.TodayCompletedCapacity);
        Assert.Equal(6, schedule.TodayTotalCapacity);
    }

    [Fact]
    public void Schedule_ShouldCircleBackToUnfilledDay()
    {
        var today = DateOnly.FromDateTime(DateTime.Now.WithDayOfWeek(DayOfWeek.Monday));

        var tasks = new List<TaskItem>()
        {
            new()
            {
                Title = "1",
                Priority = Priority.Critical,
                Effort = Effort.Medium,
                IsDone = false,
                CompletedDate = null
            },
            new()
            {
                Title = "2",
                Priority = Priority.High,
                Effort = Effort.High,
                IsDone = false,
                CompletedDate = null
            },
            new()
            {
                Title = "3",
                Priority = Priority.Medium,
                Effort = Effort.Low,
                IsDone = false,
                CompletedDate = null
            }
        };

        var scheduleService = new SchedulerService();

        var schedule = scheduleService.Schedule(tasks, today);

        Assert.Equal(2, schedule.TodayTasks.Count);
        Assert.Equal(["1", "3"], schedule.TodayTasks.Select(t => t.Title).ToList());
        Assert.Empty(schedule.BacklogTasks);
        Assert.Single(schedule.FutureDayGroups);
        Assert.Equal("2", schedule.FutureDayGroups.First()?.Tasks.First()?.Title);
        Assert.Empty(schedule.DoneTasks);
        Assert.Equal(0, schedule.TodayCompletedCapacity);
        Assert.Equal(4, schedule.TodayTotalCapacity);
    }
}
