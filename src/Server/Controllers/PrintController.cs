using Microsoft.AspNetCore.Mvc;
using Server.Services;

namespace Server.Controllers;

[ApiController]
[Route("api/print")]
public class PrintController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly IPrintingService _printingService;
    private readonly ILogger<PrintController> _logger;

    public PrintController(ITicketService ticketService, IPrintingService printingService, ILogger<PrintController> logger)
    {
        _ticketService = ticketService;
        _printingService = printingService;
        _logger = logger;
    }

    [HttpPost("ticket/{ticketId}")]
    public async Task<IActionResult> PrintTicket(int ticketId, [FromQuery] string? printerName = null)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
        if (ticket is null) return NotFound();

        var ok = await _printingService.PrintTicketAsync(ticket, printerName);
        if (ok) return Ok(new { printed = true });

        _logger.LogWarning("Print job failed for ticket {TicketId}", ticketId);
        return StatusCode(500, new { printed = false });
    }
}
