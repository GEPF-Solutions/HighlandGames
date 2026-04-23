using HighlandGames.Server.Data;
using HighlandGames.Server.DTOs;
using HighlandGames.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace HighlandGames.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController(ITeamService teamService) : ControllerBase
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
    public async Task<IActionResult> Create(CreateTeamDto dto)
    { 
        var team = await teamService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = team.id }, team);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await teamService.DeleteAsync(id);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

}
