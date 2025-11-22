using BankNext.QMS.Api.Hubs;
using BankNext.QMS.Core.Entities;
using BankNext.QMS.Core.Enums;
using BankNext.QMS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BankNext.QMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QueueController : ControllerBase
{
    private readonly QmsDbContext _context;
    private readonly IHubContext<QmsHub> _hubContext;

    public QueueController(QmsDbContext context, IHubContext<QmsHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost("auto-assign")]
    public async Task<ActionResult<AutoAssignResult>> AutoAssignTicket([FromBody] AutoAssignRequest request)
    {
        // 1. Calculate Priority
        int priority = 0;
        if (request.CustomerSegment == CustomerSegment.DIAMOND) priority += 1000;
        if (request.CustomerSegment == CustomerSegment.GOLD) priority += 500;
        if (request.ServiceType == ServiceType.VIP) priority += 200;

        // 2. Generate Number
        var today = DateTimeOffset.UtcNow.Date;
        var startOfDay = new DateTimeOffset(today, TimeSpan.Zero);
        var endOfDay = startOfDay.AddDays(1);
        
        var tickets = await _context.Tickets
            .Where(t => t.ServiceType == request.ServiceType)
            .ToListAsync();
            
        var count = tickets.Count(t => t.CreatedTime >= startOfDay && t.CreatedTime < endOfDay);
        var prefix = request.ServiceType.ToString().Substring(0, 1);
        var number = $"{prefix}{(count + 1):D3}";

        // 3. Create Ticket
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
            RecallCount = 0
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        // 4. Find Best Counter (Smart Assignment)
        var bestCounter = await FindBestCounter(request.ServiceType);

        string? assignedCounterName = null;
        int? queuePosition = null;

        if (bestCounter != null)
        {
            assignedCounterName = bestCounter.Name;
            
            // Calculate queue position for this counter
            var allTickets = await _context.Tickets.ToListAsync();
            var counterServiceTags = bestCounter.ServiceTags.Split(',').Select(s => Enum.Parse<ServiceType>(s)).ToList();
            
            queuePosition = allTickets
                .Where(t => t.Status == TicketStatus.WAITING && counterServiceTags.Contains(t.ServiceType))
                .OrderByDescending(t => t.PriorityScore)
                .ThenBy(t => t.CreatedTime)
                .ToList()
                .FindIndex(t => t.Id == ticket.Id) + 1;
        }

        // 5. Broadcast via SignalR
        await _hubContext.Clients.All.SendAsync("TicketCreated", ticket);

        return Ok(new AutoAssignResult
        {
            Ticket = ticket,
            SuggestedCounter = assignedCounterName,
            EstimatedQueuePosition = queuePosition,
            EstimatedWaitTimeMinutes = queuePosition.HasValue ? queuePosition.Value * 3 : null // Assume 3 min per ticket
        });
    }

    private async Task<Counter?> FindBestCounter(ServiceType serviceType)
    {
        // Get all online counters that can handle this service
        var allCounters = await _context.Counters.ToListAsync();
        var eligibleCounters = allCounters
            .Where(c => c.Status == CounterStatus.ONLINE)
            .Where(c => c.ServiceTags.Split(',').Any(tag => tag == serviceType.ToString()))
            .ToList();

        if (!eligibleCounters.Any()) return null;

        // Get all waiting tickets
        var waitingTickets = await _context.Tickets
            .Where(t => t.Status == TicketStatus.WAITING)
            .ToListAsync();

        // Calculate load for each counter
        var counterLoads = eligibleCounters.Select(counter =>
        {
            var counterServiceTags = counter.ServiceTags.Split(',').Select(s => Enum.Parse<ServiceType>(s)).ToList();
            var queueLength = waitingTickets.Count(t => counterServiceTags.Contains(t.ServiceType));
            var isSpecialized = counterServiceTags.Count <= 2; // Specialized counters have fewer services

            return new
            {
                Counter = counter,
                QueueLength = queueLength,
                IsSpecialized = isSpecialized,
                Score = queueLength - (isSpecialized ? 0.5 : 0) // Prefer specialized counters slightly
            };
        }).OrderBy(x => x.Score).ToList();

        return counterLoads.FirstOrDefault()?.Counter;
    }
}

public class AutoAssignRequest
{
    public ServiceType ServiceType { get; set; }
    public string? CustomerName { get; set; }
    public CustomerSegment CustomerSegment { get; set; }
    public string? CustomerId { get; set; }
}

public class AutoAssignResult
{
    public Ticket Ticket { get; set; } = null!;
    public string? SuggestedCounter { get; set; }
    public int? EstimatedQueuePosition { get; set; }
    public int? EstimatedWaitTimeMinutes { get; set; }
}
