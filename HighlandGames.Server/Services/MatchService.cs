using HighlandGames.Server.DTOs;
using HighlandGames.Server.Hubs;
using HighlandGames.Server.Models;
using HighlandGames.Server.Repositories.Abstractions;
using HighlandGames.Server.Services.Abstractions;
using Microsoft.AspNetCore.SignalR;

namespace HighlandGames.Server.Services;

public class MatchService(IMatchRepository matchRepository, ITeamRepository teamRepository, IHubContext<ResultsHub> hub) : IMatchService
{
    public async Task<IEnumerable<MatchDto>> GetAllAsync(string? disciplineId, string? gender)
    {
        return (await matchRepository.GetAllAsync(disciplineId, gender)).Select(m => new MatchDto(
            m.Id, 
            m.DisciplineId, 
            m.TeamAId, 
            m.TeamA?.Name ?? string.Empty,
            m.TeamBId,
            m.TeamB?.Name ?? string.Empty,
            m.TeamAScore,
            m.TeamBScore,
            m.WinnerTeamId,
            m.IsManualOverride
        ));
    }

    public async Task<IEnumerable<MatchDto>> GenerateAsync(GenerateMatchesDto dto)
    {
        // Delete existing non-manual matches for this discipline+gender
        await matchRepository.DeleteByDisciplineAsync(dto.DisciplineId, dto.Gender);

        var teams = (await teamRepository.GetByGenderAsync(dto.Gender)).ToList();

        // Shuffle for random seeding
        var rng = new Random();
        teams = teams.OrderBy(_ => rng.Next()).ToList();

        var matches = new List<Match>();

        for (int i = 0; i + 1 < teams.Count; i += 2)
        {
            matches.Add(new Match
            {
                DisciplineId = dto.DisciplineId,
                TeamAId = teams[i].Id,
                TeamBId = teams[i + 1].Id
            });
        }

        var created = await matchRepository.CreateManyAsync(matches);

        await hub.Clients.Group($"matches-{dto.DisciplineId}").SendAsync("MatchesUpdated", dto.DisciplineId);

        // Reload with navigation properties
        return (await matchRepository.GetAllAsync(dto.DisciplineId, dto.Gender)).Select(m => new MatchDto(
            m.Id,
            m.DisciplineId,
            m.TeamAId,
            m.TeamA?.Name ?? string.Empty,
            m.TeamBId,
            m.TeamB?.Name ?? string.Empty,
            m.TeamAScore,
            m.TeamBScore,
            m.WinnerTeamId,
            m.IsManualOverride
        ));    
    }

    public async Task<MatchDto?> UpdateAsync(Guid id, UpdateMatchDto dto)
    {
        var match = await matchRepository.GetByIdAsync(id);

        if (match is null)
        {
            return null;
        }

        if (dto.TeamAId.HasValue) 
        { 
            match.TeamAId = dto.TeamAId.Value; 
        }

        if (dto.TeamBId.HasValue) 
        { 
            match.TeamBId = dto.TeamBId.Value; 
        }

        match.TeamAScore = dto.TeamAScore;
        match.TeamBScore = dto.TeamBScore;
        match.WinnerTeamId = dto.WinnerTeamId;
        match.IsManualOverride = true;

        var updated = await matchRepository.UpdateAsync(match);

        await hub.Clients.Group($"matches-{match.DisciplineId}").SendAsync("MatchesUpdated", match.DisciplineId);

        return new MatchDto(
            updated.Id,
            updated.DisciplineId,
            updated.TeamAId,
            updated.TeamA?.Name ?? string.Empty,
            updated.TeamBId,
            updated.TeamB?.Name ?? string.Empty,
            updated.TeamAScore,
            updated.TeamBScore,
            updated.WinnerTeamId,
            updated.IsManualOverride
        );
    }

    public Task DeleteByDisciplineAsync(string disciplineId, string gender)
    {
        return matchRepository.DeleteByDisciplineAsync(disciplineId, gender);
    }
}
