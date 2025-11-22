using ITfoxtec.Identity.Saml2;
using ITfoxtec.Identity.Saml2.Schemas;
using ITfoxtec.Identity.Saml2.MvcCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Authentication;

namespace BankNext.QMS.Api.Controllers;

[AllowAnonymous]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly Saml2Configuration _config;
    private readonly BankNext.QMS.Infrastructure.Data.QmsDbContext _context;

    public AuthController(IOptions<Saml2Configuration> configAccessor, BankNext.QMS.Infrastructure.Data.QmsDbContext context)
    {
        _config = configAccessor.Value;
        _context = context;
    }

    [HttpGet("login")]
    public IActionResult Login()
    {
        var binding = new Saml2RedirectBinding();
        binding.SetRelayStateQuery(new Dictionary<string, string> { { "returnUrl", "http://localhost:5173" } });

        return binding.Bind(new Saml2AuthnRequest(_config)).ToActionResult();
    }

    [HttpPost("acs")]
    public async Task<IActionResult> AssertionConsumerService()
    {
        var binding = new Saml2PostBinding();
        var saml2AuthnResponse = new Saml2AuthnResponse(_config);

        binding.ReadSamlResponse(Request.ToGenericHttpRequest(), saml2AuthnResponse);
        if (saml2AuthnResponse.Status != Saml2StatusCodes.Success)
        {
            throw new AuthenticationException($"SAML Response status: {saml2AuthnResponse.Status}");
        }

        binding.Unbind(Request.ToGenericHttpRequest(), saml2AuthnResponse);
        await saml2AuthnResponse.CreateSession(HttpContext, claimsTransform: (claimsPrincipal) => claimsPrincipal);

        var relayState = binding.GetRelayStateQuery();
        var returnUrl = relayState.ContainsKey("returnUrl") ? relayState["returnUrl"] : "http://localhost:5173";

        // In a real app, we would generate a JWT here and redirect with it
        // For now, we assume cookie auth or just redirect back
        return Redirect(returnUrl);
    }

    [HttpGet("logout")]
    public async Task<IActionResult> Logout()
    {
        if (!User.Identity.IsAuthenticated)
        {
            return Redirect("http://localhost:5173");
        }

        var binding = new Saml2PostBinding();
        var saml2LogoutRequest = await new Saml2LogoutRequest(_config, User).DeleteSession(HttpContext);
        return binding.Bind(saml2LogoutRequest).ToActionResult();
    }

    [HttpPost("simple-login")]
    public async Task<IActionResult> SimpleLogin([FromBody] LoginRequest request)
    {
        // 1. Check if user exists
        var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);

        // 2. Seed if not exists (for demo purposes)
        if (user == null)
        {
            if (request.Username == "admin@banknext.com" && request.Password == "password")
            {
                user = new BankNext.QMS.Core.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    FullName = "Admin User",
                    Role = "ADMIN",
                    AvatarUrl = "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff"
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else if (request.Username == "teller@banknext.com" && request.Password == "password")
            {
                user = new BankNext.QMS.Core.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    FullName = "Teller User",
                    Role = "TELLER",
                    AvatarUrl = "https://ui-avatars.com/api/?name=Teller+User&background=059669&color=fff"
                };
                
                // Auto-assign to the first counter for demo purposes
                var firstCounter = _context.Counters.FirstOrDefault();
                if (firstCounter != null)
                {
                    firstCounter.AssignedUserId = user.Id;
                }
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
             else if (request.Username == "manager@banknext.com" && request.Password == "password")
            {
                user = new BankNext.QMS.Core.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    FullName = "Manager User",
                    Role = "MANAGER",
                    AvatarUrl = "https://ui-avatars.com/api/?name=Manager+User&background=7C3AED&color=fff"
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                 return Unauthorized("Invalid credentials");
            }
        }
        else
        {
            // In real app, verify hash. Here we just assume if they exist they are good for this demo or check password if we stored it (we didn't store password in seed above, so let's just allow it for seeded users)
            // For simplicity in this demo:
            if (request.Password != "password") return Unauthorized("Invalid credentials");
        }

        // 3. Find assigned counter
        var counter = _context.Counters.FirstOrDefault(c => c.AssignedUserId == user.Id);

        return Ok(new 
        { 
            user.Id, 
            user.Username, 
            user.FullName, 
            user.Role, 
            user.AvatarUrl,
            AssignedCounterId = counter?.Id 
        });
    }
}

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}
