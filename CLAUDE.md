# HighlandGames

A web app to run the Highland Games competition in Höchst, Austria. Used live during the event to manage teams, disciplines, matches, and a real-time leaderboard.

## Stack

**Backend:** ASP.NET Core 10 (.NET 10), EF Core 9 + PostgreSQL 17, SignalR, JWT auth  
**Frontend:** React 19, TypeScript 6, Vite 8, SignalR client  
**Infrastructure:** Docker Compose (PostgreSQL), HTTPS dev certs, SPA proxy

## Project Layout

```
HighlandGames.Server/          # ASP.NET Core API
  Controllers/                 # REST endpoints
  Services/                    # Business logic
  Services/Abstractions/       # IXxxService interfaces
  Repositories/                # EF Core data access
  Repositories/Abstractions/   # IXxxRepository interfaces
  Models/                      # Domain entities (Team, Discipline, Match, Result)
  DTOs/                        # Request/response records
  Data/                        # AppDbContext, migrations
  Hubs/                        # SignalR hub (ResultsHub)
  Migrations/                  # EF Core migrations

highlandgames.client/          # React SPA
  src/
    pages/                     # One file per page (HomePage, AdminPage, …)
    components/                # Shared components (Header, Footer, Separator)
    api/                       # Per-resource API clients + shared client.ts
    hooks/                     # Custom hooks (useAuth, useSignalR, useXxxPage)
    data/                      # Mock data for dev
```

## Conventions

### Backend (C#)
- Services go in `Services/`; their interfaces in `Services/Abstractions/`
- Repositories go in `Repositories/`; their interfaces in `Repositories/Abstractions/`
- Interfaces are prefixed with `I` (e.g. `ITeamService`, `ITeamRepository`)
- Async methods are suffixed with `Async` (e.g. `GetAllAsync()`)
- All services and repositories are registered as **Scoped** in `Program.cs`
- DTOs are C# records; mapping happens inside the service layer
- SignalR push calls live in the service layer, not controllers

### Frontend (TypeScript/React)
- Page components: `PascalCase` with `Page` suffix (e.g. `MatchesPage.tsx`)
- Custom hooks: `use` prefix (e.g. `useMatchesPage.ts`)
- DTO types: PascalCase with `Dto` suffix (e.g. `MatchDto`)
- API module per resource in `src/api/`; `client.ts` handles auth headers

## Domain

| Entity | Key fields |
|---|---|
| `Team` | Id (Guid), Name, Gender ("m"/"f") |
| `Discipline` | Id (string slug), Number (order), Name, Icon, Status |
| `Match` | Id, DisciplineId, TeamAId, TeamBId, scores, WinnerTeamId, IsManualOverride |
| `Result` | Id, TeamId, DisciplineId, Points, RawValue — unique (TeamId, DisciplineId) |

**Seeded disciplines** (in migration): `sync`, `weight`, `caber`, `rope`, `fire`

**Discipline statuses:** `upcoming` → `next` → `live` → `done`

## Auth

Single-admin model: one shared password (`Jwt:AdminPassword` in appsettings) returns a 12-hour JWT with an `Admin` role claim. Frontend stores the token in `localStorage` under `hg_token` and sends it as a Bearer header. Protected endpoints are decorated with `[Authorize]`.

## Real-time (SignalR)

Hub endpoint: `/hubs/results`  
Groups: leaderboard by gender, discipline-specific, matches by discipline  
Broadcasts: `ResultUpdated`, `LeaderboardUpdated`, `MatchesUpdated`  
Frontend subscribes via the `useSignalR` hook.

## Configuration via environment variables

ASP.NET Core maps env vars to config using `__` as the section separator — no code changes needed. See `.env.example` for the full list.

| Env var | Config key |
|---|---|
| `ConnectionStrings__DefaultConnection` | DB connection string |
| `Jwt__Key` | JWT signing key |
| `Jwt__Issuer` | JWT issuer |
| `Jwt__Audience` | JWT audience |
| `Jwt__AdminPassword` | Admin login password |

## Database

Default connection string in `appsettings.json`:  
`Host=localhost;Port=5432;Database=highland_games;Username=highland;Password=CHANGE_ME`  
Override via `ConnectionStrings__DefaultConnection` env var.

Run locally via Docker Compose: `docker-compose up -d`  
Apply migrations: `dotnet ef database update` inside `HighlandGames.Server/`

## API Routes

| Method | Route | Auth |
|---|---|---|
| POST | `/api/auth/login` | — |
| GET | `/api/teams` | — |
| GET | `/api/teams/{gender}` | — |
| POST | `/api/teams` | Admin |
| DELETE | `/api/teams/{id}` | Admin |
| GET | `/api/disciplines` | — |
| PUT | `/api/disciplines/{id}/status` | Admin |
| GET | `/api/matches?disciplineId=&gender=` | — |
| POST | `/api/matches/generate` | Admin |
| PUT | `/api/matches/{id}` | Admin |
| DELETE | `/api/matches/{disciplineId}/{gender}` | Admin |
| GET | `/api/results/leaderboard/{gender}` | — |
| POST | `/api/results` | Admin (upsert) |
| DELETE | `/api/results/{id}` | Admin |

## Dev Setup

```bash
# Start database
docker-compose up -d

# Backend (from HighlandGames.Server/)
dotnet run

# Frontend (from highlandgames.client/)
npm install
npm run dev
```

Frontend dev server: `https://localhost:5173`  
Backend API: `https://localhost:7xxx` (see launchSettings.json)  
Vite proxies `/api` and `/hubs` to the backend automatically.
