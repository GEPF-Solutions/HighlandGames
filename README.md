# Highland Games 2026

Website für die Highland Games des Pro Western Vereins – live Ergebnisse, Begegnungen und Admin-Bereich.

## Setup

### Voraussetzungen
- .NET 10
- Node.js
- Docker

### Datenbank starten
```bash
docker compose up -d
```

### User Secrets setzen
```bash
cd HighlandGames.Server
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=highland_games;Username=highland;Password=DEIN_PASSWORT"
dotnet user-secrets set "Jwt:Key" "DEIN_JWT_KEY_MIN_32_CHARS"
dotnet user-secrets set "Jwt:Issuer" "highland-games"
dotnet user-secrets set "Jwt:Audience" "highland-games"
dotnet user-secrets set "Jwt:AdminPassword" "DEIN_ADMIN_PASSWORT"
```

### Datenbank migrieren
In Visual Studio Package Manager Console (Default Project: `HighlandGames.Server`):
```
Update-Database
```

### Starten
In Visual Studio mit dem `https` Profil starten.

---

## Deployment (OpenShift)

Deployment wird via GitOps Pipeline ausgelöst durch einen Tag-Push auf `main`:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Umgebungsvariablen in OpenShift
Folgende Secrets müssen in OpenShift als Umgebungsvariablen konfiguriert sein:

| Variable | Beschreibung |
|----------|-------------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL Connection String |
| `Jwt__Key` | JWT Signing Key (min. 32 Zeichen) |
| `Jwt__Issuer` | `highland-games` |
| `Jwt__Audience` | `highland-games` |
| `Jwt__AdminPassword` | Admin Passwort |
| `ASPNETCORE_ENVIRONMENT` | `Production` |