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
public class CountersController : ControllerBase
{
    private readonly QmsDbContext _context;
    private readonly IHubContext<QmsHub> _hubContext;

    public CountersController(QmsDbContext context, IHubContext<QmsHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Counter>>> GetCounters()
    {
        return await _context.Counters.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Counter>> CreateCounter([FromBody] CreateCounterRequest request)
    {
        var counter = new Counter
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Status = CounterStatus.OFFLINE,
            ServiceTags = string.Join(",", request.ServiceTags),
            BranchId = request.BranchId
        };

        _context.Counters.Add(counter);
        await _context.SaveChangesAsync();
        
        await _hubContext.Clients.All.SendAsync("CounterUpdated", counter);

        return CreatedAtAction(nameof(GetCounters), new { id = counter.Id }, counter);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateCounterStatusRequest request)
    {
        var counter = await _context.Counters.FindAsync(id);
        if (counter == null) return NotFound();

        counter.Status = request.Status;
        await _context.SaveChangesAsync();
        
        await _hubContext.Clients.All.SendAsync("CounterUpdated", counter);

        return Ok(counter);
    }
    [HttpGet("branch/{branchId}")]
    public async Task<ActionResult<IEnumerable<Counter>>> GetCountersByBranch(string branchId)
    {
        return await _context.Counters
            .Where(c => c.BranchId == branchId)
            .ToListAsync();
    }

    [HttpPut("{id}/assign-staff")]
    public async Task<IActionResult> AssignUser(Guid id, [FromBody] AssignUserRequest request)
    {
        var counter = await _context.Counters.FindAsync(id);
        if (counter == null) return NotFound();

        // Get previous assignment info for audit
        var previousUserId = counter.AssignedUserId;
        User? previousUser = null;
        if (previousUserId.HasValue)
        {
            previousUser = await _context.Users.FindAsync(previousUserId.Value);
        }

        // Verify user exists and belongs to the same branch (optional but good practice)
        User? newUser = null;
        if (request.UserId.HasValue)
        {
            newUser = await _context.Users.FindAsync(request.UserId.Value);
            if (newUser == null) return BadRequest("User not found");
            
            // If counter has a branch, ensure user is in the same branch
            if (!string.IsNullOrEmpty(counter.BranchId) && newUser.BranchId != counter.BranchId)
            {
                return BadRequest("User does not belong to the counter's branch");
            }
        }

        // If assigning to this counter, unassign from others? 
        // For now, let's assume one user can only be at one counter.
        if (request.UserId.HasValue)
        {
            var existingAssignment = await _context.Counters
                .FirstOrDefaultAsync(c => c.AssignedUserId == request.UserId.Value && c.Id != id);
            
            if (existingAssignment != null)
            {
                existingAssignment.AssignedUserId = null;
                // Notify about the other counter update
                await _hubContext.Clients.All.SendAsync("CounterUpdated", existingAssignment);
            }
        }

        counter.AssignedUserId = request.UserId;
        await _context.SaveChangesAsync();

        // Log audit history
        var action = previousUserId.HasValue && request.UserId.HasValue ? "REASSIGNED" 
                   : request.UserId.HasValue ? "ASSIGNED" 
                   : "UNASSIGNED";

        var auditLog = new CounterAssignmentHistory
        {
            Id = Guid.NewGuid(),
            CounterId = counter.Id,
            CounterName = counter.Name,
            UserId = request.UserId,
            UserName = newUser?.FullName,
            UserEmail = newUser?.Email,
            PreviousUserId = previousUserId,
            PreviousUserName = previousUser?.FullName,
            Action = action,
            BranchId = counter.BranchId,
            PerformedByUserId = request.PerformedByUserId, // From request
            PerformedByUserName = request.PerformedByUserName,
            Timestamp = DateTimeOffset.UtcNow,
            Reason = request.Reason,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
        };

        _context.CounterAssignmentHistories.Add(auditLog);
        await _context.SaveChangesAsync();
        
        await _hubContext.Clients.All.SendAsync("CounterUpdated", counter);

        return Ok(counter);
    }
}

public class AssignUserRequest
{
    public Guid? UserId { get; set; }
    public Guid? PerformedByUserId { get; set; }
    public string? PerformedByUserName { get; set; }
    public string? Reason { get; set; }
}

public class CreateCounterRequest
{
    public string Name { get; set; } = string.Empty;
    public List<ServiceType> ServiceTags { get; set; } = new();
    public string? BranchId { get; set; }
}

public class UpdateCounterStatusRequest
{
    public CounterStatus Status { get; set; }
}
