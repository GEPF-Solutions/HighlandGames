using HighlandGames.Server.DTOs;

namespace HighlandGames.Server.Services;

public interface ITeamService
{
    Task<IEnumerable<TeamDto>> GetAllAsync();
    Task<IEnumerable<TeamDto>> GetByGenderAsync(string gender);
    Task<TeamDto> CreateAsync(CreateTeamDto dto);
    Task<bool> DeleteAsync(Guid id);
}
