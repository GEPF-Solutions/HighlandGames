namespace HighlandGames.Server.Models;

public class Discipline
{
    public required string Id { get; set; }
    public int Number { get; set; }
    public required string Name { get; set; }
    public byte[]? ImageData { get; set; }
    public string? ImageContentType { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = "upcoming";
}
