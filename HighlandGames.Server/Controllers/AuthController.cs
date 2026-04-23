using HighlandGames.Server.DTOs;
using HighlandGames.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace HighlandGames.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        var token = authService.Login(dto);

        if (token is null)
        {
            return Unauthorized();
        }

        return Ok(token);
    }
}
