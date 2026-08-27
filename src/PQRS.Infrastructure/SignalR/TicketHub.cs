using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace PQRS.Infrastructure.SignalR;

[Authorize]
public sealed class TicketHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var tenantId = Context.User?.FindFirstValue("tenant_id");
        if (!Guid.TryParse(tenantId, out var parsedTenantId) || parsedTenantId == Guid.Empty)
        {
            throw new HubException("A valid tenant_id claim is required.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, parsedTenantId.ToString()).ConfigureAwait(false);
        await base.OnConnectedAsync().ConfigureAwait(false);
    }
}
