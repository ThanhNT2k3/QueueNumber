using Microsoft.EntityFrameworkCore;
using Server.Data;
using Shared.Models;

namespace Server.Services;

public class TicketService : ITicketService
{
    public async Task<bool> MoveTicketToEndAsync(int ticketId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null)
            return false;

        // Nếu ticket đang phục vụ thì chuyển về Waiting
        if (ticket.Status == TicketStatus.Serving)
        {
            ticket.Status = TicketStatus.Waiting;
        }
        else if (ticket.Status != TicketStatus.Waiting)
        {
            return false;
        }
        ticket.CreatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        // Optionally notify via SignalR
        if (_hubService != null)
        {
            await _hubService.NotifyTicketSkippedAsync(ticket);
        }
        return true;
    }
    public async Task<int> GetTicketsCreatedTodayAsync(int branchId, DateTime date)
    {
        return await _context.Tickets
            .Where(t => t.BranchId == branchId && t.CreatedAt.Date == date)
            .CountAsync();
    }

    public async Task<int> GetTicketsCompletedTodayAsync(int branchId, DateTime date)
    {
        return await _context.Tickets
            .Where(t => t.BranchId == branchId && t.Status == TicketStatus.Done && t.CompletedAt.HasValue && t.CompletedAt.Value.Date == date)
            .CountAsync();
    }
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TicketService> _logger;
    private readonly ITicketHubService? _hubService;

    public TicketService(
        ApplicationDbContext context, 
        ILogger<TicketService> logger,
        ITicketHubService? hubService = null)
    {
        _context = context;
        _logger = logger;
        _hubService = hubService;
    }

    public async Task<Ticket> CreateTicketAsync(int branchId, int serviceTypeId)
    {
        var date = DateTime.UtcNow.Date;
        var number = await GetNextTicketNumberAsync(branchId, serviceTypeId, date);

        var ticket = new Ticket
        {
            BranchId = branchId,
            ServiceTypeId = serviceTypeId,
            Number = number,
            CreatedAt = DateTime.UtcNow,
            Status = TicketStatus.Waiting
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        // Load navigation properties for SignalR notification
        await _context.Entry(ticket).Reference(t => t.Branch).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.ServiceType).LoadAsync();

        _logger.LogInformation("Created ticket {TicketId} with number {Number} for branch {BranchId}", 
            ticket.TicketId, ticket.DisplayNumber, branchId);

        if (_hubService != null)
        {
            await _hubService.NotifyTicketGeneratedAsync(ticket);
        }

        return ticket;
    }

    public async Task<Ticket?> GetTicketByIdAsync(int ticketId)
    {
        return await _context.Tickets
            .Include(t => t.Branch)
            .Include(t => t.ServiceType)
            .Include(t => t.AssignedCounter)
            .FirstOrDefaultAsync(t => t.TicketId == ticketId);
    }

    public async Task<List<Ticket>> GetWaitingTicketsAsync(int branchId)
    {
        return await _context.Tickets
            .Include(t => t.ServiceType)
            .Include(t => t.AssignedCounter)
            .Where(t => t.BranchId == branchId && t.Status == TicketStatus.Waiting)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Ticket?> GetServingTicketAsync(int counterId)
    {
        return await _context.Tickets
            .Include(t => t.ServiceType)
            .Include(t => t.AssignedCounter)
            .Include(t => t.Branch)
            .FirstOrDefaultAsync(t => t.AssignedCounterId == counterId && t.Status == TicketStatus.Serving);
    }

    public async Task<List<Ticket>> GetServingTicketsAsync(int branchId)
    {
        return await _context.Tickets
            .Include(t => t.ServiceType)
            .Include(t => t.AssignedCounter)
            .Include(t => t.Branch)
            .Where(t => t.BranchId == branchId && t.Status == TicketStatus.Serving)
            .OrderBy(t => t.CalledAt)
            .ToListAsync();
    }

    public async Task<bool> AssignTicketAsync(int ticketId, int counterId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null || ticket.Status != TicketStatus.Waiting)
            return false;

        var counter = await _context.Counters.FindAsync(counterId);
        if (counter == null || !counter.IsActive)
            return false;

        ticket.AssignedCounterId = counterId;
        await _context.SaveChangesAsync();

        // Load navigation properties for SignalR notification
        await _context.Entry(ticket).Reference(t => t.Branch).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.ServiceType).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.AssignedCounter).LoadAsync();

        _logger.LogInformation("Assigned ticket {TicketId} to counter {CounterId}", ticketId, counterId);
        
        if (_hubService != null)
        {
            await _hubService.NotifyTicketAssignedAsync(ticket);
        }
        
        return true;
    }

    public async Task<bool> CallTicketAsync(int ticketId, int counterId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null)
            return false;
        
        // If ticket is not assigned, assign it first
        if (!ticket.AssignedCounterId.HasValue || ticket.AssignedCounterId != counterId)
        {
            ticket.AssignedCounterId = counterId;
        }

        // Validate that the ticket is being called for the correct counter
        if (ticket.AssignedCounterId != counterId)
        {
            _logger.LogWarning("Attempt to call ticket {TicketId} for counter {CounterId} failed due to mismatch", ticketId, counterId);
            return false;
        }

        ticket.Status = TicketStatus.Serving;
        ticket.CalledAt = DateTime.UtcNow;

        var counter = await _context.Counters.FindAsync(counterId);
        if (counter != null)
        {
            counter.IsBusy = true;
        }

        await _context.SaveChangesAsync();

        // Load navigation properties for SignalR notification
        await _context.Entry(ticket).Reference(t => t.Branch).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.ServiceType).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.AssignedCounter).LoadAsync();

        _logger.LogInformation("Called ticket {TicketId} at counter {CounterId}", ticketId, counterId);
        
        if (_hubService != null)
        {
            await _hubService.NotifyTicketCalledAsync(ticket);
        }
        
        return true;
    }

    public async Task<bool> CompleteTicketAsync(int ticketId, string? result = null)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null || ticket.Status != TicketStatus.Serving)
            return false;

        ticket.Status = TicketStatus.Done;
        ticket.CompletedAt = DateTime.UtcNow;
        ticket.Result = result;

        if (ticket.AssignedCounterId.HasValue)
        {
            var counter = await _context.Counters.FindAsync(ticket.AssignedCounterId.Value);
            if (counter != null)
            {
                counter.IsBusy = false;
            }
        }

        await _context.SaveChangesAsync();

        // Load navigation properties for SignalR notification
        await _context.Entry(ticket).Reference(t => t.Branch).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.ServiceType).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.AssignedCounter).LoadAsync();

        _logger.LogInformation("Completed ticket {TicketId}", ticketId);
        
        if (_hubService != null)
        {
            await _hubService.NotifyTicketCompletedAsync(ticket);
        }
        
        return true;
    }

    public async Task<bool> SkipTicketAsync(int ticketId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null)
            return false;

        ticket.Status = TicketStatus.Skipped;

        if (ticket.AssignedCounterId.HasValue)
        {
            var counter = await _context.Counters.FindAsync(ticket.AssignedCounterId.Value);
            if (counter != null)
            {
                counter.IsBusy = false;
            }
        }

        await _context.SaveChangesAsync();

        // Load navigation properties for SignalR notification
        await _context.Entry(ticket).Reference(t => t.Branch).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.ServiceType).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.AssignedCounter).LoadAsync();

        _logger.LogInformation("Skipped ticket {TicketId}", ticketId);
        
        if (_hubService != null)
        {
            await _hubService.NotifyTicketSkippedAsync(ticket);
        }
        
        return true;
    }

    public async Task<bool> CancelTicketAsync(int ticketId, string? comment = null)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null)
            return false;
        ticket.Status = TicketStatus.Canceled;
        ticket.CancelComment = comment;
        if (ticket.AssignedCounterId.HasValue)
        {
            var counter = await _context.Counters.FindAsync(ticket.AssignedCounterId.Value);
            if (counter != null)
            {
                counter.IsBusy = false;
            }
        }
        await _context.SaveChangesAsync();
        await _context.Entry(ticket).Reference(t => t.Branch).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.ServiceType).LoadAsync();
        await _context.Entry(ticket).Reference(t => t.AssignedCounter).LoadAsync();
        _logger.LogInformation("Canceled ticket {TicketId}", ticketId);
        if (_hubService != null)
        {
            await _hubService.NotifyTicketSkippedAsync(ticket); // Or create NotifyTicketCanceledAsync
        }
        return true;
    }

    public async Task<int> GetNextTicketNumberAsync(int branchId, int serviceTypeId, DateTime date)
    {
        var lastTicket = await _context.Tickets
            .Where(t => t.BranchId == branchId 
                     && t.ServiceTypeId == serviceTypeId 
                     && t.CreatedAt.Date == date)
            .OrderByDescending(t => t.Number)
            .FirstOrDefaultAsync();

        return lastTicket?.Number + 1 ?? 1;
    }
}

