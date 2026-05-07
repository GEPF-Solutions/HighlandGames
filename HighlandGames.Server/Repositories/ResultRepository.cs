using HighlandGames.Server.Data;
using HighlandGames.Server.Models;
using HighlandGames.Server.Repositories.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace HighlandGames.Server.Repositories
{
    public class ResultRepository(AppDbContext db) : IResultRepository
    {
        public async Task<IEnumerable<Result>> GetAllAsync()
        {
            return await db.Results.Include(r => r.Team).ToListAsync();
        }

        public async Task<IEnumerable<Result>> GetByDisciplineAsync(string disciplineId)
        {
            return await db.Results.Include(r => r.Team).Where(r => r.DisciplineId == disciplineId).ToListAsync();
        }

        public async Task<IEnumerable<Result>> GetByTeamAsync(Guid teamId)
        {
            return await db.Results.Where(r => r.TeamId == teamId).ToListAsync();
        }

        public async Task<Result?> GetByTeamAndDisciplineAsync(Guid teamId, string disciplineId)
        {
            return await db.Results.FirstOrDefaultAsync(r => r.TeamId == teamId && r.DisciplineId == disciplineId);
        }

        public async Task<Result> UpsertAsync(Result result)
        {
            var existing = await GetByTeamAndDisciplineAsync(result.TeamId, result.DisciplineId);

            if (existing is null)
            {
                db.Results.Add(result);
            }
            else
            {
                existing.Points = result.Points;
                existing.RawValue = result.RawValue;
            }

            await db.SaveChangesAsync();
            return existing ?? result;
        }

        public async Task DeleteAsync(Result result)
        {
            db.Results.Remove(result);
            await db.SaveChangesAsync();
        }
    }
}
