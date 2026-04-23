using HighlandGames.Server.Models;

namespace HighlandGames.Server.Repositories;

public interface IDisciplineRepository
{
    Task<IEnumerable<Discipline>> GetAllAsync();
    Task<Discipline?> GetByIdAsync(string id);
    Task UpdateAsync(Discipline discipline);
}
