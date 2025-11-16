using System.Diagnostics;
using System.Net;
using QRCoder;
using Shared.Models;
using Microsoft.AspNetCore.Hosting;


namespace Server.Services;

public class PrintingService : IPrintingService
{
  private readonly ILogger<PrintingService> _logger;
  private readonly IWebHostEnvironment _env;

  public PrintingService(ILogger<PrintingService> logger, IWebHostEnvironment env)
  {
    _logger = logger;
    _env = env;
  }

    public async Task<bool> PrintTicketAsync(Ticket ticket, string? printerName = null)
    {
        if (ticket == null) return false;

        try
        {
            var html = BuildPrintableHtml(ticket);
            var tempPath = Path.Combine(Path.GetTempPath(), $"ticket_{ticket.TicketId}_{DateTime.Now:yyyyMMddHHmmss}.html");
            await File.WriteAllTextAsync(tempPath, html);

            // Use lp (CUPS) on macOS/Linux. If lp is not available, keep file for manual printing.
            var lp = "lp";
            var psi = new ProcessStartInfo
            {
                FileName = lp,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            if (!string.IsNullOrEmpty(printerName))
            {
                psi.ArgumentList.Add("-d");
                psi.ArgumentList.Add(printerName);
            }
            psi.ArgumentList.Add(tempPath);

            using var proc = Process.Start(psi);
            if (proc == null)
            {
                _logger.LogWarning("Failed to start print process (lp not found)");
                return false;
            }

            var stdout = await proc.StandardOutput.ReadToEndAsync();
            var stderr = await proc.StandardError.ReadToEndAsync();
            await proc.WaitForExitAsync();

            _logger.LogInformation("Print job submitted for ticket {TicketId}. lp output: {Out}", ticket.TicketId, stdout);
            if (!string.IsNullOrWhiteSpace(stderr)) _logger.LogWarning("lp stderr: {Err}", stderr);

            return proc.ExitCode == 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while printing ticket {TicketId}", ticket.TicketId);
            return false;
        }
    }

    private string BuildPrintableHtml(Ticket ticket)
    {
        var number = WebUtility.HtmlEncode(ticket.DisplayNumber ?? "-");
        var service = WebUtility.HtmlEncode(ticket.ServiceType?.Name ?? "Dịch vụ");
        var branch = WebUtility.HtmlEncode(ticket.Branch?.Name ?? "Chi nhánh");
        var counter = WebUtility.HtmlEncode(ticket.AssignedCounter?.Name ?? string.Empty);
        var created = ticket.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm");

        // Embed logo if available in wwwroot/images/logo.png
        string? logoDataUri = null;
        try
        {
            var logoPath = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "images", "logo.png");
            if (File.Exists(logoPath))
            {
                var bytes = File.ReadAllBytes(logoPath);
                var b64 = Convert.ToBase64String(bytes);
                logoDataUri = $"data:image/png;base64,{b64}";
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Unable to load logo for print template");
        }

        // Generate QR code containing ticket details (scannable info)
        string qrDataUri = string.Empty;
        try
        {
            var qrContent = $"TICKET:{ticket.TicketId};NUM:{ticket.DisplayNumber};BR:{ticket.Branch?.Name}";
            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(qrContent, QRCodeGenerator.ECCLevel.Q);
            var png = new PngByteQRCode(qrCodeData);
            var qrBytes = png.GetGraphic(20);
            qrDataUri = $"data:image/png;base64,{Convert.ToBase64String(qrBytes)}";
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Failed to generate QR code for ticket {TicketId}", ticket.TicketId);
        }

        // Build HTML with embedded logo and QR
        var logoImg = string.IsNullOrEmpty(logoDataUri) ? string.Empty : $"<img src=\"{logoDataUri}\" alt=\"logo\" style=\"height:42px;display:block;margin:0 auto 6px auto;\"/>";
        var qrImg = string.IsNullOrEmpty(qrDataUri) ? string.Empty : $"<img src=\"{qrDataUri}\" alt=\"qr\" style=\"height:72px;width:72px;display:block;margin:8px auto 0 auto;\"/>";

        return $@"<!doctype html>
<html>
<head>
  <meta charset='utf-8'/>
  <meta name='viewport' content='width=device-width, initial-scale=1'/>
  <title>Ticket {number}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:0; padding:20px; color:#222; }}
    .card{{ width:320px; border-radius:8px; padding:18px; border:1px solid #eee; box-shadow:0 6px 18px rgba(0,0,0,0.06); margin:0 auto }}
    .brand{{ text-transform:uppercase; font-size:12px; color:#666; letter-spacing:1px; text-align:center }}
    .big-number{{ font-size:64px; font-weight:700; color:#0b63ff; margin:8px 0; text-align:center; }}
    .meta{{ display:flex; justify-content:space-between; font-size:13px; color:#555; margin-top:8px; }}
    .service{{ font-weight:600; color:#333; text-align:center; margin-top:6px; }}
    .footer{{ font-size:11px; color:#888; margin-top:12px; text-align:center; }}
    .counter{{ display:block; background:#ffeb3b; color:#222; padding:6px 10px; border-radius:12px; font-weight:700; width:fit-content; margin:10px auto; text-align:center }}
  .row {{ display:flex; justify-content:space-between; align-items:center; }}
    @media print {{ body {{ margin:0; }} .card {{ box-shadow:none; border:none; width:100%; }} }}
  </style>
</head>
<body>
  <div class='card'>
    {logoImg}
    <div class='brand'>{branch}</div>
    <div class='big-number'>{number}</div>
    <div class='service'>{service}</div>
    {(string.IsNullOrEmpty(counter) ? string.Empty : $"<div class='counter'>Quầy: {counter}</div>")}
    <div class='row'>
      <div>Ngày: {created}</div>
      <div>ID: {ticket.TicketId}</div>
    </div>
    {qrImg}
    <div class='footer'>Cảm ơn quý khách. Vui lòng chờ gọi số hoặc ra quầy khi hiển thị.</div>
  </div>
</body>
</html>";
    }
}
