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
    {
        return Ok(await matchService.GetAllAsync(disciplineId, gender));
    }

    [HttpPost("generate")]
    [Authorize]
    public async Task<IActionResult> Generate([FromBody] GenerateMatchesDto dto)
    {
        return Ok(await matchService.GenerateAsync(dto));
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMatchDto dto)
    {
        var result = await matchService.UpdateAsync(id, dto);

        if (result is null) 
        { 
            return NotFound(); 
        }

        return Ok(result);
    }

    [HttpDelete("{disciplineId}/{gender}")]
    [Authorize]
    public async Task<IActionResult> Delete(string disciplineId, string gender)
    {
        await matchService.DeleteByDisciplineAsync(disciplineId, gender);
        return NoContent();
    }
}
