using BankNext.QMS.Application.DTOs;
using BankNext.QMS.Application.Interfaces;
using BankNext.QMS.Core.Entities;
using BankNext.QMS.Core.Enums;

namespace BankNext.QMS.Application.Services;

public class TicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly ICounterRepository _counterRepository;
    private readonly INotificationService _notificationService;

    public TicketService(
        ITicketRepository ticketRepository,
        ICounterRepository counterRepository,
        INotificationService notificationService)
    {
        _ticketRepository = ticketRepository;
        _counterRepository = counterRepository;
        _notificationService = notificationService;
    }

    public async Task<CreateTicketResponse> CreateTicketAsync(CreateTicketRequest request)
    {
        // 1. Calculate Priority
        int priority = CalculatePriority(request.CustomerSegment, request.ServiceType);

        // 2. Generate Number
        var count = await _ticketRepository.GetTodayCountByServiceTypeAsync(request.ServiceType);
        var prefix = request.ServiceType.ToString().Substring(0, 1);
        var number = $"{prefix}{(count + 1):D3}";

        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            Number = number,
            ServiceType = request.ServiceType,
            Status = TicketStatus.WAITING,
            CreatedTime = DateTimeOffset.UtcNow,
            PriorityScore = priority,
            CustomerName = request.CustomerName,
            CustomerSegment = request.CustomerSegment,
            CustomerId = request.CustomerId,
            BranchId = request.BranchId,
            RecallCount = 0
        };

        await _ticketRepository.AddAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        await _notificationService.NotifyTicketCreatedAsync(ticket);

        return MapToCreateResponse(ticket);
    }

    public async Task<TicketDto?> CallTicketAsync(Guid ticketId, CallTicketRequest request)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null) return null;

        var counter = await _counterRepository.GetByIdAsync(request.CounterId);
        if (counter == null) return null;

        ticket.Status = TicketStatus.CALLED;
        ticket.CalledTime = DateTimeOffset.UtcNow;
        ticket.CounterId = request.CounterId;
        ticket.ServedByUserId = counter.AssignedUserId;
        ticket.RecallCount = 0;

        counter.CurrentTicketId = ticket.Id;

        await _ticketRepository.UpdateAsync(ticket);
        await _counterRepository.UpdateAsync(counter);
        await _ticketRepository.SaveChangesAsync();

        await _notificationService.NotifyTicketCalledAsync(ticket);
        await _notificationService.NotifyCounterUpdatedAsync(counter);

        return MapToDto(ticket);
    }

    public async Task<TicketDto?> CompleteTicketAsync(Guid ticketId)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null) return null;

        ticket.Status = TicketStatus.COMPLETED;
        ticket.CompletedTime = DateTimeOffset.UtcNow;

        await _ticketRepository.UpdateAsync(ticket);

        // Clear counter's current ticket
        if (ticket.CounterId.HasValue)
        {
            var counter = await _counterRepository.GetByIdAsync(ticket.CounterId.Value);
            if (counter != null && counter.CurrentTicketId == ticketId)
            {
                counter.CurrentTicketId = null;
                await _counterRepository.UpdateAsync(counter);
                await _notificationService.NotifyCounterUpdatedAsync(counter);
            }
        }

        await _ticketRepository.SaveChangesAsync();
        await _notificationService.NotifyTicketUpdatedAsync(ticket);

        return MapToDto(ticket);
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsAsync(
        TicketStatus? status, 
        ServiceType? serviceType,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null,
        Guid? staffId = null,
        string? branchId = null)
    {
        IEnumerable<Ticket> tickets;

        if (fromDate.HasValue || toDate.HasValue || staffId.HasValue || branchId != null)
        {
            // Adjust toDate to end of day if it's provided (to include the full day)
            var queryToDate = toDate;
            if (queryToDate.HasValue && queryToDate.Value.TimeOfDay == TimeSpan.Zero)
            {
                queryToDate = queryToDate.Value.AddDays(1).AddTicks(-1);
            }

            tickets = await _ticketRepository.GetTicketsAsync(fromDate, queryToDate, staffId, branchId);
            
            // Apply remaining in-memory filters if mixed (though repo handles most)
            if (status.HasValue) tickets = tickets.Where(t => t.Status == status.Value);
            if (serviceType.HasValue) tickets = tickets.Where(t => t.ServiceType == serviceType.Value);
        }
        else if (status.HasValue && serviceType.HasValue)
        {
            var byStatus = await _ticketRepository.GetByStatusAsync(status.Value);
            tickets = byStatus.Where(t => t.ServiceType == serviceType.Value);
        }
        else if (status.HasValue)
        {
            tickets = await _ticketRepository.GetByStatusAsync(status.Value);
        }
        else if (serviceType.HasValue)
        {
            tickets = await _ticketRepository.GetByServiceTypeAsync(serviceType.Value);
        }
        else
        {
            tickets = await _ticketRepository.GetAllAsync();
        }

        return tickets
            .OrderByDescending(t => t.PriorityScore)
            .ThenBy(t => t.CreatedTime)
            .Select(MapToDto);
    }

    private int CalculatePriority(CustomerSegment segment, ServiceType serviceType)
    {
        int priority = 0;
        if (segment == CustomerSegment.DIAMOND) priority += 1000;
        if (segment == CustomerSegment.GOLD) priority += 500;
        if (serviceType == ServiceType.VIP) priority += 200;
        return priority;
    }

    private CreateTicketResponse MapToCreateResponse(Ticket ticket)
    {
        return new CreateTicketResponse
        {
            Id = ticket.Id,
            Number = ticket.Number,
            ServiceType = ticket.ServiceType,
            Status = ticket.Status,
            CreatedTime = ticket.CreatedTime,
            PriorityScore = ticket.PriorityScore,
            CustomerName = ticket.CustomerName,
            CustomerSegment = ticket.CustomerSegment,
            CustomerId = ticket.CustomerId,
            BranchId = ticket.BranchId
        };
    }

    private TicketDto MapToDto(Ticket ticket)
    {
        return new TicketDto
        {
            Id = ticket.Id,
            Number = ticket.Number,
            ServiceType = ticket.ServiceType,
            Status = ticket.Status,
            CreatedTime = ticket.CreatedTime,
            CalledTime = ticket.CalledTime,
            CompletedTime = ticket.CompletedTime,
            PriorityScore = ticket.PriorityScore,
            CustomerName = ticket.CustomerName,
            CustomerSegment = ticket.CustomerSegment,
            CustomerId = ticket.CustomerId,
            CounterId = ticket.CounterId,
            RecallCount = ticket.RecallCount,
            BranchId = ticket.BranchId
        };
    }
}
