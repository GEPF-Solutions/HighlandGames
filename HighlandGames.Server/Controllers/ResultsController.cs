using HighlandGames.Server.DTOs;
using HighlandGames.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace HighlandGames.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResultsController(IResultService resultService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await resultService.GetAllAsync());
    }

    [HttpGet("discipline/{disciplineId}")]
    public async Task<IActionResult> GetByDiscipline(string disciplineId)
    {
        return Ok(await resultService.GetByDisciplineAsync(disciplineId));
    }

    [HttpGet("team/{teamId}")]
    public async Task<IActionResult> GetByTeam(Guid teamId)
    {
        return Ok(await resultService.GetByTeamAsync(teamId));
    }

    [HttpGet("leaderboard/{gender}")]
    public async Task<IActionResult> GetLeaderboard(string gender)
    {
        return Ok(await resultService.GetLeaderboardAsync(gender));
    }

    [HttpPost]
    public async Task<IActionResult> Upsert(UpsertResultDto dto)
    {
        var result = await resultService.UpsertAsync(dto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await resultService.DeleteAsync(id);

        if (!success) 
        {
            return NotFound(); 
        }

        return NoContent();
    }
}
