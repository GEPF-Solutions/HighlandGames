using HighlandGames.Server.DTOs;

namespace HighlandGames.Server.Services.Abstractions;

public interface IMatchService
{
    Task<IEnumerable<MatchDto>> GetAllAsync(string? disciplineId, string? gender);
    Task<MatchDto> CreateAsync(CreateMatchDto dto);
    Task<MatchDto?> UpdateAsync(Guid id, UpdateMatchDto dto);
    Task DeleteAsync(Guid id);
    Task DeleteByDisciplineAsync(string disciplineId, string gender);
    Task ReorderAsync(string disciplineId, string gender, ReorderMatchesDto dto);
}
