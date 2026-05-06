using HighlandGames.Server.DTOs;
using HighlandGames.Server.Hubs;
using HighlandGames.Server.Models;
using HighlandGames.Server.Repositories.Abstractions;
using HighlandGames.Server.Services.Abstractions;
using Microsoft.AspNetCore.SignalR;

namespace HighlandGames.Server.Services;

public class MatchService(IMatchRepository matchRepository, IHubContext<ResultsHub> hub) : IMatchService
{
    private static MatchDto ToDto(Match m) => new(
        m.Id, m.DisciplineId, m.Gender, m.Order,
        m.TeamAId, m.TeamA?.Name ?? string.Empty,
        m.TeamBId, m.TeamB?.Name,
        m.TeamAScore, m.TeamBScore, m.WinnerTeamId, m.IsManualOverride
    );

    public async Task<IEnumerable<MatchDto>> GetAllAsync(string? disciplineId, string? gender)
        => (await matchRepository.GetAllAsync(disciplineId, gender)).Select(ToDto);

    public async Task<MatchDto> CreateAsync(CreateMatchDto dto)
    {
        var match = new Match
        {
            DisciplineId = dto.DisciplineId,
            Gender = dto.Gender,
            TeamAId = dto.TeamAId,
            TeamBId = dto.TeamBId,
        };
        await matchRepository.CreateAsync(match);
        var reloaded = await matchRepository.GetByIdAsync(match.Id);
        await hub.Clients.Group($"matches-{dto.DisciplineId}").SendAsync("MatchesUpdated", dto.DisciplineId);
        return ToDto(reloaded!);
    }

    public async Task<MatchDto?> UpdateAsync(Guid id, UpdateMatchDto dto)
    {
        var match = await matchRepository.GetByIdAsync(id);
        if (match is null) return null;

        if (dto.TeamAId.HasValue) match.TeamAId = dto.TeamAId.Value;
        if (dto.TeamBId.HasValue) match.TeamBId = dto.TeamBId.Value;
        match.TeamAScore = dto.TeamAScore;
        match.TeamBScore = dto.TeamBScore;
        match.WinnerTeamId = dto.WinnerTeamId;
        match.IsManualOverride = true;

        var updated = await matchRepository.UpdateAsync(match);
        await hub.Clients.Group($"matches-{match.DisciplineId}").SendAsync("MatchesUpdated", match.DisciplineId);
        return ToDto(updated);
    }

    public async Task DeleteAsync(Guid id)
    {
        var match = await matchRepository.GetByIdAsync(id);
        if (match is not null)
        {
            await matchRepository.DeleteAsync(id);
            await hub.Clients.Group($"matches-{match.DisciplineId}").SendAsync("MatchesUpdated", match.DisciplineId);
        }
    }

    public async Task DeleteByDisciplineAsync(string disciplineId, string gender)
    {
        await matchRepository.DeleteByDisciplineAsync(disciplineId, gender);
        await hub.Clients.Group($"matches-{disciplineId}").SendAsync("MatchesUpdated", disciplineId);
    }

    public async Task ReorderAsync(string disciplineId, string gender, ReorderMatchesDto dto)
    {
        await matchRepository.ReorderAsync(disciplineId, gender, dto.Ids);
        await hub.Clients.Group($"matches-{disciplineId}").SendAsync("MatchesUpdated", disciplineId);
    }
}
