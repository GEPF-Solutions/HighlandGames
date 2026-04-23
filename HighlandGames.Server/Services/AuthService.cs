using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HighlandGames.Server.DTOs;
using Microsoft.IdentityModel.Tokens;


namespace HighlandGames.Server.Services;

public class AuthService(IConfiguration configuration) : IAuthService
{
    public TokenDto? Login(LoginDto dto)
    {
        var adminPassword = configuration["Jwt:AdminPassword"];

        if (dto.Password != adminPassword)
        {
            return null;
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: [new Claim(ClaimTypes.Role, "Admin")],
                expires: DateTime.UtcNow.AddHours(12),
                signingCredentials: credentials
        );

        return new TokenDto(new JwtSecurityTokenHandler().WriteToken(token));
    }
}
