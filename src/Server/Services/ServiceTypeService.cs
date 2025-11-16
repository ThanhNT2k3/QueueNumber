using Microsoft.EntityFrameworkCore;
using Server.Data;
using Shared.Models;

namespace Server.Services;

public class ServiceTypeService : IServiceTypeService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ServiceTypeService> _logger;

    public ServiceTypeService(ApplicationDbContext context, ILogger<ServiceTypeService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<ServiceType>> GetAllServiceTypesAsync()
    {
        return await _context.ServiceTypes.ToListAsync();
    }

    public async Task<ServiceType?> GetServiceTypeByIdAsync(int serviceTypeId)
    {
        return await _context.ServiceTypes.FindAsync(serviceTypeId);
    }

    public async Task<List<ServiceType>> GetServiceTypesByBranchAsync(int branchId)
    {
        // Get service types that are supported by at least one counter in the branch
        return await _context.ServiceTypes
            .Where(st => st.Counters.Any(c => c.BranchId == branchId && c.IsActive))
            .ToListAsync();
    }

    public async Task<ServiceType> CreateServiceTypeAsync(ServiceType serviceType)
    {
        _context.ServiceTypes.Add(serviceType);
        await _context.SaveChangesAsync();
        return serviceType;
    }

    public async Task<ServiceType> UpdateServiceTypeAsync(ServiceType serviceType)
    {
        _context.ServiceTypes.Update(serviceType);
        await _context.SaveChangesAsync();
        return serviceType;
    }

    public async Task<bool> DeleteServiceTypeAsync(int serviceTypeId)
    {
        var serviceType = await _context.ServiceTypes
            .Include(st => st.Counters)
            .Include(st => st.Tickets)
            .FirstOrDefaultAsync(st => st.ServiceTypeId == serviceTypeId);
        
        if (serviceType == null) return false;
        
        if (serviceType.Counters.Any() || serviceType.Tickets.Any())
        {
            return false; // Cannot delete if used
        }
        
        _context.ServiceTypes.Remove(serviceType);
        await _context.SaveChangesAsync();
        return true;
    }
}

