using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Hubs;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

// Add Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Use SQLite for cross-platform compatibility (works on macOS, Linux, Windows)
    // For production, you can switch to SQL Server by changing UseSqlite to UseSqlServer
    options.UseSqlite(connectionString);
});

// Add SignalR
builder.Services.AddSignalR();

// Add Application Services
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ICounterService, CounterService>();
builder.Services.AddScoped<ITicketHubService, TicketHubService>();
builder.Services.AddScoped<IBranchService, BranchService>();
builder.Services.AddScoped<IServiceTypeService, ServiceTypeService>();
// Silent printing service (server-side). Uses system's printing command (lp) where available.
builder.Services.AddSingleton<IPrintingService, PrintingService>();

// Add Controllers for API
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

// Map SignalR Hub
app.MapHub<TicketHub>("/hub/ticket");

// Map Controllers
app.MapControllers();

app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

// Ensure database is created and seeded (for development only)
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        
        try
        {
            dbContext.Database.EnsureCreated();
            
            // Seed database with sample data
            var seeder = new Server.Data.DatabaseSeeder(
                dbContext,
                scope.ServiceProvider.GetRequiredService<ILogger<Server.Data.DatabaseSeeder>>());
            await seeder.SeedAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}

app.Run();
