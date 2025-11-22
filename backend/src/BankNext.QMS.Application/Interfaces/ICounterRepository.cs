using BankNext.QMS.Core.Entities;

namespace BankNext.QMS.Application.Interfaces;

public interface ICounterRepository : IRepository<Counter>
{
    Task<Counter?> GetByAssignedUserIdAsync(Guid userId);
    Task<IEnumerable<Counter>> GetAvailableCountersAsync();
}
