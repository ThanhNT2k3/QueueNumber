# Domain-Driven Provider Organization

## Overview
The application providers are organized following Domain-Driven Design (DDD) principles, grouping related providers by their domain or responsibility.

## Structure

```
src/providers/
├── index.ts                              # Main exports
├── AppProviders.tsx                      # Main wrapper
├── infrastructure/
│   └── InfrastructureProviders.tsx      # Infrastructure layer
└── domain/
    ├── AuthenticationProviders.tsx       # Authentication domain
    ├── ResourceProviders.tsx             # Resource/master data domain
    └── QueueManagementProviders.tsx      # Queue management domain
```

## Provider Hierarchy

```
InfrastructureProviders (Foundation)
├── MsalProvider (Microsoft Auth)
└── BrowserRouter (Routing)
    │
    └── AuthenticationProviders (Identity & Access)
        └── AuthProvider (User session)
            │
            └── ResourceProviders (Master Data)
                ├── BranchProvider (Branches)
                └── CategoryProvider (Service categories)
                    │
                    └── QueueManagementProviders (Core Business)
                        └── QMSProvider (Queue state)
                            │
                            └── App (Your application)
```

## Domain Layers

### 1. Infrastructure Layer
**Purpose:** Foundational services that don't belong to any specific domain

**Providers:**
- `MsalProvider` - Microsoft Authentication Library
- `BrowserRouter` - React Router navigation

**File:** `infrastructure/InfrastructureProviders.tsx`

```tsx
<InfrastructureProviders>
  {/* MSAL + Router */}
</InfrastructureProviders>
```

### 2. Authentication Domain
**Purpose:** User identity and access management

**Providers:**
- `AuthProvider` - User authentication state and session

**File:** `domain/AuthenticationProviders.tsx`

```tsx
<AuthenticationProviders>
  {/* User auth state */}
</AuthenticationProviders>
```

### 3. Resource Domain
**Purpose:** Master data and reference information

**Providers:**
- `BranchProvider` - Branch locations and info
- `CategoryProvider` - Service categories/types

**File:** `domain/ResourceProviders.tsx`

```tsx
<ResourceProviders>
  {/* Branch + Category data */}
</ResourceProviders>
```

### 4. Queue Management Domain
**Purpose:** Core business logic for queue operations

**Providers:**
- `QMSProvider` - Queue state, tickets, counters

**File:** `domain/QueueManagementProviders.tsx`

```tsx
<QueueManagementProviders>
  {/* Queue business logic */}
</QueueManagementProviders>
```

## Benefits

### ✅ Clear Separation of Concerns
Each provider group has a single, well-defined responsibility.

### ✅ Easy to Understand
Developers can quickly understand what each layer provides.

### ✅ Maintainable
Changes to one domain don't affect others.

### ✅ Testable
Each domain can be tested independently.

### ✅ Scalable
Easy to add new providers to the appropriate domain.

## Usage

### Basic Usage (Recommended)
```tsx
import { AppProviders } from './providers';

root.render(
  <AppProviders>
    <App />
  </AppProviders>
);
```

### Custom Composition (Advanced)
You can compose providers manually if needed:

```tsx
import {
  InfrastructureProviders,
  AuthenticationProviders,
  ResourceProviders,
  QueueManagementProviders
} from './providers';

root.render(
  <InfrastructureProviders>
    <AuthenticationProviders>
      <ResourceProviders>
        <QueueManagementProviders>
          <App />
        </QueueManagementProviders>
      </ResourceProviders>
    </AuthenticationProviders>
  </InfrastructureProviders>
);
```

### Partial Providers (Testing)
Use only what you need for tests:

```tsx
import { ResourceProviders } from './providers';

test('component with resources', () => {
  render(
    <ResourceProviders>
      <MyComponent />
    </ResourceProviders>
  );
});
```

## Adding New Providers

### Step 1: Identify the Domain
Determine which domain the new provider belongs to:
- **Infrastructure?** (routing, auth library, etc.)
- **Authentication?** (user identity, permissions)
- **Resource?** (master data, reference info)
- **Queue Management?** (business logic)

### Step 2: Add to Appropriate Provider Group
Edit the corresponding provider file:

