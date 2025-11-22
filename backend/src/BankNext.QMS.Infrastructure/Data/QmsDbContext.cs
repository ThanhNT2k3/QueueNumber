using BankNext.QMS.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace BankNext.QMS.Infrastructure.Data;

public class QmsDbContext : DbContext
{
    public QmsDbContext(DbContextOptions<QmsDbContext> options) : base(options)
    {
    }

    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Counter> Counters { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Branch> Branches { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Number).IsRequired().HasMaxLength(10);
            entity.Property(e => e.ServiceType).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.CustomerSegment).HasConversion<string>();
        });

        modelBuilder.Entity<Counter>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasConversion<string>();
        });
    }
}
