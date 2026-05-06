using HighlandGames.Server.Models;

namespace HighlandGames.Server.Repositories.Abstractions;

public interface IDisciplineRepository
{
    Task<IEnumerable<Discipline>> GetAllAsync();
    Task<Discipline?> GetByIdAsync(string id);
    Task<(byte[]? Data, string? ContentType)> GetImageAsync(string id);
    Task UpdateAsync(Discipline discipline);
    Task CreateAsync(Discipline discipline);
    Task<bool> DeleteAsync(string id);
}
