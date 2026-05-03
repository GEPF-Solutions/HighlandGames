using HighlandGames.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HighlandGames.Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Discipline> Disciplines => Set<Discipline>();
    public DbSet<Result> Results => Set<Result>();
    public DbSet<Match> Matches => Set<Match>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Result>().HasIndex(r => new { r.TeamId, r.DisciplineId }).IsUnique();

        modelBuilder.Entity<Discipline>().HasData(
            new Discipline { Id = "sync", Number = 1, Name = "Synchronlauf", Icon = "🏃" },
            new Discipline { Id = "weight", Number = 2, Name = "Gewichtlauf", Icon = "🏋️" },
            new Discipline { Id = "caber", Number = 3, Name = "Baumstammwerfen", Icon = "🪵" },
            new Discipline { Id = "rope", Number = 4, Name = "Seilziehen", Icon = "💪" },
            new Discipline { Id = "fire", Number = 5, Name = "Dustlöschen", Icon = "🔥" }
        );
    }
}
