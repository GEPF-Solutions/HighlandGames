namespace HighlandGames.Server.Models;

public class Result
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TeamId { get; set; }
    public required string DisciplineId { get; set; }
    public int Points { get; set; }
    public string? RawValue { get; set; }

    public Team? Team { get; set; }
    public Discipline? Discipline { get; set; }
}
