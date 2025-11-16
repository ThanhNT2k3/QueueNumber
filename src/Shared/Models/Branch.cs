namespace Shared.Models;

public class Branch
{
    public int BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    
    // Navigation properties
    public ICollection<Counter> Counters { get; set; } = new List<Counter>();
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

