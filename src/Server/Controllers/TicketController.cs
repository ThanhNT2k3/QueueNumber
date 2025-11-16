using Microsoft.AspNetCore.Mvc;
using Server.Services;
using Shared.Models;

namespace Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly ICounterService _counterService;
    private readonly ILogger<TicketController> _logger;

    public TicketController(
        ITicketService ticketService,
        ICounterService counterService,
        ILogger<TicketController> logger)
    {
        _ticketService = ticketService;
        _counterService = counterService;
        _logger = logger;
    }

    [HttpPost("create")]
    public async Task<ActionResult<Ticket>> CreateTicket([FromBody] CreateTicketRequest request)
    {
        try
        {
            var ticket = await _ticketService.CreateTicketAsync(request.BranchId, request.ServiceTypeId);
            
            // Auto-assign to available counter
            await _counterService.AssignTicketToCounterAsync(ticket.TicketId, request.BranchId, request.ServiceTypeId);
            
            // Reload ticket with all navigation properties
            ticket = await _ticketService.GetTicketByIdAsync(ticket.TicketId);
            
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating ticket");
            return StatusCode(500, new { error = "Failed to create ticket" });
        }
    }

    [HttpPost("{ticketId}/assign")]
    public async Task<ActionResult> AssignTicket(int ticketId, [FromBody] AssignTicketRequest request)
    {
        try
        {
            var success = await _ticketService.AssignTicketAsync(ticketId, request.CounterId);
            if (!success)
            {
                return BadRequest(new { error = "Failed to assign ticket" });
            }

            var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning ticket {TicketId}", ticketId);
            return StatusCode(500, new { error = "Failed to assign ticket" });
        }
    }

    [HttpPost("{ticketId}/call")]
    public async Task<ActionResult> CallTicket(int ticketId, [FromBody] CallTicketRequest request)
    {
        try
        {
            var success = await _ticketService.CallTicketAsync(ticketId, request.CounterId);
            if (!success)
            {
                return BadRequest(new { error = "Failed to call ticket" });
            }

            var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling ticket {TicketId}", ticketId);
            return StatusCode(500, new { error = "Failed to call ticket" });
        }
    }

    [HttpPost("{ticketId}/complete")]
    public async Task<ActionResult> CompleteTicket(int ticketId, [FromBody] CompleteTicketRequest? request = null)
    {
        try
        {
            var success = await _ticketService.CompleteTicketAsync(ticketId, request?.Result);
            if (!success)
            {
                return BadRequest(new { error = "Failed to complete ticket" });
            }

            var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing ticket {TicketId}", ticketId);
            return StatusCode(500, new { error = "Failed to complete ticket" });
        }
    }

    [HttpPost("{ticketId}/skip")]
    public async Task<ActionResult> SkipTicket(int ticketId)
    {
        try
        {
            var success = await _ticketService.SkipTicketAsync(ticketId);
            if (!success)
            {
                return BadRequest(new { error = "Failed to skip ticket" });
            }

            var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
            return Ok(ticket);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error skipping ticket {TicketId}", ticketId);
            return StatusCode(500, new { error = "Failed to skip ticket" });
        }
    }

    [HttpGet("{ticketId}")]
    public async Task<ActionResult<Ticket>> GetTicket(int ticketId)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
        if (ticket == null)
        {
            return NotFound();
        }
        return Ok(ticket);
    }

    [HttpGet("branch/{branchId}/waiting")]
    public async Task<ActionResult<List<Ticket>>> GetWaitingTickets(int branchId)
    {
        var tickets = await _ticketService.GetWaitingTicketsAsync(branchId);
        return Ok(tickets);
    }
}

// Request DTOs
public record CreateTicketRequest(int BranchId, int ServiceTypeId);
public record AssignTicketRequest(int CounterId);
public record CallTicketRequest(int CounterId);
public record CompleteTicketRequest(string? Result);

