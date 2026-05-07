using HighlandGames.Server.DTOs;

namespace HighlandGames.Server.Services.Abstractions;

public interface IDisciplineService
{
    Task<IEnumerable<DisciplineDto>> GetAllAsync();
    Task<DisciplineDto?> GetByIdAsync(string id);
    Task<bool> UpdateStatusAsync(string id, UpdateDisciplineStatusDto dto);
    Task<(byte[]? Data, string? ContentType)> GetImageAsync(string id);
    Task<DisciplineDto> CreateAsync(CreateDisciplineRequest request, byte[]? imageData, string? imageContentType);
    Task<bool> DeleteAsync(string id);
}
