namespace HighlandGames.Server.DTOs;

public record MatchDto(
    Guid Id,
    string DisciplineId,
    Guid TeamAId,
    string TeamAName,
    Guid TeamBId,
    string TeamBName,
    int? TeamAScore,
    int? TeamBScore,
    Guid? WinnerTeamId,
    bool IsManualOverride
);

public record GenerateMatchesDto(string DisciplineId, string Gender);

public record UpdateMatchDto(
    Guid? TeamAId,
    Guid? TeamBId,
    int? TeamAScore,
    int? TeamBScore,
    Guid? WinnerTeamId
);
