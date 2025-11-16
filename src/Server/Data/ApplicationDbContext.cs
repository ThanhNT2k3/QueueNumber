using Microsoft.EntityFrameworkCore;
using Shared.Models;

namespace Server.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Counter> Counters { get; set; }
    public DbSet<Branch> Branches { get; set; }
    public DbSet<ServiceType> ServiceTypes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Ticket
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.TicketId);
            entity.HasIndex(e => new { e.BranchId, e.ServiceTypeId });
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.Number).IsRequired();
            entity.Property(e => e.Status).HasConversion<int>();
            
            entity.HasOne(e => e.Branch)
                .WithMany(b => b.Tickets)
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.ServiceType)
                .WithMany(s => s.Tickets)
                .HasForeignKey(e => e.ServiceTypeId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.AssignedCounter)
                .WithMany(c => c.Tickets)
                .HasForeignKey(e => e.AssignedCounterId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure Counter
        modelBuilder.Entity<Counter>(entity =>
        {
            entity.HasKey(e => e.CounterId);
            entity.HasOne(e => e.Branch)
                .WithMany(b => b.Counters)
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasMany(e => e.SupportedServices)
                .WithMany(s => s.Counters);
        });

        // Configure Branch
        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.BranchId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
        });

        // Configure ServiceType
        modelBuilder.Entity<ServiceType>(entity =>
        {
            entity.HasKey(e => e.ServiceTypeId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Prefix).IsRequired().HasMaxLength(10);
        });
    }
}

