namespace HighlandGames.Server.DTOs;

public record CreateTeamDto(string Name, string Gender);
public record TeamDto(Guid id, string Name, string Gender);
