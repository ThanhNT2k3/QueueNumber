using Shared.Models;

namespace Server.Services;

public interface IServiceTypeService
{
    Task<List<ServiceType>> GetAllServiceTypesAsync();
    Task<ServiceType?> GetServiceTypeByIdAsync(int serviceTypeId);
    Task<List<ServiceType>> GetServiceTypesByBranchAsync(int branchId);
    Task<ServiceType> CreateServiceTypeAsync(ServiceType serviceType);
    Task<ServiceType> UpdateServiceTypeAsync(ServiceType serviceType);
    Task<bool> DeleteServiceTypeAsync(int serviceTypeId);
}

