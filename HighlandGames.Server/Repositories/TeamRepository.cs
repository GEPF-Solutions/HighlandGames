using HighlandGames.Server.Data;
using HighlandGames.Server.Models;
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
}
