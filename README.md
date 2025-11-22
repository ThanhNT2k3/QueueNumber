# BankNext QMS

**BankNext QMS** is an enterprise-grade Queue Management System built with **React 19**, **TypeScript**, and **Tailwind CSS**. It simulates a full banking environment connecting customers, tellers, and branch managers.

## 1. Project Overview

**Key Features:**
*   **Multi-Role System:** Kiosk, Main Display, Counter Terminal, Counter Display, Feedback Tablet, and Dashboard.
*   **Smart Priority Logic:** Weighted priority system based on customer segment (VIP/Regular) and service type.
*   **AI Integration:** Uses Google Gemini 2.5 Flash for generating customer insights, greetings, and analyzing queue statistics.
*   **Real-time Updates:** centralized state management using React Context API.

---

## 2. Project Structure

```text
/
├── index.html                  # Root entry, Tailwind Config, Font imports
├── index.tsx                   # React Entry Point
├── App.tsx                     # Main Layout & Role/Route Switching
├── types.ts                    # TypeScript Interfaces & Enums
├── constants.ts                # Static Data (Service definitions, Initial counters)
│
├── contexts/
│   └── QMSContext.tsx          # Global State Management & Business Logic
│
├── services/
│   └── geminiService.ts        # Google GenAI Integration
│
└── components/
    ├── Kiosk.tsx               # Customer Ticket Generation Interface
    ├── MainDisplay.tsx         # Waiting Area TV Screen
    ├── CounterTerminal.tsx     # Teller Control Panel
    ├── CounterDisplay.tsx      # Customer Facing Screen at Counter
    ├── FeedbackTerminal.tsx    # Customer Rating Tablet
    └── Dashboard.tsx           # Manager Analytics View
```

---

## 3. Core Data Models (`types.ts`)

The application relies on strict TypeScript typing to ensure data consistency.

### Key Interfaces
*   **`Ticket`**: The core entity. Contains `id`, `number`, `serviceType`, `status`, `priorityScore`, `recallCount`, and `customer` data.
*   **`Counter`**: Represents a physical teller station. Tracks `status` (ONLINE/OFFLINE), `currentTicketId`, and supported `serviceTags`.
*   **`Customer`**: Mock profile data including `segment` (Diamond/Gold/Regular) used for priority calculation.

### Enums
*   **`ServiceType`**: `DEPOSIT`, `WITHDRAWAL`, `LOAN`, `CONSULTATION`, `VIP`.
*   **`TicketStatus`**: `WAITING`, `CALLED`, `SERVING`, `COMPLETED`, `MISSED`, `TRANSFERRED`.

---

## 4. State Management (`QMSContext.tsx`)

The `QMSProvider` encapsulates all business logic.

### Core Functions

1.  **`createTicket(serviceType)`**:
    *   Generates a ticket number based on the service prefix (e.g., A001).
    *   Calculates `priorityScore` based on customer segment + service weight.

2.  **`callNextTicket(counterId)`**:
    *   Filters tickets compatible with the counter's `serviceTags`.
    *   **Sorting Algorithm:** Sorts primarily by `priorityScore` (Descending), then by `createdTime` (Ascending/FIFO).
    *   Updates status to `CALLED` and assigns `counterId`.
    *   Triggers **Voice Announcement** (Text-to-Speech).

3.  **`recallTicket(ticketId)`**:
    *   Increments `recallCount`.
    *   **Rule:** If `recallCount >= 3`, the ticket is automatically marked as `MISSED`.

4.  **`transferTicket(ticketId, targetService)`**:
    *   Changes the ticket's `serviceType`.
    *   Resets status to `WAITING`.
    *   Preserves the original `priorityScore` to ensure they don't go to the back of the line.

5.  **`submitFeedback(ticketId, rating, tags)`**:
    *   Updates the specific ticket object with CSAT data for KPI tracking.

---

## 5. Components Breakdown

### A. Kiosk (`Kiosk.tsx`)
*   **Purpose:** Walk-in customer ticket generation.
*   **Flow:** Welcome Screen (Language Selection) → Service Selection → Printing Animation.
*   **UI:** High-end banking aesthetic, glassmorphism, CSS animations for slide-in effects.

### B. Main Display (`MainDisplay.tsx`)
*   **Purpose:** Large TV screen for the waiting area.
*   **Layout:** Split screen.
    *   **Left:** Media/Ads + Real-time Financial Ticker (Exchange rates/Stocks).
    *   **Right:** "Now Serving" cards and a "Next in Line" summary.
*   **Behavior:** Auto-refreshes time; highlights the most recently called ticket.

### C. Counter Terminal (`CounterTerminal.tsx`)
*   **Purpose:** Interface for Bank Tellers.
*   **Features:**
    *   **Call Next:** Fetches the highest priority ticket.
    *   **Controls:** Complete, Recall (with limit counter), Transfer (dropdown menu).
    *   **Sidebar:**
        *   **Customer Profile:** Shows segment and history.
        *   **AI Agent:** Uses Gemini to generate a personalized greeting and cross-sell tip.
        *   **Feedback Widget:** Shows real-time rating from the previous customer.

### D. Counter Display (`CounterDisplay.tsx`)
*   **Purpose:** LCD/Tablet facing the customer at the counter.
*   **Layout:** Split Screen.
    *   **Left:** Massive current ticket number + Status (Open/Closed).
    *   **Right (Sidebar):** Total waiting count + Scrollable list of the next 5-10 tickets specific to that counter's queue.
*   **UX:** Visual cues (Pulse animation) when a ticket is called/recalled.

### E. Feedback Terminal (`FeedbackTerminal.tsx`)
*   **Purpose:** iPad/Tablet for customer satisfaction tracking.
*   **Logic:** Automatically detects the `lastServedTicketId` of the associated counter.
*   **UX:** Interactive Star Rating (1-5) -> Tag Selection (e.g., "Friendly Staff", "Long Wait").

### F. Dashboard (`Dashboard.tsx`)
*   **Purpose:** Branch Manager analytics.
*   **Tech:** `recharts` for data visualization.
*   **Features:**
    *   Live Volume Charts.
    *   Staff Performance (KPI).
    *   **AI Manager Insights:** Sends raw stats to Gemini to generate a text-based executive summary.

---

## 6. Services & AI Integration

### `services/geminiService.ts`
Integration with `@google/genai`.

*   **`generateCustomerInsight(ticket)`**:
    *   **Input:** Customer Name, Segment, Service Type, History.
    *   **Output:** A professional greeting script + specific advice.
*   **`analyzeQueueTrends(data)`**:
    *   **Input:** Hourly volume, wait times, CSAT scores.
    *   **Output:** Strategic summary identifying bottlenecks.

---

## 7. Styling & Theming

*   **Framework:** Tailwind CSS.
*   **Configuration (`index.html`):**
    *   **Font:** 'Inter' (Google Fonts).
    *   **Colors:** Custom `brand` palette (Deep Blue/Sky Blue).
    *   **Animations:** Custom Keyframes defined in the script tag:
        *   `fade-in`, `slide-in-left`, `slide-in-right`.
        *   `scroll` (for the financial ticker).
