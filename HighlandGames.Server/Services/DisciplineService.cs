using HighlandGames.Server.DTOs;
using HighlandGames.Server.Hubs;
using HighlandGames.Server.Models;
using HighlandGames.Server.Repositories.Abstractions;
using HighlandGames.Server.Services.Abstractions;
using Microsoft.AspNetCore.SignalR;

namespace HighlandGames.Server.Services;

public class DisciplineService(IDisciplineRepository disciplineRepository, IHubContext<ResultsHub> hubContext) : IDisciplineService
{
    private static string? ImageUrl(Discipline d) =>
        d.ImageData is not null ? $"/api/disciplines/{d.Id}/image" : null;

    public async Task<IEnumerable<DisciplineDto>> GetAllAsync()
    {
        return (await disciplineRepository.GetAllAsync()).Select(d => new DisciplineDto(d.Id, d.Number, d.Name, ImageUrl(d), d.Description, d.Status));
    }

    public async Task<DisciplineDto?> GetByIdAsync(string id)
    {
        var discipline = await disciplineRepository.GetByIdAsync(id);
        return discipline is null ? null : new DisciplineDto(discipline.Id, discipline.Number, discipline.Name, ImageUrl(discipline), discipline.Description, discipline.Status);
    }

    public Task<(byte[]? Data, string? ContentType)> GetImageAsync(string id) =>
        disciplineRepository.GetImageAsync(id);

    public async Task<bool> UpdateStatusAsync(string id, UpdateDisciplineStatusDto dto)
    {
        var discipline = await disciplineRepository.GetByIdAsync(id);

        if (discipline is null) return false;

        discipline.Status = dto.Status;
        await disciplineRepository.UpdateAsync(discipline);

        var updated = new DisciplineDto(discipline.Id, discipline.Number, discipline.Name, ImageUrl(discipline), discipline.Description, discipline.Status);
        await hubContext.Clients.All.SendAsync("DisciplineStatusChanged", updated);

        return true;
    }

    public async Task<DisciplineDto> CreateAsync(CreateDisciplineRequest request, byte[]? imageData, string? imageContentType)
    {
        var normalized = request.Name.ToLowerInvariant().Trim()
            .Replace("ä", "ae").Replace("ö", "oe").Replace("ü", "ue").Replace("ß", "ss");
        var slug = System.Text.RegularExpressions.Regex.Replace(normalized, @"[^a-z0-9]+", "-").Trim('-');
        var id = slug;
        var counter = 2;
        while (await disciplineRepository.GetByIdAsync(id) is not null)
            id = $"{slug}-{counter++}";

        var discipline = new Discipline
        {
            Id = id,
            Name = request.Name,
            Number = request.Number,
            Description = request.Description,
            ImageData = imageData,
            ImageContentType = imageContentType,
            Status = "upcoming",
        };

        await disciplineRepository.CreateAsync(discipline);
        return new DisciplineDto(discipline.Id, discipline.Number, discipline.Name, ImageUrl(discipline), discipline.Description, discipline.Status);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        return await disciplineRepository.DeleteAsync(id);
    }
}
