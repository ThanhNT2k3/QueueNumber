using BankNext.QMS.Application.Interfaces;
using BankNext.QMS.Core.Entities;
using BankNext.QMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BankNext.QMS.Infrastructure.Repositories;

public class CounterAssignmentHistoryRepository : ICounterAssignmentHistoryRepository
{
    private readonly QmsDbContext _context;

    public CounterAssignmentHistoryRepository(QmsDbContext context)
    {
        _context = context;
    }

    public async Task<CounterAssignmentHistory> AddAsync(CounterAssignmentHistory entity)
    {
        _context.CounterAssignmentHistories.Add(entity);
        return entity;
    }

    public async Task<IEnumerable<CounterAssignmentHistory>> GetByCounterIdAsync(Guid counterId)
    {
        var results = await _context.CounterAssignmentHistories
            .Where(h => h.CounterId == counterId)
            .ToListAsync();
        
        return results.OrderByDescending(h => h.Timestamp);
    }

    public async Task<IEnumerable<CounterAssignmentHistory>> GetByUserIdAsync(Guid userId)
    {
        var results = await _context.CounterAssignmentHistories
            .Where(h => h.UserId == userId || h.PreviousUserId == userId)
            .ToListAsync();
        
        return results.OrderByDescending(h => h.Timestamp);
    }

    public async Task<IEnumerable<CounterAssignmentHistory>> GetByBranchIdAsync(string branchId)
    {
        var results = await _context.CounterAssignmentHistories
            .Where(h => h.BranchId == branchId)
            .ToListAsync();
        
        return results.OrderByDescending(h => h.Timestamp);
    }

    public async Task<IEnumerable<CounterAssignmentHistory>> GetAllAsync(DateTimeOffset? fromDate = null, DateTimeOffset? toDate = null)
    {
        var query = _context.CounterAssignmentHistories.AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(h => h.Timestamp >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(h => h.Timestamp <= toDate.Value);

        var results = await query.ToListAsync();
        return results.OrderByDescending(h => h.Timestamp);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}
