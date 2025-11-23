# AppProviders - Provider Wrapper Component

## Overview
The `AppProviders` component consolidates all application context providers into a single, clean wrapper component. This improves code organization and makes the provider hierarchy clear and maintainable.

## Benefits

### ✅ Clean Code
- **Single import** instead of multiple provider imports
- **Reduced nesting** in main.tsx
- **Clear hierarchy** with documentation

### ✅ Maintainability
- **Centralized** provider management
- **Easy to add** new providers
- **Clear order** of provider nesting

### ✅ Reusability
- Can be used in **tests**
- Can be used in **Storybook**
- Can be used in **standalone apps**

## Usage

### main.tsx (After)
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProviders } from './providers/AppProviders';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
```

### main.tsx (Before)
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import App from './App';
import { QMSProvider } from './stores/QMSContext';
import { AuthProvider } from './stores/AuthContext';
import { BranchProvider } from './stores/BranchContext';
import { CategoryProvider } from './stores/CategoryContext';
import { msalConfig } from './config/msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
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
  </React.StrictMode>
);
```

**Result: 18 lines → 6 lines (67% reduction!)**

## Provider Hierarchy

The providers are nested in this specific order:

```
MsalProvider (Microsoft Authentication)
└── BrowserRouter (React Router)
    └── AuthProvider (User authentication state)
        └── BranchProvider (Branch data from API)
            └── CategoryProvider (Service categories from API)
                └── QMSProvider (Queue management state)
                    └── App (Your application)
```

### Why This Order?

1. **MsalProvider** - Must be outermost for authentication
2. **BrowserRouter** - Routing needs to be available everywhere
3. **AuthProvider** - User auth needed before data fetching
4. **BranchProvider** - Branch data needed for filtering
5. **CategoryProvider** - Service categories needed for tickets
6. **QMSProvider** - Queue state depends on all above

## Adding New Providers

To add a new provider:

1. Import the provider in `AppProviders.tsx`
2. Add it to the hierarchy in the appropriate position
3. Update the documentation comment

### Example: Adding ToastProvider

```tsx
import { ToastProvider } from '../components/ui';

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <AuthProvider>
          <BranchProvider>
            <CategoryProvider>
              <QMSProvider>
                <ToastProvider>  {/* New provider */}
                  {children}
                </ToastProvider>
              </QMSProvider>
            </CategoryProvider>
          </BranchProvider>
        </AuthProvider>
      </BrowserRouter>
    </MsalProvider>
  );
};
```

## Testing

Use `AppProviders` in tests to provide all necessary context:

```tsx
import { render } from '@testing-library/react';
import { AppProviders } from './providers/AppProviders';
import MyComponent from './MyComponent';

test('renders component', () => {
  render(
    <AppProviders>
      <MyComponent />
    </AppProviders>
  );
});
```

## Storybook

Use in Storybook decorators:

```tsx
import { AppProviders } from '../providers/AppProviders';

export const decorators = [
  (Story) => (
    <AppProviders>
      <Story />
    </AppProviders>
  ),
];
```

## Available Contexts

When wrapped with `AppProviders`, components have access to:

### Authentication
```tsx
import { useAuth } from './stores/AuthContext';

const { user, login, logout } = useAuth();
```

### Branches
```tsx
import { useBranches } from './stores/BranchContext';

const { branches, loading, error, refreshBranches } = useBranches();
```

### Categories
```tsx
import { useCategories } from './stores/CategoryContext';

const { categories, loading, error, refreshCategories } = useCategories();
```

### Queue Management
```tsx
import { useQMS } from './stores/QMSContext';

const { tickets, counters, addTicket, updateTicket } = useQMS();
```

### Routing
```tsx
import { useNavigate, useLocation } from 'react-router-dom';

const navigate = useNavigate();
const location = useLocation();
```

## Best Practices

### ✅ DO
- Keep providers in order of dependency
- Document why providers are in specific order
- Add new providers to AppProviders, not main.tsx
- Use AppProviders in tests and Storybook

### ❌ DON'T
- Add providers directly to main.tsx
- Change provider order without understanding dependencies
- Nest providers outside of AppProviders
- Create multiple provider wrapper components

## File Structure

```
src/
├── providers/
│   └── AppProviders.tsx    # All providers in one place
├── stores/
│   ├── AuthContext.tsx     # Authentication context
│   ├── BranchContext.tsx   # Branch data context
│   ├── CategoryContext.tsx # Category data context
│   └── QMSContext.tsx      # Queue management context
└── main.tsx                # Clean entry point
```

## Migration Guide

### Step 1: Create AppProviders
Create `src/providers/AppProviders.tsx` with all providers.

### Step 2: Update main.tsx
Replace nested providers with single `<AppProviders>` wrapper.

### Step 3: Test
Ensure all contexts are still accessible throughout the app.

## Troubleshooting

### Context not available
**Problem:** `useContext` returns undefined

**Solution:** Ensure the provider is included in `AppProviders.tsx`

### Wrong provider order
**Problem:** Data not loading correctly

**Solution:** Check provider order - dependencies should be outer

### MSAL errors
**Problem:** Authentication not working

**Solution:** Ensure `MsalProvider` is the outermost provider

## Summary

The `AppProviders` component:
- ✅ Simplifies main.tsx from 30+ lines to ~10 lines
- ✅ Makes provider hierarchy clear and documented
- ✅ Centralizes provider management
- ✅ Improves testability
- ✅ Makes adding new providers easy

**Before:** Nested provider hell in main.tsx
**After:** Clean, documented, maintainable provider wrapper
