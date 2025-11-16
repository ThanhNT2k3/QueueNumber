using Microsoft.EntityFrameworkCore;
using Server.Data;
using Shared.Models;

namespace Server.Services;

public class BranchService : IBranchService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BranchService> _logger;

    public BranchService(ApplicationDbContext context, ILogger<BranchService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<Branch>> GetAllBranchesAsync()
    {
        return await _context.Branches.ToListAsync();
    }

    public async Task<Branch?> GetBranchByIdAsync(int branchId)
    {
        return await _context.Branches
            .Include(b => b.Counters)
            .FirstOrDefaultAsync(b => b.BranchId == branchId);
    }

    public async Task<Branch> CreateBranchAsync(Branch branch)
    {
        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();
        return branch;
    }

    public async Task<Branch> UpdateBranchAsync(Branch branch)
    {
        _context.Branches.Update(branch);
        await _context.SaveChangesAsync();
        return branch;
    }

    public async Task<bool> DeleteBranchAsync(int branchId)
    {
        var branch = await _context.Branches
            .Include(b => b.Counters)
            .FirstOrDefaultAsync(b => b.BranchId == branchId);
        
        if (branch == null) return false;
        
        if (branch.Counters.Any())
        {
            return false; // Cannot delete branch with counters
        }
        
        _context.Branches.Remove(branch);
        await _context.SaveChangesAsync();
        return true;
    }
}

