namespace HighlandGames.Server.DTOs;

public record ResultDto(Guid Id, Guid TeamId, string TeamName, string Gender, string DisciplineId, int Points, string? RawValue, DateTime UpdatedAt);
public record UpsertResultDto(Guid TeamId, string DisciplineId, int Points, string? RawValue);
public record LeaderboardEntryDto(Guid TeamId, string TeamName, string Gender, int TotalPoints, int? TiebreakerRank, bool TiebreakerApplied);
