using BankNext.QMS.Application.Interfaces;
using BankNext.QMS.Core.Entities;
using BankNext.QMS.Core.Enums;
using BankNext.QMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BankNext.QMS.Infrastructure.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly QmsDbContext _context;

    public TicketRepository(QmsDbContext context)
    {
        _context = context;
    }

    public async Task<Ticket?> GetByIdAsync(Guid id)
    {
        return await _context.Tickets.FindAsync(id);
    }

    public async Task<IEnumerable<Ticket>> GetAllAsync()
    {
        return await _context.Tickets.ToListAsync();
    }

    public async Task<Ticket> AddAsync(Ticket entity)
    {
        _context.Tickets.Add(entity);
        return entity;
    }

    public async Task UpdateAsync(Ticket entity)
    {
        _context.Tickets.Update(entity);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(Ticket entity)
    {
        _context.Tickets.Remove(entity);
        await Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Ticket>> GetByStatusAsync(TicketStatus status)
    {
        var allTickets = await _context.Tickets.ToListAsync();
        return allTickets.Where(t => t.Status == status);
    }

    public async Task<IEnumerable<Ticket>> GetByServiceTypeAsync(ServiceType serviceType)
    {
        var allTickets = await _context.Tickets.ToListAsync();
        return allTickets.Where(t => t.ServiceType == serviceType);
    }

    public async Task<int> GetTodayCountByServiceTypeAsync(ServiceType serviceType)
    {
        var today = DateTimeOffset.UtcNow.Date;
        var startOfDay = new DateTimeOffset(today, TimeSpan.Zero);
        var endOfDay = startOfDay.AddDays(1);

        var tickets = await _context.Tickets
            .Where(t => t.ServiceType == serviceType)
            .ToListAsync();

        return tickets.Count(t => t.CreatedTime >= startOfDay && t.CreatedTime < endOfDay);
    }

    public async Task<IEnumerable<Ticket>> GetWaitingTicketsAsync()
    {
        var allTickets = await _context.Tickets.ToListAsync();
        return allTickets.Where(t => t.Status == TicketStatus.WAITING);
    }

    public async Task<IEnumerable<Ticket>> GetTicketsAsync(DateTimeOffset? fromDate, DateTimeOffset? toDate, Guid? staffId, string? branchId)
    {
        var query = _context.Tickets.AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(t => t.CreatedTime >= fromDate.Value);
        
        if (toDate.HasValue)
            query = query.Where(t => t.CreatedTime <= toDate.Value);
            
        if (staffId.HasValue)
            query = query.Where(t => t.ServedByUserId == staffId.Value);

        if (!string.IsNullOrEmpty(branchId))
            query = query.Where(t => t.BranchId == branchId);

        return await query.ToListAsync();
    }
}
