using HighlandGames.Server.Data;
using HighlandGames.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HighlandGames.Server.Repositories;

public class DisciplineRepository(AppDbContext db) : IDisciplineRepository
{
    public async Task<IEnumerable<Discipline>> GetAllAsync()
    {
        return await db.Disciplines.OrderBy(d => d.Number).ToListAsync();
    }

    public async Task<Discipline?> GetByIdAsync(string id)
    {
        return await db.Disciplines.FindAsync(id);
    }

    public async Task UpdateAsync(Discipline discipline)
    { 
        db.Disciplines.Update(discipline);
        await db.SaveChangesAsync();
    }
}
