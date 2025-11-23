using BankNext.QMS.Application.Interfaces;
using BankNext.QMS.Core.Entities;
using Microsoft.AspNetCore.Mvc;

namespace BankNext.QMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CounterAssignmentHistoryController : ControllerBase
{
    private readonly ICounterAssignmentHistoryRepository _repository;

    public CounterAssignmentHistoryController(ICounterAssignmentHistoryRepository repository)
    {
        _repository = repository;
    }

    /// <summary>
    /// Get all assignment history with optional date filtering
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CounterAssignmentHistory>>> GetAll(
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate)
    {
        var history = await _repository.GetAllAsync(fromDate, toDate);
        return Ok(history);
    }

    /// <summary>
    /// Get assignment history for a specific counter
    /// </summary>
    [HttpGet("counter/{counterId}")]
    public async Task<ActionResult<IEnumerable<CounterAssignmentHistory>>> GetByCounter(Guid counterId)
    {
        var history = await _repository.GetByCounterIdAsync(counterId);
        return Ok(history);
    }

    /// <summary>
    /// Get assignment history for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<CounterAssignmentHistory>>> GetByUser(Guid userId)
    {
        var history = await _repository.GetByUserIdAsync(userId);
        return Ok(history);
    }

    /// <summary>
    /// Get assignment history for a specific branch
    /// </summary>
    [HttpGet("branch/{branchId}")]
    public async Task<ActionResult<IEnumerable<CounterAssignmentHistory>>> GetByBranch(string branchId)
    {
        var history = await _repository.GetByBranchIdAsync(branchId);
        return Ok(history);
    }
}
