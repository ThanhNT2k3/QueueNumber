namespace Shared.Models;

public class Ticket
{
    public int TicketId { get; set; }
    public int Number { get; set; }
    public int BranchId { get; set; }
    public int ServiceTypeId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? AssignedCounterId { get; set; }
    public TicketStatus Status { get; set; } = TicketStatus.Waiting;
    public DateTime? CalledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Result { get; set; }
    public string? SkipComment { get; set; }
    public string? CancelComment { get; set; }
    
    // Navigation properties
    public Branch Branch { get; set; } = null!;
    public ServiceType ServiceType { get; set; } = null!;
    public Counter? AssignedCounter { get; set; }
    
    // Computed property for display
    public string DisplayNumber => $"{ServiceType?.Prefix ?? ""}{Number:D3}";
}

