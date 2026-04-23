using HighlandGames.Server.DTOs;

namespace HighlandGames.Server.Services;

public interface IResultService
{
    Task<IEnumerable<ResultDto>> GetAllAsync();
    Task<IEnumerable<ResultDto>> GetByDisciplineAsync(string disciplineId);
    Task<IEnumerable<ResultDto>> GetByTeamAsync(Guid teamId);
    Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync(string gender);
    Task<ResultDto> UpsertAsync(UpsertResultDto dto);
    Task<bool> DeleteAsync(Guid id);
}
