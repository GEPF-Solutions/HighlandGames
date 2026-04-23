using HighlandGames.Server.DTOs;

namespace HighlandGames.Server.Services;

public interface IDisciplineService
{
    Task<IEnumerable<DisciplineDto>> GetAllAsync();
    Task<DisciplineDto?> GetByIdAsync(string id);
    Task<bool> UpdateStatusAsync(string id, UpdateDisciplineStatusDto dto);
}
