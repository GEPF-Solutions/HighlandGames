using HighlandGames.Server.DTOs;
using HighlandGames.Server.Hubs;
using HighlandGames.Server.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace HighlandGames.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController(ITeamService teamService, IResultService resultService, IHubContext<ResultsHub> hubContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await teamService.GetAllAsync());
    }

    [HttpGet("{gender}")]
    public async Task<IActionResult> GetByGender(string gender)
    {
        return Ok(await teamService.GetByGenderAsync(gender));
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(CreateTeamDto dto)
    { 
        var team = await teamService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = team.id }, team);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await teamService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPut("tiebreaker/bulk")]
    [Authorize]
    public async Task<IActionResult> SetTiebreakerRanksBulk([FromBody] SetTiebreakerRanksBulkDto dto)
    {
        await teamService.SetTiebreakerRanksBulkAsync(dto.Ranks.Select(r => (r.Id, (int?)r.Rank)));

        var affectedIds = dto.Ranks.Select(r => r.Id).ToHashSet();
        var allTeams = await teamService.GetAllAsync();
        var genders = allTeams.Where(t => affectedIds.Contains(t.id)).Select(t => t.Gender).Distinct();

        foreach (var gender in genders)
        {
            var leaderboard = await resultService.GetLeaderboardAsync(gender);
            await hubContext.Clients.Group($"leaderboard-{gender}").SendAsync("LeaderboardUpdated", leaderboard);
        }

        return NoContent();
    }

    [HttpPut("tiebreaker/applied")]
    [Authorize]
    public async Task<IActionResult> SetTiebreakerApplied([FromBody] SetTiebreakerAppliedDto dto)
    {
        await teamService.SetTiebreakerAppliedAsync(dto.TeamIds, true);

        var allTeams = await teamService.GetAllAsync();
        var genders = allTeams.Where(t => dto.TeamIds.Contains(t.id)).Select(t => t.Gender).Distinct();
        foreach (var gender in genders)
        {
            var leaderboard = await resultService.GetLeaderboardAsync(gender);
            await hubContext.Clients.Group($"leaderboard-{gender}").SendAsync("LeaderboardUpdated", leaderboard);
        }

        return NoContent();
    }

    [HttpDelete("tiebreaker/applied")]
    [Authorize]
    public async Task<IActionResult> ResetAllTiebreakerApplied()
    {
        await teamService.ResetAllTiebreakerAppliedAsync();

        foreach (var gender in new[] { "m", "f" })
        {
            var leaderboard = await resultService.GetLeaderboardAsync(gender);
            await hubContext.Clients.Group($"leaderboard-{gender}").SendAsync("LeaderboardUpdated", leaderboard);
        }

        return NoContent();
    }

    [HttpPut("{id}/tiebreaker")]
    [Authorize]
    public async Task<IActionResult> SetTiebreakerRank(Guid id, [FromBody] SetTiebreakerRankDto dto)
    {
        var teams = await teamService.GetAllAsync();
        var team = teams.FirstOrDefault(t => t.id == id);
        if (team is null) return NotFound();

        var success = await teamService.SetTiebreakerRankAsync(id, dto.Rank);
        if (!success) return NotFound();

        var leaderboard = await resultService.GetLeaderboardAsync(team.Gender);
        await hubContext.Clients.Group($"leaderboard-{team.Gender}").SendAsync("LeaderboardUpdated", leaderboard);

        return NoContent();
    }
}
