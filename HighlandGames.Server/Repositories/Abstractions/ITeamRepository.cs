using HighlandGames.Server.Models;

namespace HighlandGames.Server.Repositories.Abstractions;

public interface ITeamRepository
{
    Task<IEnumerable<Team>> GetAllAsync();
    Task<IEnumerable<Team>> GetByGenderAsync(string gender);
    Task<Team?> GetByIdAsync(Guid id);
    Task<Team> CreateAsync(Team team);
    Task DeleteAsync(Team team);
}
