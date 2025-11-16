using Shared.Models;

namespace Server.Services;

public interface ITicketService
{
    Task<bool> MoveTicketToEndAsync(int ticketId);
    Task<Ticket> CreateTicketAsync(int branchId, int serviceTypeId);
    Task<Ticket?> GetTicketByIdAsync(int ticketId);
    Task<List<Ticket>> GetWaitingTicketsAsync(int branchId);
    Task<Ticket?> GetServingTicketAsync(int counterId);
    Task<List<Ticket>> GetServingTicketsAsync(int branchId);
    Task<bool> AssignTicketAsync(int ticketId, int counterId);
    Task<bool> CallTicketAsync(int ticketId, int counterId);
    Task<bool> CompleteTicketAsync(int ticketId, string? result = null);
    Task<bool> SkipTicketAsync(int ticketId);
    Task<bool> CancelTicketAsync(int ticketId, string? comment = null);
    Task<int> GetNextTicketNumberAsync(int branchId, int serviceTypeId, DateTime date);
    Task<int> GetTicketsCreatedTodayAsync(int branchId, DateTime date);
    Task<int> GetTicketsCompletedTodayAsync(int branchId, DateTime date);
}

