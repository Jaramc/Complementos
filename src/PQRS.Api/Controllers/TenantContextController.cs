using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PQRS.Application.Common.Interfaces;
using PQRS.Infrastructure.Persistence;

namespace PQRS.Api.Controllers;

[ApiController]
[Route("api/v1/tenant-context")]
public sealed class TenantContextController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ICurrentTenantService _currentTenantService;

    public TenantContextController(ApplicationDbContext dbContext, ICurrentTenantService currentTenantService)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _currentTenantService = currentTenantService ?? throw new ArgumentNullException(nameof(currentTenantService));
    }

    [HttpGet("verify")]
    public async Task<IActionResult> Verify(CancellationToken cancellationToken)
    {
        if (!_currentTenantService.HasTenant || !_currentTenantService.TenantId.HasValue)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            tenantId = _currentTenantService.TenantId,
            tenantName = _currentTenantService.TenantName,
            usersVisible = await _dbContext.Users.CountAsync(cancellationToken),
            articlesVisible = await _dbContext.KnowledgeBaseArticles.CountAsync(cancellationToken),
            ticketsVisible = await _dbContext.Tickets.CountAsync(cancellationToken)
        });
    }
}
