namespace HighlandGames.Server.DTOs;

public record DisciplineDto(string Id, int Number, string Name, string? Icon, string? Description, string Status, string MeasurementType);
public record UpdateDisciplineStatusDto(string Status);

public class CreateDisciplineRequest
{
    public required string Name { get; set; }
    public int Number { get; set; }
    public string? Description { get; set; }
    public string MeasurementType { get; set; } = "none";
}
