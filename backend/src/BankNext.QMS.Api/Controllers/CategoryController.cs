using BankNext.QMS.Core.Entities;
using BankNext.QMS.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankNext.QMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly QmsDbContext _context;

    public CategoryController(QmsDbContext context)
    {
        _context = context;
    }

    // GET: api/category
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();
    }

    // GET: api/category/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(string id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null)
        {
            return NotFound();
        }

        return category;
    }

    // POST: api/category
    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        // Check if ID already exists
        if (await _context.Categories.AnyAsync(c => c.Id == category.Id))
        {
            return Conflict(new { message = "Category ID already exists" });
        }

        category.CreatedAt = DateTime.UtcNow;
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    // PUT: api/category/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(string id, Category category)
    {
        if (id != category.Id)
        {
            return BadRequest();
        }

        var existingCategory = await _context.Categories.FindAsync(id);
        if (existingCategory == null)
        {
            return NotFound();
        }

        existingCategory.Name = category.Name;
        existingCategory.Description = category.Description;
        existingCategory.Icon = category.Icon;
        existingCategory.Color = category.Color;
        existingCategory.IsActive = category.IsActive;
        existingCategory.DisplayOrder = category.DisplayOrder;
        existingCategory.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Categories.AnyAsync(c => c.Id == id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/category/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(string id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        // Check if category is being used by any tickets
        var hasTickets = await _context.Tickets.AnyAsync(t => t.ServiceType.ToString() == id);

        if (hasTickets)
        {
            return BadRequest(new { message = "Cannot delete category that is being used by tickets." });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH: api/category/{id}/reorder
    [HttpPatch("{id}/reorder")]
    public async Task<IActionResult> ReorderCategory(string id, [FromBody] int newOrder)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        category.DisplayOrder = newOrder;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
