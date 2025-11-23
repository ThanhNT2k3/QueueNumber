using System;

namespace BankNext.QMS.Core.Entities;

/// <summary>
/// Audit log for counter assignment changes
/// </summary>
public class CounterAssignmentHistory
{
    public Guid Id { get; set; }
    
    /// <summary>
    /// Counter that was assigned/unassigned
    /// </summary>
    public Guid CounterId { get; set; }
    public string CounterName { get; set; } = string.Empty;
    
    /// <summary>
    /// User who was assigned/unassigned (null if unassigned)
    /// </summary>
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    
    /// <summary>
    /// Previous user (null if this was first assignment)
    /// </summary>
    public Guid? PreviousUserId { get; set; }
    public string? PreviousUserName { get; set; }
    
    /// <summary>
    /// Action type: "ASSIGNED", "UNASSIGNED", "REASSIGNED"
    /// </summary>
    public string Action { get; set; } = string.Empty;
    
    /// <summary>
    /// Branch where this happened
    /// </summary>
    public string? BranchId { get; set; }
    
    /// <summary>
    /// Who performed this action (admin/manager)
    /// </summary>
    public Guid? PerformedByUserId { get; set; }
    public string? PerformedByUserName { get; set; }
    
    /// <summary>
    /// When this action occurred
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }
    
    /// <summary>
    /// Optional reason/note for the change
    /// </summary>
    public string? Reason { get; set; }
    
    /// <summary>
    /// IP address or session info
    /// </summary>
    public string? IpAddress { get; set; }
}
