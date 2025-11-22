using BankNext.QMS.Core.Enums;
using System;
using System.Collections.Generic;

namespace BankNext.QMS.Core.Entities;

public class Counter
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CounterStatus Status { get; set; }
    
    public Guid? CurrentTicketId { get; set; }
    public Guid? AssignedUserId { get; set; }
    
    // Storing as a comma-separated string for SQLite simplicity, or we can use a value converter
    public string ServiceTags { get; set; } = string.Empty; 
    
    public List<ServiceType> GetServiceTags()
    {
        if (string.IsNullOrEmpty(ServiceTags)) return new List<ServiceType>();
        return ServiceTags.Split(',')
            .Select(t => Enum.Parse<ServiceType>(t))
            .ToList();
    }

    public void SetServiceTags(List<ServiceType> tags)
    {
        ServiceTags = string.Join(",", tags);
    }
}