```tsx
// Example: Adding CounterProvider to ResourceProviders
import { CounterProvider } from '../../stores/CounterContext';

export const ResourceProviders = ({ children }) => (
  <BranchProvider>
    <CategoryProvider>
      <CounterProvider>  {/* New provider */}
        {children}
      </CounterProvider>
    </CategoryProvider>
  </BranchProvider>
);
```

### Step 3: Update Documentation
Update this file to reflect the new provider.

## Examples

### Example 1: Adding Theme Provider
Theme is infrastructure-level:

```tsx
// infrastructure/InfrastructureProviders.tsx
import { ThemeProvider } from '../../contexts/ThemeContext';

export const InfrastructureProviders = ({ children }) => (
  <MsalProvider>
    <BrowserRouter>
      <ThemeProvider>  {/* Added here */}
        {children}
      </ThemeProvider>
    </BrowserRouter>
  </MsalProvider>
);
```

### Example 2: Adding Notification Provider
Notifications are cross-cutting, could go in Infrastructure:

```tsx
// infrastructure/InfrastructureProviders.tsx
import { ToastProvider } from '../../components/ui';

export const InfrastructureProviders = ({ children }) => (
  <MsalProvider>
    <BrowserRouter>
      <ToastProvider>  {/* Added here */}
        {children}
      </ToastProvider>
    </BrowserRouter>
  </MsalProvider>
);
```

### Example 3: Adding User Preferences Provider
User preferences belong to Authentication domain:

```tsx
// domain/AuthenticationProviders.tsx
import { UserPreferencesProvider } from '../../stores/UserPreferencesContext';

export const AuthenticationProviders = ({ children }) => (
  <AuthProvider>
    <UserPreferencesProvider>  {/* Added here */}
      {children}
    </UserPreferencesProvider>
  </AuthProvider>
);
```

## Best Practices

### ✅ DO
- Group providers by domain/responsibility
- Keep infrastructure separate from business logic
- Document why providers are in specific domains
- Use AppProviders for the main app
- Use domain providers for testing specific features

### ❌ DON'T
- Mix infrastructure and business logic providers
- Create too many domain groups (keep it simple)
- Add providers directly to main.tsx
- Change provider order without understanding dependencies

## Migration from Flat Structure

### Before (Flat)
```tsx
<MsalProvider>
  <BrowserRouter>
    <AuthProvider>
      <BranchProvider>
        <CategoryProvider>
          <QMSProvider>
            <App />
          </QMSProvider>
        </CategoryProvider>
      </BranchProvider>
    </AuthProvider>
  </BrowserRouter>
</MsalProvider>
```

### After (Domain-Driven)
```tsx
<InfrastructureProviders>
  <AuthenticationProviders>
    <ResourceProviders>
      <QueueManagementProviders>
        <App />
      </QueueManagementProviders>
    </ResourceProviders>
  </AuthenticationProviders>
</InfrastructureProviders>
```

**Benefits:**
- Clear domain boundaries
- Self-documenting structure
- Easier to maintain
- Better testability

## File Organization

```
src/
├── providers/
│   ├── index.ts                          # Exports
│   ├── AppProviders.tsx                  # Main wrapper
│   ├── infrastructure/
│   │   └── InfrastructureProviders.tsx   # Foundation
│   └── domain/
│       ├── AuthenticationProviders.tsx   # Identity
│       ├── ResourceProviders.tsx         # Master data
│       └── QueueManagementProviders.tsx  # Business logic
├── stores/
│   ├── AuthContext.tsx
│   ├── BranchContext.tsx
│   ├── CategoryContext.tsx
│   └── QMSContext.tsx
└── main.tsx                              # Entry point
```

## Summary

The domain-driven provider organization:
- ✅ **Clear structure** - Easy to understand
- ✅ **Separation of concerns** - Each domain is independent
- ✅ **Maintainable** - Changes are localized
- ✅ **Testable** - Test domains independently
- ✅ **Scalable** - Easy to add new providers
- ✅ **Self-documenting** - Structure explains itself

**Before:** Flat provider nesting
**After:** Domain-organized, maintainable architecture
