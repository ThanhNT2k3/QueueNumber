using BankNext.QMS.Core.Entities;
using BankNext.QMS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankNext.QMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BranchController : ControllerBase
{
    private readonly QmsDbContext _context;

    public BranchController(QmsDbContext context)
    {
        _context = context;
    }

    // GET: api/branch
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Branch>>> GetBranches()
    {
        return await _context.Branches
            .OrderBy(b => b.Name)
            .ToListAsync();
    }

    // GET: api/branch/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Branch>> GetBranch(string id)
    {
        var branch = await _context.Branches.FindAsync(id);

        if (branch == null)
        {
            return NotFound();
        }

        return branch;
    }

    // POST: api/branch
    [HttpPost]
    public async Task<ActionResult<Branch>> CreateBranch(Branch branch)
    {
        // Check if ID already exists
        if (await _context.Branches.AnyAsync(b => b.Id == branch.Id))
        {
            return Conflict(new { message = "Branch ID already exists" });
        }

        branch.CreatedAt = DateTime.UtcNow;
        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBranch), new { id = branch.Id }, branch);
    }

    // PUT: api/branch/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBranch(string id, Branch branch)
    {
        if (id != branch.Id)
        {
            return BadRequest();
        }

        var existingBranch = await _context.Branches.FindAsync(id);
        if (existingBranch == null)
        {
            return NotFound();
        }

        existingBranch.Name = branch.Name;
        existingBranch.Address = branch.Address;
        existingBranch.IsActive = branch.IsActive;
        existingBranch.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Branches.AnyAsync(b => b.Id == id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/branch/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBranch(string id)
    {
        var branch = await _context.Branches.FindAsync(id);
        if (branch == null)
        {
            return NotFound();
        }

        // Check if branch has associated counters or users
        var hasCounters = await _context.Counters.AnyAsync(c => c.BranchId == id);
        var hasUsers = await _context.Users.AnyAsync(u => u.BranchId == id);

        if (hasCounters || hasUsers)
        {
            return BadRequest(new { message = "Cannot delete branch with associated counters or users. Please reassign them first." });
        }

        _context.Branches.Remove(branch);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
