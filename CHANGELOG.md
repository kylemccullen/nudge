# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-01

### Added
- Due dates on tasks

### Changed
- Edit and delete actions moved to a 3-dot context menu on each task
- Add task button moved from the header to a floating button in the bottom-right corner
- Consistent color usage across task sections

### Fixed
- "Set to Today" action no longer appears for tasks already in the Today section

## [0.1.0] - 2026-04-13

### Added
- Task management: create, edit, delete, and reorder tasks
- Effort-based scheduling algorithm — capacity of 4 pts on weekdays, 6 pts on weekends; High=4, Medium=2, Low=1
- Today, Backlog, and Done sections with drag-and-drop reordering
- Day capacity overrides for adjusting daily scheduling capacity
- JWT authentication with login, registration, and invite-code gating
- Admin panel for managing users and invite codes
- Blazor WebAssembly client served from the ASP.NET Core 8 API
- SQLite database via EF Core with automatic migrations on startup
- Docker and Docker Compose support
- Timezone-aware scheduling via `X-Timezone` request header
