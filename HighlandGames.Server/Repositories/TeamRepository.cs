using HighlandGames.Server.Data;
using HighlandGames.Server.Models;
using HighlandGames.Server.Repositories.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace HighlandGames.Server.Repositories;

public class TeamRepository(AppDbContext db) : ITeamRepository
{
    public async Task<IEnumerable<Team>> GetAllAsync()
    {
        return await db.Teams.OrderBy(t => t.Name).ToListAsync();
    }


    public async Task<IEnumerable<Team>> GetByGenderAsync(string gender)
    {
        return await db.Teams.Where(t => t.Gender == gender).OrderBy(t => t.Name).ToListAsync();
    }

    public async Task<Team?> GetByIdAsync(Guid id)
    {
        return await db.Teams.FindAsync(id);
    }

    public async Task<Team> CreateAsync(Team team)
    {
        db.Teams.Add(team);
        await db.SaveChangesAsync();
        return team;
    }

    public async Task DeleteAsync(Team team)
    {
        db.Teams.Remove(team);
        await db.SaveChangesAsync();
    }

    public async Task<bool> SetTiebreakerRankAsync(Guid id, int? rank)
    {
        var team = await db.Teams.FindAsync(id);
        if (team is null) return false;
        team.TiebreakerRank = rank;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task SetTiebreakerRanksBulkAsync(IEnumerable<(Guid Id, int? Rank)> ranks)
    {
        var rankList = ranks.ToList();
        var ids = rankList.Select(r => r.Id).ToHashSet();
        var teams = await db.Teams.Where(t => ids.Contains(t.Id)).ToListAsync();
        foreach (var (id, rank) in rankList)
        {
            var team = teams.FirstOrDefault(t => t.Id == id);
            if (team is not null) team.TiebreakerRank = rank;
        }
        await db.SaveChangesAsync();
    }
}
