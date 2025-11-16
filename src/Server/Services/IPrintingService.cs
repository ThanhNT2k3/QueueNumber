using Shared.Models;

namespace Server.Services;

public interface IPrintingService
{
    /// <summary>
    /// Generate printable output for a ticket and submit to the system print queue (silent print where supported).
    /// Returns true when the print job is submitted successfully.
    /// </summary>
    Task<bool> PrintTicketAsync(Ticket ticket, string? printerName = null);
}
