# BankNext QMS - Backend Architecture & API Design

## 1. Domain Models (C# Entities)

### 1.1. Ticket
```csharp
public class Ticket
{
    public Guid Id { get; set; }
    public string Number { get; set; } // e.g., "A001"
    public ServiceType ServiceType { get; set; }
    public TicketStatus Status { get; set; } // Waiting, Called, Serving, Completed, Missed, Transferred
    public DateTimeOffset CreatedTime { get; set; }
    public DateTimeOffset? CalledTime { get; set; }
    public DateTimeOffset? CompletedTime { get; set; }
    
    // Foreign Key to Counter (nullable)
    public Guid? CounterId { get; set; }
    public Counter? Counter { get; set; }

    // Customer Info (Embedded or FK)
    public string? CustomerName { get; set; }
    public CustomerSegment CustomerSegment { get; set; } // Regular, Gold, Diamond
    public string? CustomerId { get; set; } // External Core Banking ID

    public int PriorityScore { get; set; }
    public int RecallCount { get; set; }
    public bool IsBooking { get; set; }

    // Feedback
    public int? FeedbackRating { get; set; }
    public string? FeedbackComment { get; set; }
    public string? FeedbackTags { get; set; } // Comma separated or JSON
}
```

### 1.2. Counter
```csharp
public class Counter
{
    public Guid Id { get; set; }
    public string Name { get; set; } // "Counter 1"
    public CounterStatus Status { get; set; } // Online, Offline, Paused
    
    // Current Ticket
    public Guid? CurrentTicketId { get; set; }
    public Ticket? CurrentTicket { get; set; }

    // Supported Services (JSON or bitmask)
    public List<ServiceType> ServiceTags { get; set; } = new();
}
```

### 1.3. Enums
```csharp
public enum ServiceType { Deposit, Withdrawal, Loan, Consultation, Vip }
public enum TicketStatus { Waiting, Called, Serving, Completed, Missed, Transferred }
public enum CustomerSegment { Regular, Gold, Diamond }
public enum CounterStatus { Online, Offline, Paused }
```

---

## 2. API Endpoints (REST)

### 2.1. Tickets (`/api/tickets`)
*   `POST /` - Create Ticket (Kiosk)
    *   Input: `{ serviceType: "DEPOSIT", customerId: "..." }`
    *   Output: `Ticket` object
*   `GET /` - Get all tickets (Dashboard/Monitor)
    *   Query: `?status=WAITING&service=DEPOSIT`
*   `POST /{id}/call` - Call Ticket (Teller)
    *   Input: `{ counterId: "..." }`
    *   Logic: Updates status to CALLED, sets CounterId, Broadcasts SignalR.
*   `POST /{id}/complete` - Complete Ticket (Teller)
    *   Logic: Updates status to COMPLETED, clears Counter.CurrentTicket.
*   `POST /{id}/recall` - Recall Ticket
    *   Logic: Increments RecallCount. If >= 3, marks MISSED.
*   `POST /{id}/transfer` - Transfer Ticket
    *   Input: `{ targetService: "LOAN" }`
    *   Logic: Reset status to WAITING, update ServiceType, Keep Priority.
*   `POST /{id}/feedback` - Submit Feedback
    *   Input: `{ rating: 5, tags: ["Friendly"] }`

### 2.2. Counters (`/api/counters`)
*   `GET /` - List all counters
*   `POST /` - Create/Register counter
*   `PUT /{id}/status` - Update status (Online/Offline)
    *   Input: `{ status: "ONLINE" }`

### 2.3. Auth (`/api/auth`)
*   `GET /login` - Redirect to SAML IdP
*   `POST /acs` - SAML Assertion Consumer Service
*   `POST /logout` - SLO

---

## 3. SignalR Hub (`QmsHub`)

### 3.1. Client Methods (Frontend listens to these)
*   `TicketCreated(Ticket ticket)` - When a new ticket is issued.
*   `TicketCalled(Ticket ticket)` - When a ticket is called (Main Display & Counter Display update).
*   `TicketUpdated(Ticket ticket)` - Generic update (completion, transfer).
*   `CounterUpdated(Counter counter)` - When counter status changes.

### 3.2. Server Methods (Frontend calls these - Optional, mostly REST used)
*   `JoinGroup(string groupName)` - e.g., "MainDisplay", "Counter-{id}"

---

## 4. SSO SAML2 Strategy

### 4.1. Libraries
*   **`ITfoxtec.Identity.Saml2`**: Lightweight, standard compliant library for .NET.

### 4.2. Flow
1.  **User** clicks "Login with SSO" on Frontend.
2.  **Frontend** redirects to Backend `/api/auth/login`.
3.  **Backend** constructs SAML AuthnRequest and redirects to **IdP** (e.g., Azure AD).
4.  **User** authenticates at IdP.
5.  **IdP** posts SAML Response to Backend `/api/auth/acs`.
6.  **Backend** validates signature, extracts claims (NameID, Role).
7.  **Backend** issues a **JWT** (Access Token) and redirects back to Frontend with token (e.g., `?token=xyz`).
8.  **Frontend** stores JWT and uses it for subsequent API calls.

### 4.3. Configuration
*   `appsettings.json`:
    ```json
    "Saml2": {
      "IdPMetadataUrl": "https://login.microsoftonline.com/.../federationmetadata.xml",
      "Issuer": "http://banknext-qms-api",
      "SignatureAlgorithm": "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"
    }
    ```
