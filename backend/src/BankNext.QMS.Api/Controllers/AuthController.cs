using ITfoxtec.Identity.Saml2;
using ITfoxtec.Identity.Saml2.Schemas;
using ITfoxtec.Identity.Saml2.MvcCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using System.Security.Authentication;
using Google.Apis.Auth;
using System.IdentityModel.Tokens.Jwt;

namespace BankNext.QMS.Api.Controllers;

[AllowAnonymous]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly Saml2Configuration _config;
    private readonly BankNext.QMS.Infrastructure.Data.QmsDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(
        IOptions<Saml2Configuration> configAccessor, 
        BankNext.QMS.Infrastructure.Data.QmsDbContext context,
        IConfiguration configuration)
    {
        _config = configAccessor.Value;
        _context = context;
        _configuration = configuration;
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
            if (request.Username == "admin@sc.com" && request.Password == "password")
            {
                user = new BankNext.QMS.Core.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    FullName = "Admin User",
                    Role = "ADMIN",
                    AvatarUrl = "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
                    BranchId = "HQ"
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else if (request.Username == "teller@sc.com" && request.Password == "password")
            {
                user = new BankNext.QMS.Core.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    FullName = "Teller User",
                    Role = "TELLER",
                    AvatarUrl = "https://ui-avatars.com/api/?name=Teller+User&background=059669&color=fff",
                    BranchId = "B01"
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
             else if (request.Username == "manager@sc.com" && request.Password == "password")
            {
                user = new BankNext.QMS.Core.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    FullName = "Manager User",
                    Role = "MANAGER",
                    AvatarUrl = "https://ui-avatars.com/api/?name=Manager+User&background=7C3AED&color=fff",
                    BranchId = "B01"
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
            AssignedCounterId = counter?.Id,
            user.BranchId
        });
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            // Verify the Google token
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _configuration["Google:ClientId"] }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.Credential, settings);

            // Check if user exists by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == payload.Email);

            if (user == null)
            {
                // Create new user from Google profile
                user = new BankNext.QMS.Core.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Username = payload.Email,
                    FullName = payload.Name,
                    AvatarUrl = payload.Picture,
                    Role = DetermineRoleFromEmail(payload.Email), // Smart role assignment
                    BranchId = DetermineBranchFromEmail(payload.Email) // Smart branch assignment
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Update avatar if changed
                if (!string.IsNullOrEmpty(payload.Picture) && user.AvatarUrl != payload.Picture)
                {
                    user.AvatarUrl = payload.Picture;
                    await _context.SaveChangesAsync();
                }
            }

            // Find assigned counter
            var counter = await _context.Counters.FirstOrDefaultAsync(c => c.AssignedUserId == user.Id);

            return Ok(new
            {
                user.Id,
                user.Username,
                user.FullName,
                Email = payload.Email,
                user.Role,
                user.AvatarUrl,
                Picture = payload.Picture,
                AssignedCounterId = counter?.Id,
                user.BranchId
            });
        }
        catch (InvalidJwtException ex)
        {
            return Unauthorized(new { message = "Invalid Google token", error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Google login failed", error = ex.Message });
        }
    }

    [HttpPost("microsoft-login")]
    public async Task<IActionResult> MicrosoftLogin([FromBody] MicrosoftLoginRequest request)
    {
        try
        {
            // Decode the Microsoft ID token (JWT)
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(request.IdToken);

            // Extract claims
            var email = token.Claims.FirstOrDefault(c => c.Type == "preferred_username" || c.Type == "email")?.Value;
            var name = token.Claims.FirstOrDefault(c => c.Type == "name")?.Value;
            var picture = token.Claims.FirstOrDefault(c => c.Type == "picture")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Email not found in Microsoft token" });
            }

            // Verify token audience (optional but recommended)
            var audience = token.Claims.FirstOrDefault(c => c.Type == "aud")?.Value;
            var expectedAudience = _configuration["Microsoft:ClientId"];
            
            if (audience != expectedAudience)
            {
                return Unauthorized(new { message = "Invalid token audience" });
            }

            // Check if user exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == email);

            if (user == null)
            {
                // Create new user from Microsoft profile
                user = new BankNext.QMS.Core.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Username = email,
                    FullName = name ?? email,
                    AvatarUrl = picture ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(name ?? email)}&background=random",
                    Role = DetermineRoleFromEmail(email),
                    BranchId = DetermineBranchFromEmail(email)
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Update avatar if provided and different
                if (!string.IsNullOrEmpty(picture) && user.AvatarUrl != picture)
                {
                    user.AvatarUrl = picture;
                    await _context.SaveChangesAsync();
                }
            }

            // Find assigned counter
            var counter = await _context.Counters.FirstOrDefaultAsync(c => c.AssignedUserId == user.Id);

            return Ok(new
            {
                user.Id,
                user.Username,
                user.FullName,
                Email = email,
                user.Role,
                user.AvatarUrl,
                Picture = picture,
                AssignedCounterId = counter?.Id,
                user.BranchId
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Microsoft login failed", error = ex.Message });
        }
    }

    // Helper method to determine role based on email domain
    private string DetermineRoleFromEmail(string email)
    {
        if (string.IsNullOrEmpty(email)) return "TELLER";

        // Admin emails
        if (email.EndsWith("@admin.sc.com") || email.Contains("admin"))
            return "ADMIN";

        // Manager emails
        if (email.EndsWith("@manager.sc.com") || email.Contains("manager"))
            return "MANAGER";

        // Default to TELLER
        return "TELLER";
    }

    // Helper method to determine branch based on email
    private string DetermineBranchFromEmail(string email)
    {
        if (string.IsNullOrEmpty(email)) return "B01";

        // You can implement more sophisticated logic here
        // For now, assign based on email domain or default to B01
        if (email.Contains("hq") || email.Contains("admin"))
            return "HQ";

        return "B01"; // Default branch
    }
}

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}

public class GoogleLoginRequest
{
    public string Credential { get; set; }
}

public class MicrosoftLoginRequest
{
    public string IdToken { get; set; }
    public string AccessToken { get; set; }
}
