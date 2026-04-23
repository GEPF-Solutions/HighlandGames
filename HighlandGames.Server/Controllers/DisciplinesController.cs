using HighlandGames.Server.DTOs;
using HighlandGames.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace HighlandGames.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DisciplinesController(IDisciplineService disciplineService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await disciplineService.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var discipline = await disciplineService.GetByIdAsync(id);

        if (discipline is null)
        {
            return NotFound();
        }

        return Ok(discipline);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, UpdateDisciplineStatusDto dto)
    {
        var success = await disciplineService.UpdateStatusAsync(id, dto);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }
}
