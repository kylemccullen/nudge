export enum Priority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Effort {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface TaskItemDto {
  id: number;
  title: string;
  isDone: boolean;
  priority: Priority;
  effort: Effort;
  completedDate: string | null;
  dueDate: string | null;
}

export interface ScheduledDay {
  day: string;
  tasks: TaskItemDto[];
}

export interface ScheduledTasksResponse {
  todayTasks: TaskItemDto[];
  futureDayGroups: ScheduledDay[];
  backlogTasks: TaskItemDto[];
  doneTasks: TaskItemDto[];
  overdueTasks: TaskItemDto[];
  todayCompletedCapacity: number;
  todayTotalCapacity: number;
}

export interface CreateTaskRequest {
  title: string;
  priority: Priority;
  effort: Effort;
  dueDate: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  priority: Priority;
  effort: Effort;
  dueDate: string | null;
}

export interface AssignMoreTasksRequest {
  extraPoints: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  inviteCode: string;
}

export interface AuthResponse {
  token: string;
  email: string;
}

export interface UserDto {
  id: number;
  email: string;
  isAdmin: boolean;
}

export interface InviteCodeDto {
  code: string;
  createdAt: string;
  isUsed: boolean;
}
