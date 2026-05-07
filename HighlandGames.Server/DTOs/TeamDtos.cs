namespace HighlandGames.Server.DTOs;

public record CreateTeamDto(string Name, string Gender);
public record TeamDto(Guid id, string Name, string Gender, int? TiebreakerRank);
public record SetTiebreakerRankDto(int? Rank);
public record SetTiebreakerRankEntryDto(Guid Id, int Rank);
public record SetTiebreakerRanksBulkDto(List<SetTiebreakerRankEntryDto> Ranks);
public record SetTiebreakerAppliedDto(List<Guid> TeamIds);
