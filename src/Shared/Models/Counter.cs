namespace Shared.Models;

public class Counter
{
    public int CounterId { get; set; }
    public int BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsBusy { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public Branch Branch { get; set; } = null!;
    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public ICollection<ServiceType> SupportedServices { get; set; } = new List<ServiceType>();
}

