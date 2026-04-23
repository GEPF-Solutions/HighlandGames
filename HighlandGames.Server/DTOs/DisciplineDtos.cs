namespace HighlandGames.Server.DTOs;

public record DisciplineDto(string Id, int Number, string Name, string? Icon, string? Description, string Status);
public record UpdateDisciplineStatusDto(string Status);
