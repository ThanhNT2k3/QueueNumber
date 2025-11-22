using BankNext.QMS.Core.Entities;
using BankNext.QMS.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace BankNext.QMS.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(QmsDbContext context)
    {
        // Check if we already have counters
        if (await context.Counters.AnyAsync())
        {
            return; // Database already seeded
        }

        // Create default counters
        var counters = new List<Counter>
        {
            new Counter
            {
                Id = Guid.NewGuid(),
                Name = "Counter 1",
                Status = CounterStatus.ONLINE,
                ServiceTags = "DEPOSIT,WITHDRAWAL"
            },
            new Counter
            {
                Id = Guid.NewGuid(),
                Name = "Counter 2",
                Status = CounterStatus.ONLINE,
                ServiceTags = "DEPOSIT,WITHDRAWAL,LOAN"
            },
            new Counter
            {
                Id = Guid.NewGuid(),
                Name = "Counter 3",
                Status = CounterStatus.ONLINE,
                ServiceTags = "CONSULTATION"
            },
            new Counter
            {
                Id = Guid.NewGuid(),
                Name = "VIP Counter",
                Status = CounterStatus.ONLINE,
                ServiceTags = "VIP,DEPOSIT,WITHDRAWAL,LOAN,CONSULTATION"
            }
        };

        await context.Counters.AddRangeAsync(counters);
        await context.SaveChangesAsync();
    }
}
