using System;

namespace BankNext.QMS.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "TELLER"; // ADMIN, TELLER, MANAGER
    public string? AvatarUrl { get; set; }
    public string? BranchId { get; set; }
}
