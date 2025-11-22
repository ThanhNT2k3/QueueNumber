using BankNext.QMS.Core.Entities;
using BankNext.QMS.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace BankNext.QMS.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(QmsDbContext context)
    {
        // Check if we already have data
        if (await context.Counters.AnyAsync())
        {
            return; // Database already seeded
        }

        // Seed Branches
        var branches = new List<Branch>
        {
            new Branch { Id = "HQ", Name = "Headquarters (Hội sở chính)", Address = "123 Bank Street, Dist 1", IsActive = true },
            new Branch { Id = "B01", Name = "Saigon Centre Branch", Address = "65 Le Loi, Dist 1", IsActive = true },
            new Branch { Id = "B02", Name = "Landmark 81 Branch", Address = "208 Nguyen Huu Canh, Binh Thanh", IsActive = true },
            new Branch { Id = "B03", Name = "Thu Duc Branch", Address = "1 Vo Van Ngan, Thu Duc", IsActive = true }
        };
        await context.Branches.AddRangeAsync(branches);

        // Seed Categories (Service Types)
        var categories = new List<Category>
        {
            new Category { Id = "DEPOSIT", Name = "Deposit", Description = "Cash & Check Deposits", Icon = "Wallet", Color = "bg-blue-500", DisplayOrder = 1, IsActive = true },
            new Category { Id = "WITHDRAWAL", Name = "Withdrawal", Description = "Cash Withdrawals", Icon = "Banknote", Color = "bg-green-500", DisplayOrder = 2, IsActive = true },
            new Category { Id = "LOAN", Name = "Loan Services", Description = "Loan Applications & Inquiries", Icon = "HandCoins", Color = "bg-purple-500", DisplayOrder = 3, IsActive = true },
            new Category { Id = "CONSULTATION", Name = "Consultation", Description = "Financial Advice & Support", Icon = "MessageSquare", Color = "bg-orange-500", DisplayOrder = 4, IsActive = true },
            new Category { Id = "VIP", Name = "VIP Services", Description = "Premium Customer Services", Icon = "Crown", Color = "bg-yellow-500", DisplayOrder = 5, IsActive = true }
        };
        await context.Categories.AddRangeAsync(categories);

        // Create default counters
        var counters = new List<Counter>
        {
            new Counter
            {
                Id = Guid.NewGuid(),
                Name = "Counter 1",
                Status = CounterStatus.ONLINE,
                ServiceTags = "DEPOSIT,WITHDRAWAL",
                BranchId = "B01"
            },
            new Counter
            {
                Id = Guid.NewGuid(),
                Name = "Counter 2",
                Status = CounterStatus.ONLINE,
                ServiceTags = "DEPOSIT,WITHDRAWAL,LOAN",
                BranchId = "B01"
            },
            new Counter
            {
                Id = Guid.NewGuid(),
                Name = "Counter 3",
                Status = CounterStatus.ONLINE,
                ServiceTags = "CONSULTATION",
                BranchId = "B01"
            },
            new Counter
            {
                Id = Guid.NewGuid(),
                Name = "VIP Counter",
                Status = CounterStatus.ONLINE,
                ServiceTags = "VIP,DEPOSIT,WITHDRAWAL,LOAN,CONSULTATION",
                BranchId = "HQ"
            }
        };

        await context.Counters.AddRangeAsync(counters);
        await context.SaveChangesAsync();
    }
}
