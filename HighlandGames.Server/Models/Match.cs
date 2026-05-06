namespace HighlandGames.Server.Models;

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DisciplineId { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public int Order { get; set; }
    public Guid TeamAId { get; set; }
    public Guid? TeamBId { get; set; }
    public int? TeamAScore { get; set; }
    public int? TeamBScore { get; set; }
    public Guid? WinnerTeamId { get; set; }
    public bool IsManualOverride { get; set; } = false;

    public Discipline? Discipline { get; set; }
    public Team? TeamA { get; set; }
    public Team? TeamB { get; set; }
}
