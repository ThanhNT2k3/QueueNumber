using BankNext.QMS.Core.Entities;

namespace BankNext.QMS.Application.Interfaces;

public interface ITicketRepository : IRepository<Ticket>
{
    Task<IEnumerable<Ticket>> GetByStatusAsync(Core.Enums.TicketStatus status);
    Task<IEnumerable<Ticket>> GetByServiceTypeAsync(Core.Enums.ServiceType serviceType);
    Task<int> GetTodayCountByServiceTypeAsync(Core.Enums.ServiceType serviceType);
    Task<IEnumerable<Ticket>> GetWaitingTicketsAsync();
}
