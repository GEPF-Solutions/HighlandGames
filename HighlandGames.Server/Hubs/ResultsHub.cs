using Microsoft.AspNetCore.SignalR;

namespace HighlandGames.Server.Hubs;

public class ResultsHub : Hub
{
    public async Task JoinLeaderboard(string gender)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"leaderboard-{gender}");
    }

    public async Task JoinDiscipline(string disciplineId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"discipline-{disciplineId}");
    }

    public async Task JoinMatchesGroup(string disciplineId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"matches-{disciplineId}");
    }

    public async Task LeaveMatchesGroup(string disciplineId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"matches-{disciplineId}");
    }
}
