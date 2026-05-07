namespace HighlandGames.Server.DTOs;

public record MatchDto(
    Guid Id,
    string DisciplineId,
    string Gender,
    int Order,
    Guid TeamAId,
    string TeamAName,
    Guid? TeamBId,
    string? TeamBName,
    int? TeamAScore,
    int? TeamBScore,
    Guid? WinnerTeamId
);

public record CreateMatchDto(string DisciplineId, string Gender, Guid TeamAId, Guid? TeamBId);

public record ReorderMatchesDto(List<Guid> Ids);

public record UpdateMatchDto(
    Guid? TeamAId,
    Guid? TeamBId,
    int? TeamAScore,
    int? TeamBScore,
    Guid? WinnerTeamId
);
