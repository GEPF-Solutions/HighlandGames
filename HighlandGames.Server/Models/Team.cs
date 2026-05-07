namespace HighlandGames.Server.Models;

public class Team
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Gender { get; set; } // "m" | "f"
    public int? TiebreakerRank { get; set; }
    public bool TiebreakerApplied { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
