# Queue Management System (QMS)

A multi-branch, multi-counter queue management system built with Blazor Server (.NET 8), Entity Framework Core, and SignalR for real-time updates.

## Prerequisites

- .NET 8 SDK or later
- SQL Server (LocalDB, SQL Server Express, or full SQL Server)
- Visual Studio 2022, VS Code, or Rider (optional)

## Quick Start

### 1. Build the Project

```bash
# From the project root directory
dotnet build
```

### 2. Configure Database

The project uses SQL Server LocalDB by default. The connection string is configured in `src/Server/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=QueueManagementSystem;Trusted_Connection=true;MultipleActiveResultSets=true"
}
```

**For SQL Server Express or Full SQL Server**, update the connection string:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=QueueManagementSystem;Trusted_Connection=true;MultipleActiveResultSets=true"
}
```

### 3. Run the Application

```bash
# From the project root directory
dotnet run --project src/Server/Server.csproj
```

Or navigate to the Server directory:
```bash
cd src/Server
dotnet run
```

The application will start and be available at:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`

### 4. Access the Application

Open your browser and navigate to:
- **Home**: `https://localhost:5001`
- **Kiosk (Ticket Generation)**: `https://localhost:5001/kiosk`
- **Display Screen**: `https://localhost:5001/display`
- **Counter**: `https://localhost:5001/counter/1`
- **Admin Dashboard**: `https://localhost:5001/admin`

## Database Setup

The database will be automatically created on first run (development mode). To manually create/update the database:

```bash
# Navigate to Server directory
cd src/Server

# Create initial migration (if needed)
dotnet ef migrations add InitialCreate --project ../..

# Apply migrations
dotnet ef database update --project ../..
```

## Project Structure

```
ai_workflow/
├── src/
│   ├── Server/          # Blazor Server application
│   │   ├── Pages/       # Razor pages
│   │   ├── Services/     # Business logic services
│   │   ├── Controllers/  # API controllers
│   │   ├── Hubs/         # SignalR hubs
│   │   └── Data/         # EF Core DbContext
│   └── Shared/           # Shared models library
├── docs/                 # Project documentation
└── QueueManagementSystem.sln
```

## Features

### Sprint 1 - Foundation ✅
- Database models (Ticket, Counter, Branch, ServiceType)
- Core services (TicketService, CounterService)
- SignalR Hub for real-time communication
- REST API endpoints

### Sprint 2 - Kiosk & Counter UI ✅
- Kiosk page for ticket generation
- Counter page for staff operations
- Display screen for public viewing
- Real-time updates via SignalR

### Sprint 3 - Admin Panel ✅
- Branch management (CRUD)
- Counter management (CRUD)
- Service Type management (CRUD)
- Real-time dashboard with statistics

## Development

### Running in Development Mode

```bash
dotnet run --project src/Server/Server.csproj
```

The app will:
- Auto-create database on first run
- Enable hot reload for Blazor components
- Show detailed error pages

### Building for Production

```bash
dotnet build --configuration Release --project src/Server/Server.csproj
```

### Publishing

```bash
dotnet publish --configuration Release --project src/Server/Server.csproj --output ./publish
```

## Troubleshooting

### Database Connection Issues

1. **LocalDB not found**: Install SQL Server Express with LocalDB, or update connection string to use SQL Server
2. **Database doesn't exist**: The app will auto-create it in development mode
3. **Permission errors**: Ensure SQL Server allows trusted connections

### Port Already in Use

If port 5000 or 5001 is in use, update `Properties/launchSettings.json`:

```json
"applicationUrl": "http://localhost:5002;https://localhost:5003"
```

## Next Steps

See `docs/progress.md` for completed features and `docs/planning.md` for upcoming sprints.

## Documentation

- **Requirements**: `docs/requirements.md`
- **Architecture**: `docs/architecture.md`
- **Planning**: `docs/planning.md`
- **Progress**: `docs/progress.md`
