using Microsoft.AspNetCore.SignalR;
using Server.Hubs;
using Shared.Models;

namespace Server.Services;

public interface ITicketHubService
{
    Task NotifyTicketGeneratedAsync(Ticket ticket);
    Task NotifyTicketAssignedAsync(Ticket ticket);
    Task NotifyTicketCalledAsync(Ticket ticket);
    Task NotifyTicketCompletedAsync(Ticket ticket);
    Task NotifyTicketSkippedAsync(Ticket ticket);
}

