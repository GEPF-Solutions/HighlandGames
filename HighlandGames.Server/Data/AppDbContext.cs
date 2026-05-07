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

    }
}
