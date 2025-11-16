using Shared.Models;

namespace Server.Services;

public interface IBranchService
{
    Task<List<Branch>> GetAllBranchesAsync();
    Task<Branch?> GetBranchByIdAsync(int branchId);
    Task<Branch> CreateBranchAsync(Branch branch);
    Task<Branch> UpdateBranchAsync(Branch branch);
    Task<bool> DeleteBranchAsync(int branchId);
}

