using HighlandGames.Server.Data;
using HighlandGames.Server.Models;
using HighlandGames.Server.Repositories.Abstractions;
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

    public async Task<(byte[]? Data, string? ContentType)> GetImageAsync(string id)
    {
        var d = await db.Disciplines.Where(d => d.Id == id).Select(d => new { d.ImageData, d.ImageContentType }).FirstOrDefaultAsync();
        return d is null ? (null, null) : (d.ImageData, d.ImageContentType);
    }

    public async Task CreateAsync(Discipline discipline)
    {
        db.Disciplines.Add(discipline);
        await db.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var discipline = await db.Disciplines.FindAsync(id);
        if (discipline is null) return false;
        db.Disciplines.Remove(discipline);
        await db.SaveChangesAsync();
        return true;
    }
}
