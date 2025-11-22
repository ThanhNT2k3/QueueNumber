using BankNext.QMS.Application.Interfaces;
using BankNext.QMS.Core.Entities;
using BankNext.QMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BankNext.QMS.Infrastructure.Repositories;

public class CounterRepository : ICounterRepository
{
    private readonly QmsDbContext _context;

    public CounterRepository(QmsDbContext context)
    {
        _context = context;
    }

    public async Task<Counter?> GetByIdAsync(Guid id)
    {
        return await _context.Counters.FindAsync(id);
    }

    public async Task<IEnumerable<Counter>> GetAllAsync()
    {
        return await _context.Counters.ToListAsync();
    }

    public async Task<Counter> AddAsync(Counter entity)
    {
        _context.Counters.Add(entity);
        return entity;
    }

    public async Task UpdateAsync(Counter entity)
    {
        _context.Counters.Update(entity);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(Counter entity)
    {
        _context.Counters.Remove(entity);
        await Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task<Counter?> GetByAssignedUserIdAsync(Guid userId)
    {
        return await _context.Counters.FirstOrDefaultAsync(c => c.AssignedUserId == userId);
    }

    public async Task<IEnumerable<Counter>> GetAvailableCountersAsync()
    {
        var allCounters = await _context.Counters.ToListAsync();
        return allCounters.Where(c => c.Status == Core.Enums.CounterStatus.ONLINE);
    }
}
