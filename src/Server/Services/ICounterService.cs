using Shared.Models;

namespace Server.Services;

public interface ICounterService
{
    Task<Counter?> GetCounterByIdAsync(int counterId);
    Task<List<Counter>> GetCountersByBranchAsync(int branchId);
    Task<Counter?> FindAvailableCounterAsync(int branchId, int serviceTypeId);
    Task<bool> AssignTicketToCounterAsync(int ticketId, int branchId, int serviceTypeId);
    Task<Counter> CreateCounterAsync(Counter counter);
    Task<Counter> UpdateCounterAsync(Counter counter);
    Task<bool> DeleteCounterAsync(int counterId);
}

