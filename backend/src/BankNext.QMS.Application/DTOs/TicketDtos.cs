using BankNext.QMS.Core.Enums;

namespace BankNext.QMS.Application.DTOs;

public class CreateTicketRequest
{
    public ServiceType ServiceType { get; set; }
    public string? CustomerName { get; set; }
    public CustomerSegment CustomerSegment { get; set; }
    public string? CustomerId { get; set; }
    public string? BranchId { get; set; }
}

public class CreateTicketResponse
{
    public Guid Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public ServiceType ServiceType { get; set; }
    public TicketStatus Status { get; set; }
    public DateTimeOffset CreatedTime { get; set; }
    public int PriorityScore { get; set; }
    public string? CustomerName { get; set; }
    public CustomerSegment CustomerSegment { get; set; }
    public string? CustomerId { get; set; }
    public string? BranchId { get; set; }
    public string? CounterId { get; set; }
}

public class CallTicketRequest
{
    public Guid CounterId { get; set; }
}

public class TicketDto
{
    public Guid Id { get; set; }
    public string Number { get; set; } = string.Empty;
    public ServiceType ServiceType { get; set; }
    public TicketStatus Status { get; set; }
    public DateTimeOffset CreatedTime { get; set; }
    public DateTimeOffset? CalledTime { get; set; }
    public DateTimeOffset? CompletedTime { get; set; }
    public int PriorityScore { get; set; }
    public string? CustomerName { get; set; }
    public CustomerSegment CustomerSegment { get; set; }
    public string? CustomerId { get; set; }
    public Guid? CounterId { get; set; }
    public int RecallCount { get; set; }
    public string? BranchId { get; set; }
}
