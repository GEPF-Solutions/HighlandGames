using HighlandGames.Server.DTOs;

namespace HighlandGames.Server.Services;

public interface IMatchService
{
    Task<IEnumerable<MatchDto>> GetAllAsync(string? disciplineId, string? gender);
    Task<IEnumerable<MatchDto>> GenerateAsync(GenerateMatchesDto dto);
    Task<MatchDto?> UpdateAsync(Guid id, UpdateMatchDto dto);
    Task DeleteByDisciplineAsync(string disciplineId, string gender);
}
