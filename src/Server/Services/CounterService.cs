using Microsoft.EntityFrameworkCore;
using Server.Data;
using Shared.Models;

namespace Server.Services;

public class CounterService : ICounterService
{
    private readonly ApplicationDbContext _context;
    private readonly ITicketService _ticketService;
    private readonly ILogger<CounterService> _logger;

    public CounterService(
        ApplicationDbContext context,
        ITicketService ticketService,
        ILogger<CounterService> logger)
    {
        _context = context;
        _ticketService = ticketService;
        _logger = logger;
    }

    public async Task<Counter?> GetCounterByIdAsync(int counterId)
    {
        return await _context.Counters
            .Include(c => c.Branch)
            .Include(c => c.SupportedServices)
            .FirstOrDefaultAsync(c => c.CounterId == counterId);
    }

    public async Task<List<Counter>> GetCountersByBranchAsync(int branchId)
    {
        return await _context.Counters
            .Include(c => c.SupportedServices)
            .Where(c => c.BranchId == branchId && c.IsActive)
            .ToListAsync();
    }

    public async Task<Counter?> FindAvailableCounterAsync(int branchId, int serviceTypeId)
    {
        // Find counters that support this service type and are not busy
        var availableCounter = await _context.Counters
            .Include(c => c.SupportedServices)
            .Where(c => c.BranchId == branchId 
                     && c.IsActive 
                     && !c.IsBusy
                     && c.SupportedServices.Any(s => s.ServiceTypeId == serviceTypeId))
            .Select(c => new
            {
                Counter = c,
                ActiveTicketCount = _context.Tickets.Count(t => t.AssignedCounterId == c.CounterId 
                    && (t.Status == TicketStatus.Waiting || t.Status == TicketStatus.Serving))
            })
            .OrderBy(x => x.ActiveTicketCount)
            .Select(x => x.Counter)
            .FirstOrDefaultAsync();

        // If no counter is available, find any counter that supports the service (even if busy)
        if (availableCounter == null)
        {
            availableCounter = await _context.Counters
                .Include(c => c.SupportedServices)
                .Where(c => c.BranchId == branchId 
                         && c.IsActive
                         && c.SupportedServices.Any(s => s.ServiceTypeId == serviceTypeId))
                .Select(c => new
                {
                    Counter = c,
                    ActiveTicketCount = _context.Tickets.Count(t => t.AssignedCounterId == c.CounterId 
                        && (t.Status == TicketStatus.Waiting || t.Status == TicketStatus.Serving))
                })
                .OrderBy(x => x.ActiveTicketCount)
                .Select(x => x.Counter)
                .FirstOrDefaultAsync();
        }

        return availableCounter;
    }

    public async Task<bool> AssignTicketToCounterAsync(int ticketId, int branchId, int serviceTypeId)
    {
        var counter = await FindAvailableCounterAsync(branchId, serviceTypeId);
        if (counter == null)
        {
            _logger.LogWarning("No available counter found for branch {BranchId} and service {ServiceTypeId}", 
                branchId, serviceTypeId);
            return false;
        }

        return await _ticketService.AssignTicketAsync(ticketId, counter.CounterId);
    }

    public async Task<Counter> CreateCounterAsync(Counter counter)
    {
        _context.Counters.Add(counter);
        await _context.SaveChangesAsync();
        return counter;
    }

    public async Task<Counter> UpdateCounterAsync(Counter counter)
    {
        _context.Counters.Update(counter);
        await _context.SaveChangesAsync();
        return counter;
    }

    public async Task<bool> DeleteCounterAsync(int counterId)
    {
        var counter = await _context.Counters
            .Include(c => c.Tickets)
            .FirstOrDefaultAsync(c => c.CounterId == counterId);
        
        if (counter == null) return false;
        
        if (counter.Tickets.Any(t => t.Status == TicketStatus.Waiting || t.Status == TicketStatus.Serving))
        {
            return false; // Cannot delete counter with active tickets
        }
        
        _context.Counters.Remove(counter);
        await _context.SaveChangesAsync();
        return true;
    }
}

