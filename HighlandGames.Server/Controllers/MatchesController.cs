using HighlandGames.Server.DTOs;
using HighlandGames.Server.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HighlandGames.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController(IMatchService matchService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? disciplineId, [FromQuery] string? gender)
        => Ok(await matchService.GetAllAsync(disciplineId, gender));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateMatchDto dto)
        => Ok(await matchService.CreateAsync(dto));

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMatchDto dto)
    {
        var result = await matchService.UpdateAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        await matchService.DeleteAsync(id);
        return NoContent();
    }

    [HttpDelete("{disciplineId}/{gender}")]
    [Authorize]
    public async Task<IActionResult> DeleteByDiscipline(string disciplineId, string gender)
    {
        await matchService.DeleteByDisciplineAsync(disciplineId, gender);
        return NoContent();
    }

    [HttpPut("{disciplineId}/{gender}/reorder")]
    [Authorize]
    public async Task<IActionResult> Reorder(string disciplineId, string gender, [FromBody] ReorderMatchesDto dto)
    {
        await matchService.ReorderAsync(disciplineId, gender, dto);
        return NoContent();
    }
}
