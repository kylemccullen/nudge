# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run the app (API + Client together)
dotnet run --project Nudge.API

# Run all tests
dotnet test

# Run a single test class
dotnet test --filter "FullyQualifiedName~ScheduleServiceTest"

# Docker
docker compose up -d
```

The app runs at `http://localhost:5000` (dev) or `http://localhost:8080` (Docker).

In development, EF migrations run automatically on startup and a seed admin account is created: `test@example.com` / `password`.

## Architecture

**Solution structure:**
- `Nudge.API` — ASP.NET Core 8 Web API; serves the nudge-mobile web build as static files via `UseStaticFiles`/`MapFallbackToFile`
- `nudge-mobile` — React Native / Expo app; built with `npx expo export --platform web` and served from `Nudge.API/wwwroot`
- `Nudge.Shared` — shared DTOs, EF Core entities/`NudgeDbContext`, enums, and extension methods
- `Nudge.API.Test` — xUnit tests

**Database:** SQLite via EF Core (`nudge.db`). The connection string is configured through `AppSettings:ConnectionStrings:NudgeDb`. In production it's set via environment variable `AppSettings__ConnectionStrings__NudgeDb`.

**Auth:** JWT bearer tokens. The secret is `AppSettings:Jwt:Key` (env var `NUDGE_JWT_SECRET` in prod). In development, `appsettings.Development.json` provides a hardcoded key. The `BaseController` reads `X-Timezone` from request headers to resolve the caller's local date — the client sends this header via `TimezoneService`.

**Scheduling algorithm** (`SchedulerService`): Pure stateless service with no external dependencies (easy to unit test). Capacity is 4 points on weekdays, 6 on weekends. Effort costs: High=4, Medium=2, Low=1. Tasks are assigned greedily in `SortOrder` order across today + 7 days ahead; overflow goes to backlog.

**SortOrder:** Tasks use gap-based ordering (multiples of 1000). On creation, `SortOrder = (priority + 1) * 1000`. `MoveAsync` and `ReorderAsync` rebuild the full sorted order by section (today → future days → backlog → done) and reassign sequential gaps.

**Client HTTP (nudge-mobile):** All API calls go through `src/api/client.ts`, which reads the base URL from `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:5000`). The JWT token is stored in `expo-secure-store` and attached via `Authorization: Bearer` header. Auth state is managed by `src/contexts/AuthContext.tsx`.
