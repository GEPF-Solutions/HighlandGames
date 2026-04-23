using HighlandGames.Server.DTOs;

namespace HighlandGames.Server.Services;

public interface IAuthService
{
    TokenDto? Login(LoginDto dto);
}
