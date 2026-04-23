using HighlandGames.Server.Models;

namespace HighlandGames.Server.Repositories;

public interface IResultRepository
{
    Task<IEnumerable<Result>> GetAllAsync();
    Task<IEnumerable<Result>> GetByDisciplineAsync(string disciplineId);
    Task<IEnumerable<Result>> GetByTeamAsync(Guid teamId);
    Task<Result?> GetByTeamAndDisciplineAsync(Guid teamId, string disciplineId);
    Task<Result> UpsertAsync(Result result);
    Task DeleteAsync(Result result);
}
