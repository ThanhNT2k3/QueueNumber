namespace Shared.Models;

public class ServiceType
{
    public int ServiceTypeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Prefix { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int EstimatedMinutes { get; set; } = 10;
    
    // Navigation properties
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<Counter> Counters { get; set; } = new List<Counter>();
}

