namespace HighlandGames.Server.Services.Abstractions;

public interface IPdfService
{
    Task<byte[]> GenerateMatchListAsync(string disciplineId);
    Task<byte[]> GenerateCombinedResultsAsync(bool textOnly);
    Task<byte[]> GenerateCertificatesAsync(bool textOnly);
}
