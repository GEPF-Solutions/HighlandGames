namespace HighlandGames.Server.Services.Abstractions;

public interface IPdfService
{
    Task<byte[]> GenerateMatchListAsync(string disciplineId);
    Task<byte[]> GenerateCombinedResultsAsync(bool printMode);
    Task<byte[]> GenerateCertificatesAsync(bool printMode);
}
