# Feature-Centric Architecture

## 📁 New Structure Overview

The frontend has been refactored from a component-based structure to a **feature-centric architecture**. Each feature is self-contained with its own components, hooks, and business logic.

```
src/features/
├── counter-operations/          # 🏦 Counter Terminal Operations
│   ├── CounterTerminalPage.tsx
│   ├── session-control/         # Counter selection & status
│   ├── queue-processing/        # Queue stats & history
│   ├── transaction-handling/    # Ticket actions (call, complete, transfer)
│   ├── customer-insight/        # Customer info & remarks
│   └── customer-facing-screen/  # Display screen for customers
│
├── ticketing/                   # 🎫 Ticket Issuance
│   └── issue-ticket/
│       ├── KioskPage.tsx
│       └── components/
│           ├── BranchSelection.tsx
│           ├── WelcomeScreen.tsx
│           ├── ServiceSelection.tsx
│           └── PrintingScreen.tsx
│
├── queue-display/               # 📺 Queue Display Board
│   └── main-board/
│       └── MainDisplayPage.tsx
│
├── customer-feedback/           # ⭐ Customer Feedback
│   └── rating-terminal/
│       └── FeedbackPage.tsx
│
├── authentication/              # 🔐 User Authentication
│   ├── login/
│   │   └── LoginPage.tsx
│   └── user-profile/
│       └── UserProfile.tsx
│
└── administration/              # ⚙️ Admin & Management
    ├── dashboard/
    │   └── DashboardPage.tsx
    ├── reports/
    │   └── ReportsPage.tsx
    └── resources/
        ├── users/
        │   └── UserManagementPage.tsx
        ├── branches/
        │   └── BranchManagementPage.tsx
        ├── services/
        │   └── ServiceManagementPage.tsx
        └── counters/
            └── CounterManagementPage.tsx
```

## 🎯 Design Principles

### 1. Feature-First Organization
Each feature is a **self-contained module** with:
- **Components** - UI elements specific to the feature
- **Hooks** - Business logic and state management
- **Types** - Feature-specific type definitions (if needed)
- **Utils** - Helper functions (if needed)

### 2. Clear Separation of Concerns
```
counter-operations/
├── session-control/          # 🟢 Logic: Counter selection, Online/Offline
├── queue-processing/         # 📋 Logic: Queue stats, History sidebar
├── transaction-handling/     # ⚡ Logic: Call, Recall, Complete, Transfer
└── customer-insight/         # 👤 Logic: Customer info, Remarks
```

Each sub-feature handles **one specific business process**.

### 3. Composable Architecture
Main pages compose sub-features:

```tsx
// CounterTerminalPage.tsx
export const CounterTerminalPage: React.FC = () => {
  // Session control
  const { selectedCounter, isOnline, toggleStatus } = useCounterSession();
  
  // Queue processing
  const { completedCount, waitingCount } = useQueueStats(selectedCounter);
  
  // Transaction handling
  const { callNext, complete, transfer } = useTicketActions(selectedCounter);
  
  // Customer insight
  const { customerData, addRemark } = useCustomerData(currentTicket);

  return (
    <div>
      <CounterHeader {...sessionProps} />
      <CurrentTicketDisplay ticket={currentTicket} />
      <TicketActionPanel {...actionProps} />
      <CustomerInfoPanel {...customerProps} />
      <ServiceHistorySidebar {...historyProps} />
    </div>
  );
};
```

## 📦 Feature Exports

Each feature has an `index.ts` that exports its public API:

```typescript
// features/counter-operations/index.ts
export { CounterTerminalPage } from './CounterTerminalPage';
export { CounterDisplay } from './customer-facing-screen/CounterDisplay';

// features/ticketing/index.ts
export { KioskPage } from './issue-ticket/KioskPage';

// features/administration/index.ts
export { DashboardPage } from './dashboard/DashboardPage';
export { UserManagementPage } from './resources/users/UserManagementPage';
// ... etc
```

## 🔄 Migration from Old Structure

### Before (Component-based)
```
src/
├── features/
│   ├── counter/
│   │   ├── CounterTerminal.tsx    (600+ lines)
│   │   └── CounterDisplay.tsx
│   ├── queue/
│   │   ├── Kiosk.tsx
│   │   ├── MainDisplay.tsx
│   │   └── FeedbackTerminal.tsx
│   ├── admin/
│   │   ├── AdminPanel.tsx
│   │   ├── UserManagement.tsx
│   │   └── BranchManagement.tsx
│   └── dashboard/
│       └── Dashboard.tsx
```

### After (Feature-centric)
```
src/features/
├── counter-operations/      # Grouped by business domain
│   ├── session-control/
│   ├── queue-processing/
│   ├── transaction-handling/
│   └── customer-insight/
├── ticketing/
├── queue-display/
├── customer-feedback/
├── authentication/
└── administration/
    ├── dashboard/
    ├── reports/
    └── resources/
```

## ✅ Benefits

1. **Better Maintainability**
   - Smaller, focused files (50-150 lines vs 600+ lines)
   - Easy to locate and modify specific functionality
   - Clear responsibility boundaries

2. **Improved Reusability**
   - Hooks can be reused across components
   - Components are more generic and composable
   - Easier to test in isolation

3. **Scalability**
   - New features can be added without affecting existing ones
   - Team members can work on different features independently
   - Easier onboarding for new developers

4. **Type Safety**
   - Better TypeScript inference
   - Clearer prop interfaces
   - Reduced prop drilling

## 🔧 Working with Features

### Adding a New Feature
1. Create feature directory: `src/features/my-feature/`
2. Create sub-features if needed
3. Create hooks for business logic
4. Create components for UI
5. Export public API in `index.ts`
6. Import in `App.tsx`

### Modifying Existing Features
1. Identify the sub-feature to modify
2. Update the relevant hook or component
3. Test in isolation
4. Verify integration with parent page

### Example: Adding a New Action to Counter Terminal
```typescript
// 1. Add to useTicketActions hook
export const useTicketActions = (counterId: string) => {
  // ... existing actions
  
  const myNewAction = useCallback(() => {
    // Implementation
  }, [dependencies]);
  
  return {
    // ... existing actions
    myNewAction,
  };
};

// 2. Use in TicketActionPanel component
export const TicketActionPanel = ({ onMyNewAction }) => {
  return (
    <div>
      {/* ... existing buttons */}
      <button onClick={onMyNewAction}>New Action</button>
    </div>
  );
};

// 3. Wire up in CounterTerminalPage
const { myNewAction } = useTicketActions(selectedCounter);
<TicketActionPanel onMyNewAction={myNewAction} />
```

## 📚 Related Documentation
- [Branch Management](./branch-management.md) - Dynamic branch loading
- [Backend Architecture](./backend_architecture.md) - API structure
- [Requirements](./requirements.md) - Business requirements

## 🎓 Best Practices

1. **Keep hooks focused** - One hook = One responsibility
2. **Compose, don't duplicate** - Reuse existing hooks and components
3. **Export only what's needed** - Keep internal implementation private
4. **Use TypeScript** - Define clear interfaces for props and return types
5. **Document complex logic** - Add comments for business rules
6. **Test in isolation** - Each sub-feature should be testable independently
