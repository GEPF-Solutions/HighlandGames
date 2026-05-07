using HighlandGames.Server.DTOs;
using HighlandGames.Server.Models;
using HighlandGames.Server.Repositories.Abstractions;
using HighlandGames.Server.Services.Abstractions;

namespace HighlandGames.Server.Services;

public class TeamService(ITeamRepository teamRepository) : ITeamService
{
    public async Task<IEnumerable<TeamDto>> GetAllAsync()
    {
        return (await teamRepository.GetAllAsync()).Select(t => new TeamDto(t.Id, t.Name, t.Gender, t.TiebreakerRank));
    }

    public async Task<IEnumerable<TeamDto>> GetByGenderAsync(string gender)
    {
        return (await teamRepository.GetByGenderAsync(gender)).Select(t => new TeamDto(t.Id, t.Name, t.Gender, t.TiebreakerRank));
    }

    public async Task<TeamDto> CreateAsync(CreateTeamDto dto)
    {
        var team = new Team { Name = dto.Name, Gender = dto.Gender };
        var created = await teamRepository.CreateAsync(team);
        return new TeamDto(created.Id, created.Name, created.Gender, created.TiebreakerRank);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var team = await teamRepository.GetByIdAsync(id);
        if (team is null) return false;
        await teamRepository.DeleteAsync(team);
        return true;
    }

    public Task<bool> SetTiebreakerRankAsync(Guid id, int? rank) =>
        teamRepository.SetTiebreakerRankAsync(id, rank);

    public Task SetTiebreakerRanksBulkAsync(IEnumerable<(Guid Id, int? Rank)> ranks) =>
        teamRepository.SetTiebreakerRanksBulkAsync(ranks);

    public Task SetTiebreakerAppliedAsync(IEnumerable<Guid> ids, bool applied) =>
        teamRepository.SetTiebreakerAppliedAsync(ids, applied);

    public Task ResetAllTiebreakerAppliedAsync() =>
        teamRepository.ResetAllTiebreakerAppliedAsync();
}
