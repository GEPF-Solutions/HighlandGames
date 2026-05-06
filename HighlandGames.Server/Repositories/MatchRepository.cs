using HighlandGames.Server.Data;
using HighlandGames.Server.Models;
using HighlandGames.Server.Repositories.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace HighlandGames.Server.Repositories;

public class MatchRepository(AppDbContext db) : IMatchRepository
{
    public async Task<IEnumerable<Match>> GetAllAsync(string? disciplineId, string? gender)
    {
        var query = db.Matches.Include(m => m.TeamA).Include(m => m.TeamB).AsQueryable();
        if (disciplineId is not null) query = query.Where(m => m.DisciplineId == disciplineId);
        if (gender is not null) query = query.Where(m => m.Gender == gender);
        return await query.OrderBy(m => m.Order).ToListAsync();
    }

    public async Task<Match?> GetByIdAsync(Guid id)
        => await db.Matches.Include(m => m.TeamA).Include(m => m.TeamB).FirstOrDefaultAsync(m => m.Id == id);

    public async Task<Match> CreateAsync(Match match)
    {
        var maxOrder = await db.Matches
            .Where(m => m.DisciplineId == match.DisciplineId && m.Gender == match.Gender)
            .MaxAsync(m => (int?)m.Order) ?? -1;
        match.Order = maxOrder + 1;
        db.Matches.Add(match);
        await db.SaveChangesAsync();
        return match;
    }

    public async Task<Match> UpdateAsync(Match match)
    {
        db.Matches.Update(match);
        await db.SaveChangesAsync();
        return match;
    }

    public async Task DeleteAsync(Guid id)
    {
        var match = await db.Matches.FindAsync(id);
        if (match is not null)
        {
            db.Matches.Remove(match);
            await db.SaveChangesAsync();
        }
    }

    public async Task DeleteByDisciplineAsync(string disciplineId, string gender)
    {
        var matches = await db.Matches
            .Where(m => m.DisciplineId == disciplineId && m.Gender == gender)
            .ToListAsync();
        db.Matches.RemoveRange(matches);
        await db.SaveChangesAsync();
    }

    public async Task ReorderAsync(string disciplineId, string gender, List<Guid> ids)
    {
        var matches = await db.Matches
            .Where(m => m.DisciplineId == disciplineId && m.Gender == gender)
            .ToListAsync();
        for (int i = 0; i < ids.Count; i++)
        {
            var match = matches.FirstOrDefault(m => m.Id == ids[i]);
            if (match is not null) match.Order = i;
        }
        await db.SaveChangesAsync();
    }
}
