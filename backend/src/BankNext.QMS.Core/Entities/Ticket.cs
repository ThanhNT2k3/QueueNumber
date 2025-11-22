using BankNext.QMS.Core.Enums;
using System;

namespace BankNext.QMS.Core.Entities;

public class Ticket
{
    public Guid Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public ServiceType ServiceType { get; set; }
    public TicketStatus Status { get; set; }
    public DateTimeOffset CreatedTime { get; set; }
    public DateTimeOffset? CalledTime { get; set; }
    public DateTimeOffset? CompletedTime { get; set; }
    
    public Guid? CounterId { get; set; }
    // Navigation property will be added later if needed, keeping it simple for now to avoid circular deps in simple models
    // public Counter? Counter { get; set; }

    public string? CustomerName { get; set; }
    public CustomerSegment CustomerSegment { get; set; }
    public string? CustomerId { get; set; }

    public int PriorityScore { get; set; }
    public int RecallCount { get; set; }
    public bool IsBooking { get; set; }

    public int? FeedbackRating { get; set; }
    public string? FeedbackComment { get; set; }
    public string? FeedbackTags { get; set; }
    
    public string? BranchId { get; set; }
    
    // Audit and Queue Management
    public string? Remarks { get; set; }
    public int MovedToEndCount { get; set; } = 0;
    public DateTimeOffset? LastMovedToEndTime { get; set; }
    
    // Customer Contact Information
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerNote { get; set; }
}
