using HighlandGames.Server.DTOs;
using HighlandGames.Server.Repositories;

namespace HighlandGames.Server.Services;

public class DisciplineService(IDisciplineRepository disciplineRepository) : IDisciplineService
{
    public async Task<IEnumerable<DisciplineDto>> GetAllAsync()
    {
        return (await disciplineRepository.GetAllAsync()).Select(d => new DisciplineDto(d.Id, d.Number, d.Name, d.Icon, d.Description, d.Status));
    }

    public async Task<DisciplineDto?> GetByIdAsync(string id)
    {
        var discipline = await disciplineRepository.GetByIdAsync(id);
        return discipline is null ? null : new DisciplineDto(discipline.Id, discipline.Number, discipline.Name, discipline.Icon, discipline.Description, discipline.Status);
    }

    public async Task<bool> UpdateStatusAsync(string id, UpdateDisciplineStatusDto dto)
    {
        var discipline = await disciplineRepository.GetByIdAsync(id);

        if (discipline is null)
        {
            return false;
        }

        discipline.Status = dto.Status;
        await disciplineRepository.UpdateAsync(discipline);
        return true;
    }
}
