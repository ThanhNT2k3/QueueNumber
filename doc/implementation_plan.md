# Implementation Plan - BankNext QMS Backend

## Goal
Build a robust .NET 6 Backend API for the BankNext QMS system to replace the current client-side simulation. The backend will handle business logic, data persistence, real-time updates via SignalR, and secure authentication using SSO SAML2.

## User Review Required
> [!IMPORTANT]
> **SSO SAML2 Integration**: This requires an Identity Provider (IdP) like Azure AD, ADFS, or Keycloak. For development, we will implement a structure that supports SAML2 but may use a mock auth provider or a developer mode if no IdP is available immediately.
> **Database**: We will use **SQLite** for local development ease, but the solution will be configured for easy switch to SQL Server/PostgreSQL.

## Proposed Changes

### 1. Backend Solution Setup (.NET 6)
Create a new solution `BankNext.QMS.sln` with the following projects:
*   **`BankNext.QMS.Api`**: Web API project (Controllers, SignalR Hubs, Startup).
*   **`BankNext.QMS.Core`**: Domain entities, Interfaces, DTOs.
*   **`BankNext.QMS.Infrastructure`**: EF Core context, Repositories, External Services (Gemini).

### 2. Domain Models & Database (`BankNext.QMS.Core` & `Infrastructure`)
Define entities matching the frontend `types.ts`:
*   `Ticket`: Id, Number, ServiceType, Status, PriorityScore, CreatedTime, etc.
*   `Counter`: Id, Name, Status, CurrentTicketId, ServiceTags.
*   `ServiceDefinition`: Configuration for services.
*   `Customer`: Basic profile info.

#### [NEW] Database Context
*   Implement `QmsDbContext` using Entity Framework Core.
*   Configure migrations.

### 3. Real-time Communication (SignalR)
#### [NEW] `QmsHub`
*   **Methods**:
    *   `JoinGroup(counterId/role)`
    *   `SendTicketUpdate(ticket)`
    *   `SendCounterUpdate(counter)`
*   **Events**:
    *   `TicketCreated`, `TicketCalled`, `TicketUpdated`.
    *   `CounterStatusChanged`.

### 4. API Implementation (`BankNext.QMS.Api`)
#### [NEW] Controllers
*   `AuthController`: Handle SAML2 Login/Callback/Logout.
*   `TicketsController`: CRUD operations, Call, Complete, Transfer, Recall.
*   `CountersController`: Status management.
*   `DashboardController`: Stats and Analytics.

### 5. SSO SAML2 Authentication
*   Use `ITfoxtec.Identity.Saml2` or standard ASP.NET Core Authentication.
*   Configure `Saml2Configuration` in `Program.cs`.
*   Implement Login endpoint to redirect to IdP.
*   Implement Assertion Consumer Service (ACS) endpoint to handle IdP response and issue JWT.

### 6. Frontend Integration
#### [MODIFY] `contexts/QMSContext.tsx`
*   Replace `useState` local storage with API calls.
*   Integrate `@microsoft/signalr` client.
*   Listen for Hub events to update `tickets` and `counters` state.

## Verification Plan

### Automated Tests
*   **Unit Tests**: Test Priority Calculation logic in Backend.
*   **Integration Tests**: Test API endpoints using `Postman` or `curl`.

### Manual Verification
1.  **Start Backend**: Run `dotnet run` in API project.
2.  **Start Frontend**: Run `npm run dev`.
3.  **Kiosk Flow**: Create a ticket -> Verify it appears in Backend DB and Dashboard via SignalR.
4.  **Teller Flow**: Login (Mock SSO) -> Call Ticket -> Verify Status update on Main Display.
5.  **Real-time**: Open two browser windows (Teller and Display). Action in Teller should instantly reflect on Display.
