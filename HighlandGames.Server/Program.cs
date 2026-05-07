using HighlandGames.Server.Data;
using HighlandGames.Server.Hubs;
using HighlandGames.Server.Repositories;
using HighlandGames.Server.Repositories.Abstractions;
using HighlandGames.Server.Services;
using HighlandGames.Server.Services.Abstractions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace HighlandGames.Server;

public class Program
{
    public static void Main(string[] args)
    {      
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddSignalR();
        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
        builder.Services.AddScoped<ITeamRepository, TeamRepository>();
        builder.Services.AddScoped<ITeamService, TeamService>();
        builder.Services.AddScoped<IDisciplineRepository, DisciplineRepository>();
        builder.Services.AddScoped<IDisciplineService, DisciplineService>();
        builder.Services.AddScoped<IResultRepository, ResultRepository>();
        builder.Services.AddScoped<IResultService, ResultService>();
        builder.Services.AddScoped<IMatchRepository, MatchRepository>();
        builder.Services.AddScoped<IMatchService, MatchService>();

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                };
            });

        builder.Services.AddScoped<IAuthService, AuthService>();

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy => policy.WithOrigins("https://localhost:5173").AllowAnyHeader().AllowAnyMethod().AllowCredentials());
        });
       
        var app = builder.Build();

        app.UseAuthentication();
        app.UseDefaultFiles();
        app.MapStaticAssets();           

        app.UseHttpsRedirection();
        app.UseCors();
        app.UseAuthorization();
        app.MapControllers();
        app.MapHub<ResultsHub>("/hubs/results");
        app.MapFallbackToFile("/index.html");

        app.Run();
    }
}
