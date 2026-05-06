using HighlandGames.Server.DTOs;
using HighlandGames.Server.Hubs;
using HighlandGames.Server.Models;
using HighlandGames.Server.Repositories.Abstractions;
using HighlandGames.Server.Services.Abstractions;
using Microsoft.AspNetCore.SignalR;

namespace HighlandGames.Server.Services;

public class ResultService(IResultRepository resultRepository, ITeamRepository teamRepository, IHubContext<ResultsHub> hubContext) : IResultService
{
    public async Task<IEnumerable<ResultDto>> GetAllAsync()
    {
        return (await resultRepository.GetAllAsync()).Select(r => new ResultDto(r.Id, r.TeamId, r.Team?.Name ?? string.Empty, r.Team?.Gender ?? string.Empty, r.DisciplineId, r.Points, r.RawValue, r.UpdatedAt));
    }

    public async Task<IEnumerable<ResultDto>> GetByDisciplineAsync(string disciplineId)
    {
        return (await resultRepository.GetByDisciplineAsync(disciplineId)).Select(r => new ResultDto(r.Id, r.TeamId, r.Team?.Name ?? string.Empty, r.Team?.Gender ?? string.Empty, r.DisciplineId, r.Points, r.RawValue, r.UpdatedAt));
    }

    public async Task<IEnumerable<ResultDto>> GetByTeamAsync(Guid teamId)
    {
        return (await resultRepository.GetByTeamAsync(teamId)).Select(r => new ResultDto(r.Id, r.TeamId, r.Team?.Name ?? string.Empty, r.Team?.Gender ?? string.Empty, r.DisciplineId, r.Points, r.RawValue, r.UpdatedAt));
    }

    public async Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync(string gender)
    {
        var teams = await teamRepository.GetByGenderAsync(gender);
        var results = await resultRepository.GetAllAsync();

        return teams
            .Select(t => new LeaderboardEntryDto(t.Id, t.Name, t.Gender, results.Where(r => r.TeamId == t.Id).Sum(r => r.Points), t.TiebreakerRank))
            .OrderByDescending(e => e.TotalPoints)
            .ThenBy(e => e.TiebreakerRank ?? int.MaxValue);
    }

    public async Task<ResultDto> UpsertAsync(UpsertResultDto dto)
    {
        var result = new Result
        {
            TeamId = dto.TeamId,
            DisciplineId = dto.DisciplineId,
            Points = dto.Points,
            RawValue = dto.RawValue,
        };

        var upsert = await resultRepository.UpsertAsync(result);
        var resultDto = new ResultDto(upsert.Id, upsert.TeamId, upsert.Team?.Name ?? string.Empty, upsert.Team?.Gender ?? string.Empty, upsert.DisciplineId, upsert.Points, upsert.RawValue, upsert.UpdatedAt);

        // Push to all clients watching this discipline
        await hubContext.Clients.Group($"discipline-{dto.DisciplineId}").SendAsync("ResultUpdated", resultDto);

        // Push updated leaderboard to relevant gender group
        var team = await teamRepository.GetByIdAsync(dto.TeamId);

        if (team is not null)
        {
            var leaderboard = await GetLeaderboardAsync(team.Gender);
            await hubContext.Clients.Group($"leaderboard-{team.Gender}").SendAsync("LeaderboardUpdated", leaderboard);
        }

        return resultDto;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var all = await resultRepository.GetAllAsync();
        var result = all.FirstOrDefault(r => r.Id == id);

        if (result is null)
        {
            return false;
        }

        await resultRepository.DeleteAsync(result);
        return true;
    }
}
