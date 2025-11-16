using Microsoft.EntityFrameworkCore;
using Shared.Models;

namespace Server.Data;

public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            // Check if data already exists
            if (await _context.Branches.AnyAsync())
            {
                _logger.LogInformation("Database already contains data. Skipping seed.");
                return;
            }

            _logger.LogInformation("Seeding database with sample data...");

            // Create Branches
            var branch1 = new Branch
            {
                Name = "Chi nhánh Trung tâm",
                Address = "123 Đường ABC, Quận 1, TP.HCM",
                Phone = "028-1234-5678"
            };



            _context.Branches.AddRange(branch1);
            await _context.SaveChangesAsync();

            // Create Service Types
            var serviceType1 = new ServiceType
            {
                Name = "Tư vấn",
                Prefix = "TV",
                Description = "Dịch vụ tư vấn khách hàng",
                EstimatedMinutes = 15
            };

            var serviceType2 = new ServiceType
            {
                Name = "Giao dịch",
                Prefix = "GD",
                Description = "Giao dịch ngân hàng",
                EstimatedMinutes = 10
            };

            var serviceType3 = new ServiceType
            {
                Name = "Nộp hồ sơ",
                Prefix = "NH",
                Description = "Nộp hồ sơ vay vốn",
                EstimatedMinutes = 20
            };

            var serviceType4 = new ServiceType
            {
                Name = "Khám bệnh",
                Prefix = "KB",
                Description = "Khám bệnh tổng quát",
                EstimatedMinutes = 30
            };

            var serviceType5 = new ServiceType
            {
                Name = "Thanh toán",
                Prefix = "TT",
                Description = "Thanh toán hóa đơn",
                EstimatedMinutes = 5
            };

            _context.ServiceTypes.AddRange(serviceType1, serviceType2, serviceType3, serviceType4, serviceType5);
            await _context.SaveChangesAsync();

            // Create Counters for Branch 1
            var counter1 = new Counter
            {
                BranchId = branch1.BranchId,
                Name = "Quầy 1",
                IsActive = true,
                IsBusy = false,
                SupportedServices = new List<ServiceType> { serviceType1, serviceType2 }
            };

            var counter2 = new Counter
            {
                BranchId = branch1.BranchId,
                Name = "Quầy 2",
                IsActive = true,
                IsBusy = false,
                SupportedServices = new List<ServiceType> { serviceType2, serviceType5 }
            };

            var counter3 = new Counter
            {
                BranchId = branch1.BranchId,
                Name = "Quầy 3",
                IsActive = true,
                IsBusy = false,
                SupportedServices = new List<ServiceType> { serviceType1, serviceType3 }
            };

            _context.Counters.AddRange(counter1, counter2, counter3);
            await _context.SaveChangesAsync();

            // Create some sample tickets for testing
            var today = DateTime.UtcNow.Date;
            var sampleTickets = new List<Ticket>();

            // Create some completed tickets from today
            for (int i = 1; i <= 5; i++)
            {
                sampleTickets.Add(new Ticket
                {
                    BranchId = branch1.BranchId,
                    ServiceTypeId = serviceType1.ServiceTypeId,
                    Number = i,
                    CreatedAt = today.AddHours(8).AddMinutes(i * 10),
                    Status = TicketStatus.Done,
                    AssignedCounterId = counter1.CounterId,
                    CalledAt = today.AddHours(8).AddMinutes(i * 10 + 2),
                    CompletedAt = today.AddHours(8).AddMinutes(i * 10 + 15)
                });
            }

            // Create some waiting tickets
            for (int i = 6; i <= 8; i++)
            {
                sampleTickets.Add(new Ticket
                {
                    BranchId = branch1.BranchId,
                    ServiceTypeId = serviceType2.ServiceTypeId,
                    Number = i,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-(i - 5) * 5),
                    Status = TicketStatus.Waiting,
                    AssignedCounterId = counter2.CounterId
                });
            }

            // Create one serving ticket
            sampleTickets.Add(new Ticket
            {
                BranchId = branch1.BranchId,
                ServiceTypeId = serviceType1.ServiceTypeId,
                Number = 9,
                CreatedAt = DateTime.UtcNow.AddMinutes(-10),
                Status = TicketStatus.Serving,
                AssignedCounterId = counter1.CounterId,
                CalledAt = DateTime.UtcNow.AddMinutes(-5)
            });

            _context.Tickets.AddRange(sampleTickets);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Database seeded successfully!");
            _logger.LogInformation("Created: {BranchCount} branches, {ServiceTypeCount} service types, {CounterCount} counters, {TicketCount} tickets",
                await _context.Branches.CountAsync(),
                await _context.ServiceTypes.CountAsync(),
                await _context.Counters.CountAsync(),
                await _context.Tickets.CountAsync());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding database");
            throw;
        }
    }
}

