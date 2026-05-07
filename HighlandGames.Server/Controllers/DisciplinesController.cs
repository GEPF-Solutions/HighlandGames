using HighlandGames.Server.DTOs;
using HighlandGames.Server.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
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
        if (discipline is null) return NotFound();
        return Ok(discipline);
    }

    [HttpGet("{id}/image")]
    public async Task<IActionResult> GetImage(string id)
    {
        var (data, contentType) = await disciplineService.GetImageAsync(id);
        if (data is null) return NotFound();
        return File(data, contentType!);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromForm] CreateDisciplineRequest request, IFormFile? image)
    {
        byte[]? imageData = null;
        string? imageContentType = null;

        if (image is not null)
        {
            using var ms = new MemoryStream();
            await image.CopyToAsync(ms);
            imageData = ms.ToArray();
            imageContentType = image.ContentType;
        }

        var dto = await disciplineService.CreateAsync(request, imageData, imageContentType);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id)
    {
        var success = await disciplineService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPut("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(string id, UpdateDisciplineStatusDto dto)
    {
        var success = await disciplineService.UpdateStatusAsync(id, dto);
        if (!success) return NotFound();
        return NoContent();
    }
}
