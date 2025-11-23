using BankNext.QMS.Application.DTOs;
using BankNext.QMS.Application.Services;
using BankNext.QMS.Core.Enums;
using Microsoft.AspNetCore.Mvc;

namespace BankNext.QMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly TicketService _ticketService;

    public TicketsController(TicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpPost]
    public async Task<ActionResult<CreateTicketResponse>> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var response = await _ticketService.CreateTicketAsync(request);
        return CreatedAtAction(nameof(GetTickets), new { id = response.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets(
        [FromQuery] TicketStatus? status, 
        [FromQuery] ServiceType? service,
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        [FromQuery] Guid? staffId,
        [FromQuery] string? branchId)
    {
        var tickets = await _ticketService.GetTicketsAsync(status, service, fromDate, toDate, staffId, branchId);
        return Ok(tickets);
    }

    [HttpPost("{id}/call")]
    public async Task<IActionResult> CallTicket(Guid id, [FromBody] CallTicketRequest request)
    {
        var ticket = await _ticketService.CallTicketAsync(id, request);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteTicket(Guid id)
    {
        var ticket = await _ticketService.CompleteTicketAsync(id);
        if (ticket == null) return NotFound();
        return Ok(ticket);
    }

    [HttpPost("{id}/recall")]
    public async Task<IActionResult> RecallTicket(Guid id)
    {
        // TODO: Implement recall logic in TicketService
        return Ok();
    }

    [HttpPost("{id}/transfer")]
    public async Task<IActionResult> TransferTicket(Guid id, [FromBody] TransferTicketRequest request)
    {
        // TODO: Implement transfer logic in TicketService
        return Ok();
    }
}

public class TransferTicketRequest
{
    public Guid TargetCounterId { get; set; }
}
