using BankNext.QMS.Api.Hubs;
using BankNext.QMS.Api.Services;
using BankNext.QMS.Infrastructure.Data;
using BankNext.QMS.Application.Interfaces;
using BankNext.QMS.Application.Services;
using BankNext.QMS.Infrastructure.Repositories;
using ITfoxtec.Identity.Saml2;
using ITfoxtec.Identity.Saml2.MvcCore;
using ITfoxtec.Identity.Saml2.Schemas.Metadata;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<QmsDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=qms.db"));

// SignalR
builder.Services.AddSignalR();

// Application Services
builder.Services.AddScoped<TicketService>();

// Repositories
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ICounterRepository, CounterRepository>();
builder.Services.AddScoped<ICounterAssignmentHistoryRepository, CounterAssignmentHistoryRepository>();

// Infrastructure Services
builder.Services.AddScoped<INotificationService, SignalRNotificationService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder
                .WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

// SAML2
builder.Services.Configure<Saml2Configuration>(builder.Configuration.GetSection("Saml2"));
// builder.Services.AddSaml2();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Disable HTTPS redirection in development for easier frontend integration
// app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<QmsHub>("/qmsHub");

// Ensure DB Created and Seeded
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<QmsDbContext>();
    db.Database.EnsureCreated();
    await DbSeeder.SeedAsync(db);
}

app.Run();
