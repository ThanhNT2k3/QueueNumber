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
            ServiceTags = string.Join(",", request.ServiceTags)
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
}

public class CreateCounterRequest
{
    public string Name { get; set; } = string.Empty;
    public List<ServiceType> ServiceTags { get; set; } = new();
}

public class UpdateCounterStatusRequest
{
    public CounterStatus Status { get; set; }
}
