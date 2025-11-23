using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankNext.QMS.Infrastructure.Data;
using BankNext.QMS.Core.Entities;

namespace BankNext.QMS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly QmsDbContext _context;

    public UsersController(QmsDbContext context)
    {
        _context = context;
    }

    // GET: api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers()
    {
        var users = await _context.Users.ToListAsync();
        
        var result = new List<object>();
        foreach (var u in users)
        {
            // Find assigned counter
            var counter = await _context.Counters.FirstOrDefaultAsync(c => c.AssignedUserId == u.Id);
            
            result.Add(new
            {
                u.Id,
                u.Username,
                u.FullName,
                Email = u.Email ?? u.Username,
                u.Role,
                u.AvatarUrl,
                u.BranchId,
                AssignedCounterId = counter?.Id
            });
        }

        return Ok(result);
    }

    // GET: api/users/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Find assigned counter
        var counter = await _context.Counters.FirstOrDefaultAsync(c => c.AssignedUserId == user.Id);

        return Ok(new
        {
            user.Id,
            user.Username,
            user.FullName,
            Email = user.Email ?? user.Username,
            user.Role,
            user.AvatarUrl,
            user.BranchId,
            AssignedCounterId = counter?.Id
        });
    }

    // PUT: api/users/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Update user properties
        if (!string.IsNullOrEmpty(request.FullName))
            user.FullName = request.FullName;

        if (!string.IsNullOrEmpty(request.Email))
        {
            user.Email = request.Email;
            user.Username = request.Email; // Update username with email
        }

        if (!string.IsNullOrEmpty(request.Role))
            user.Role = request.Role;

        if (request.BranchId != null)
            user.BranchId = request.BranchId;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
            {
                return NotFound();
            }
            throw;
        }

        // Find assigned counter
        var counter = await _context.Counters.FirstOrDefaultAsync(c => c.AssignedUserId == user.Id);

        return Ok(new
        {
            user.Id,
            user.Username,
            user.FullName,
            Email = user.Email ?? user.Username,
            user.Role,
            user.AvatarUrl,
            user.BranchId,
            AssignedCounterId = counter?.Id
        });
    }

    // DELETE: api/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Check if user has assigned counter
        var counter = await _context.Counters.FirstOrDefaultAsync(c => c.AssignedUserId == user.Id);
        if (counter != null)
        {
            // Unassign counter
            counter.AssignedUserId = null;
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User deleted successfully" });
    }

    // POST: api/users
    [HttpPost]
    public async Task<ActionResult<object>> CreateUser([FromBody] CreateUserRequest request)
    {
        // Check if username already exists
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            return BadRequest(new { message = "Username already exists" });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email ?? request.Username,
            FullName = request.FullName,
            Role = request.Role,
            BranchId = request.BranchId,
            AvatarUrl = request.AvatarUrl ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(request.FullName)}&background=random"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
        {
            user.Id,
            user.Username,
            user.FullName,
            Email = user.Email ?? user.Username,
            user.Role,
            user.AvatarUrl,
            user.BranchId,
            AssignedCounterId = (string?)null
        });
    }

    private bool UserExists(Guid id)
    {
        return _context.Users.Any(e => e.Id == id);
    }
}

public class UpdateUserRequest
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? BranchId { get; set; }
}

public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "TELLER";
    public string? Email { get; set; }
    public string? BranchId { get; set; }
    public string? AvatarUrl { get; set; }
}
