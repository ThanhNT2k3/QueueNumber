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
            RecallCount = 0,
            BranchId = request.BranchId
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        // 4. Find Best Counter (Smart Assignment)
        var bestCounter = await FindBestCounter(request.ServiceType, request.BranchId);

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

    private async Task<Counter?> FindBestCounter(ServiceType serviceType, string? branchId)
    {
        // Get all online counters that can handle this service
        var allCounters = await _context.Counters.ToListAsync();
        var eligibleCounters = allCounters
            .Where(c => c.Status == CounterStatus.ONLINE)
            .Where(c => string.IsNullOrEmpty(branchId) || c.BranchId == branchId) // Filter by Branch
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

    // POST: api/queue/tickets/{id}/move-to-end
    [HttpPost("tickets/{id}/move-to-end")]
    public async Task<IActionResult> MoveToEnd(Guid id, [FromBody] MoveToEndRequest request)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound();

        if (ticket.Status != TicketStatus.WAITING && ticket.Status != TicketStatus.CALLED)
        {
            return BadRequest(new { message = "Only waiting or called tickets can be moved to end" });
        }

        // Reset ticket to waiting and update priority to move to end
        ticket.Status = TicketStatus.WAITING;
        ticket.CounterId = null;
        ticket.CalledTime = null;
        ticket.MovedToEndCount++;
        ticket.LastMovedToEndTime = DateTimeOffset.UtcNow;
        
        // Add remark about moving to end
        var moveRemark = $"[{DateTimeOffset.UtcNow:yyyy-MM-dd HH:mm}] Moved to end - {request.Reason}";
        ticket.Remarks = string.IsNullOrEmpty(ticket.Remarks) 
            ? moveRemark 
            : $"{ticket.Remarks}\n{moveRemark}";

        // Decrease priority significantly to move to end
        ticket.PriorityScore = Math.Max(0, ticket.PriorityScore - 1000);

        await _context.SaveChangesAsync();
        await _hubContext.Clients.All.SendAsync("TicketUpdated", ticket);

        return Ok(ticket);
    }

    // PATCH: api/queue/tickets/{id}/remarks
    [HttpPatch("tickets/{id}/remarks")]
    public async Task<IActionResult> UpdateRemarks(Guid id, [FromBody] UpdateRemarksRequest request)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound();

        var newRemark = $"[{DateTimeOffset.UtcNow:yyyy-MM-dd HH:mm}] {request.Remark}";
        ticket.Remarks = string.IsNullOrEmpty(ticket.Remarks) 
            ? newRemark 
            : $"{ticket.Remarks}\n{newRemark}";

        await _context.SaveChangesAsync();
        await _hubContext.Clients.All.SendAsync("TicketUpdated", ticket);

        return Ok(ticket);
    }

    // PATCH: api/queue/tickets/{id}/customer-info
    [HttpPatch("tickets/{id}/customer-info")]
    public async Task<IActionResult> UpdateCustomerInfo(Guid id, [FromBody] UpdateCustomerInfoRequest request)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound();

        // Update customer contact information
        ticket.CustomerPhone = request.Phone;
        ticket.CustomerEmail = request.Email;
        ticket.CustomerNote = request.Note;

        await _context.SaveChangesAsync();
        await _hubContext.Clients.All.SendAsync("TicketUpdated", ticket);

        return Ok(ticket);
    }
}

public class AutoAssignRequest
{
    public ServiceType ServiceType { get; set; }
    public string? CustomerName { get; set; }
    public CustomerSegment CustomerSegment { get; set; }
    public string? CustomerId { get; set; }
    public string? BranchId { get; set; }
}

public class AutoAssignResult
{
    public Ticket Ticket { get; set; } = null!;
    public string? SuggestedCounter { get; set; }
    public int? EstimatedQueuePosition { get; set; }
    public int? EstimatedWaitTimeMinutes { get; set; }
}

public class MoveToEndRequest
{
    public string Reason { get; set; } = "Customer not present";
}

public class UpdateRemarksRequest
{
    public string Remark { get; set; } = string.Empty;
}

public class UpdateCustomerInfoRequest
{
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Note { get; set; }
}
