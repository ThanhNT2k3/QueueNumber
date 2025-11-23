using BankNext.QMS.Core.Entities;

namespace BankNext.QMS.Application.Interfaces;

public interface ICounterAssignmentHistoryRepository
{
    Task<CounterAssignmentHistory> AddAsync(CounterAssignmentHistory entity);
    Task<IEnumerable<CounterAssignmentHistory>> GetByCounterIdAsync(Guid counterId);
    Task<IEnumerable<CounterAssignmentHistory>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<CounterAssignmentHistory>> GetByBranchIdAsync(string branchId);
    Task<IEnumerable<CounterAssignmentHistory>> GetAllAsync(DateTimeOffset? fromDate = null, DateTimeOffset? toDate = null);
    Task<int> SaveChangesAsync();
}
