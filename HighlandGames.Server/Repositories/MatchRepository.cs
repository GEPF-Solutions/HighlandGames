using HighlandGames.Server.Data;
using HighlandGames.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HighlandGames.Server.Repositories;

public class MatchRepository(AppDbContext db) : IMatchRepository
{
    public async Task<IEnumerable<Match>> GetAllAsync(string? disciplineId, string? gender)
    {
        var query = db.Matches.Include(m => m.TeamA).Include(m => m.TeamB).AsQueryable();

        if (disciplineId is not null)
        {
            query = query.Where(m => m.DisciplineId == disciplineId);
        }

        if (gender is not null)
        {
            query = query.Where(m => m.TeamA!.Gender == gender);
        }

        return await query.ToListAsync();
    }

    public async Task<Match?> GetByIdAsync(Guid id)
    {
        return await db.Matches.Include(m => m.TeamA).Include(m => m.TeamB).FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<IEnumerable<Match>> CreateManyAsync(IEnumerable<Match> matches)
    {
        db.Matches.AddRange(matches);
        await db.SaveChangesAsync();
        return matches;
    }

    public async Task<Match> UpdateAsync(Match match)
    {
        db.Matches.Update(match);
        await db.SaveChangesAsync();
        return match;
    }

    public async Task DeleteByDisciplineAsync(string disciplineId, string gender)
    {
        var matches = await db.Matches.Include(m => m.TeamA).Where(m => m.DisciplineId == disciplineId && m.TeamA!.Gender == gender).ToListAsync();
        db.Matches.RemoveRange(matches);
        await db.SaveChangesAsync();
    }        
}
