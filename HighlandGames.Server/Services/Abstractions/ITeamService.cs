using HighlandGames.Server.DTOs;

namespace HighlandGames.Server.Services.Abstractions;

public interface ITeamService
{
    Task<IEnumerable<TeamDto>> GetAllAsync();
    Task<IEnumerable<TeamDto>> GetByGenderAsync(string gender);
    Task<TeamDto> CreateAsync(CreateTeamDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> SetTiebreakerRankAsync(Guid id, int? rank);
    Task SetTiebreakerRanksBulkAsync(IEnumerable<(Guid Id, int? Rank)> ranks);
    Task SetTiebreakerAppliedAsync(IEnumerable<Guid> ids, bool applied);
    Task ResetAllTiebreakerAppliedAsync();
}
