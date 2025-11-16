using Microsoft.AspNetCore.SignalR;
using Server.Hubs;
using Shared.Models;

namespace Server.Services;

public class TicketHubService : ITicketHubService
{
    private readonly IHubContext<TicketHub> _hubContext;
    private readonly ILogger<TicketHubService> _logger;

    public TicketHubService(IHubContext<TicketHub> hubContext, ILogger<TicketHubService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyTicketGeneratedAsync(Ticket ticket)
    {
        await _hubContext.Clients.Group($"branch_{ticket.BranchId}").SendAsync("ticketGenerated", ticket);
        _logger.LogDebug("Notified branch {BranchId} about new ticket {TicketId}", ticket.BranchId, ticket.TicketId);
    }

    public async Task NotifyTicketAssignedAsync(Ticket ticket)
    {
        if (ticket.AssignedCounterId.HasValue)
        {
            await _hubContext.Clients.Group($"counter_{ticket.AssignedCounterId.Value}").SendAsync("ticketAssigned", ticket);
        }
        await _hubContext.Clients.Group($"branch_{ticket.BranchId}").SendAsync("ticketAssigned", ticket);
        _logger.LogDebug("Notified about ticket {TicketId} assignment", ticket.TicketId);
    }

    public async Task NotifyTicketCalledAsync(Ticket ticket)
    {
        await _hubContext.Clients.Group($"branch_{ticket.BranchId}").SendAsync("ticketCalled", ticket);
        if (ticket.AssignedCounterId.HasValue)
        {
            await _hubContext.Clients.Group($"counter_{ticket.AssignedCounterId.Value}").SendAsync("ticketCalled", ticket);
        }
        _logger.LogDebug("Notified about ticket {TicketId} being called", ticket.TicketId);
    }

    public async Task NotifyTicketCompletedAsync(Ticket ticket)
    {
        await _hubContext.Clients.Group($"branch_{ticket.BranchId}").SendAsync("ticketCompleted", ticket);
        if (ticket.AssignedCounterId.HasValue)
        {
            await _hubContext.Clients.Group($"counter_{ticket.AssignedCounterId.Value}").SendAsync("ticketCompleted", ticket);
        }
        _logger.LogDebug("Notified about ticket {TicketId} completion", ticket.TicketId);
    }

    public async Task NotifyTicketSkippedAsync(Ticket ticket)
    {
        await _hubContext.Clients.Group($"branch_{ticket.BranchId}").SendAsync("ticketSkipped", ticket);
        if (ticket.AssignedCounterId.HasValue)
        {
            await _hubContext.Clients.Group($"counter_{ticket.AssignedCounterId.Value}").SendAsync("ticketSkipped", ticket);
        }
        _logger.LogDebug("Notified about ticket {TicketId} being skipped", ticket.TicketId);
    }
}

