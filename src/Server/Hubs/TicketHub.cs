using Microsoft.AspNetCore.SignalR;
using Shared.Models;

namespace Server.Hubs;

public class TicketHub : Hub
{
    public async Task JoinBranchGroup(int branchId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"branch_{branchId}");
    }

    public async Task LeaveBranchGroup(int branchId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"branch_{branchId}");
    }

    public async Task JoinCounterGroup(int counterId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"counter_{counterId}");
    }

    public async Task LeaveCounterGroup(int counterId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"counter_{counterId}");
    }

    public async Task NotifyCounterSpecificEvent(int counterId, string eventName, object payload)
    {
        await Clients.Group($"counter_{counterId}").SendAsync(eventName, payload);
    }
}

