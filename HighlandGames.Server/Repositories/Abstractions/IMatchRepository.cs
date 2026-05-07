using HighlandGames.Server.Models;

namespace HighlandGames.Server.Repositories.Abstractions;

public interface IMatchRepository
{
    Task<IEnumerable<Match>> GetAllAsync(string? disciplineId, string? gender);
    Task<Match?> GetByIdAsync(Guid id);
    Task<Match> CreateAsync(Match match);
    Task<Match> UpdateAsync(Match match);
    Task DeleteAsync(Guid id);
    Task DeleteByDisciplineAsync(string disciplineId, string gender);
    Task ReorderAsync(string disciplineId, string gender, List<Guid> ids);
}
