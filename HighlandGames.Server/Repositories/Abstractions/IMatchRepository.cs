using HighlandGames.Server.Models;

namespace HighlandGames.Server.Repositories.Abstractions;

public interface IMatchRepository
{
    Task<IEnumerable<Match>> GetAllAsync(string? disciplineId, string? gender);
    Task<Match?> GetByIdAsync(Guid id);
    Task<IEnumerable<Match>> CreateManyAsync(IEnumerable<Match> matches);
    Task<Match> UpdateAsync(Match match);
    Task DeleteByDisciplineAsync(string disciplineId, string gender);
}
