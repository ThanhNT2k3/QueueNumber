using BankNext.QMS.Api.Hubs;
using BankNext.QMS.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace BankNext.QMS.Api.Services;

public class SignalRNotificationService : INotificationService
{
    private readonly IHubContext<QmsHub> _hubContext;

    public SignalRNotificationService(IHubContext<QmsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyTicketCreatedAsync(object ticket)
    {
        await _hubContext.Clients.All.SendAsync("TicketCreated", ticket);
    }

    public async Task NotifyTicketCalledAsync(object ticket)
    {
        await _hubContext.Clients.All.SendAsync("TicketCalled", ticket);
    }

    public async Task NotifyTicketUpdatedAsync(object ticket)
    {
        await _hubContext.Clients.All.SendAsync("TicketUpdated", ticket);
    }

    public async Task NotifyCounterUpdatedAsync(object counter)
    {
        await _hubContext.Clients.All.SendAsync("CounterUpdated", counter);
    }
}
