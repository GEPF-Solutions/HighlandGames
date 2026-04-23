using HighlandGames.Server.Data;
using HighlandGames.Server.Hubs;
using HighlandGames.Server.Repositories;
using HighlandGames.Server.Services;
using Microsoft.EntityFrameworkCore;

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

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy => policy.WithOrigins("https://localhost:5173").AllowAnyHeader().AllowAnyMethod().AllowCredentials());
        });

        var app = builder.Build();

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
