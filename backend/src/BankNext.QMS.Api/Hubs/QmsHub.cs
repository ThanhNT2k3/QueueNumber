using BankNext.QMS.Core.Entities;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace BankNext.QMS.Api.Hubs;

public class QmsHub : Hub
{
    public async Task JoinGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task LeaveGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }
    
    // These methods are called by the server (Controllers), but we define them here as strongly typed if we used IClientProxy interface
    // For now we will use dynamic Clients.All or Clients.Group
}
