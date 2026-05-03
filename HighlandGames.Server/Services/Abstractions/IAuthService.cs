using HighlandGames.Server.DTOs;

namespace HighlandGames.Server.Services.Abstractions;

public interface IAuthService
{
    TokenDto? Login(LoginDto dto);
}
