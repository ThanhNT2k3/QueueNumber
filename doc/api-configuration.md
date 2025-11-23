# API Configuration Migration

## Summary
All hardcoded API URLs have been migrated to use centralized configuration from `src/config/constants.ts`.

## Changes Made

### 1. Configuration Constants
**File:** `src/config/constants.ts`

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5257/api';
export const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5257/qmsHub';
```

These constants support environment variables for different deployment environments.

### 2. Files Updated

#### Core Stores
- ✅ `src/stores/QMSContext.tsx` - Replaced `API_URL` and `HUB_URL` with `API_BASE_URL` and `SIGNALR_HUB_URL`
- ✅ `src/stores/AuthContext.tsx` - Replaced hardcoded login URL with `API_BASE_URL`
- ✅ `src/stores/BranchContext.tsx` - Uses `API_BASE_URL` for branch API calls

#### Administration Features
- ✅ `src/features/administration/dashboard/DashboardPage.tsx`
- ✅ `src/features/administration/resources/branches/BranchManagementPage.tsx`
- ✅ `src/features/administration/resources/counters/CounterManagementPage.tsx`

### 3. Branch Data Migration

**Before:** Hardcoded `BRANCHES` array in `constants.ts`

**After:** Dynamic loading from API via `useBranches()` hook

#### Components Migrated
- ✅ `src/features/ticketing/issue-ticket/components/BranchSelection.tsx`
- ✅ `src/features/ticketing/issue-ticket/KioskPage.tsx`

#### Components Still Using Hardcoded BRANCHES (To Migrate)
- ⏳ `src/features/authentication/login/LoginPage.tsx`
- ⏳ `src/features/administration/resources/users/UserManagementPage.tsx`
- ⏳ `src/features/administration/resources/branches/BranchManagementPage.tsx` (uses both)

## Environment Configuration

### Development (.env.development)
```env
VITE_API_URL=http://localhost:5257/api
VITE_SIGNALR_URL=http://localhost:5257/qmsHub
```

### Production (.env.production)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SIGNALR_URL=https://api.yourdomain.com/qmsHub
```

### Staging (.env.staging)
```env
VITE_API_URL=https://staging-api.yourdomain.com/api
VITE_SIGNALR_URL=https://staging-api.yourdomain.com/qmsHub
```

## Usage Examples

### Using API_BASE_URL
```typescript
import { API_BASE_URL } from '../config/constants';

// Fetch data
const response = await fetch(`${API_BASE_URL}/tickets`);

// POST request
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Using useBranches Hook
```typescript
import { useBranches } from '../stores/BranchContext';

function MyComponent() {
  const { branches, loading, error, refreshBranches } = useBranches();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <select>
      {branches.map(branch => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
  );
}
```

## Benefits

### 1. **Environment Flexibility**
- Easy to switch between dev/staging/production
- No code changes needed for deployment
- Supports different API endpoints per environment

### 2. **Centralized Configuration**
- Single source of truth for API URLs
- Easy to update across entire application
- Reduces maintenance overhead

### 3. **Dynamic Data Loading**
- Branches loaded from API instead of hardcoded
- Real-time updates without code deployment
- Managed through admin interface

### 4. **Type Safety**
- TypeScript ensures correct usage
- Compile-time error detection
- Better IDE autocomplete

## Migration Checklist

- [x] Create centralized constants
- [x] Migrate QMSContext
- [x] Migrate AuthContext
- [x] Create BranchContext
- [x] Migrate BranchSelection component
- [x] Migrate KioskPage
- [x] Migrate administration pages
- [ ] Migrate LoginPage
- [ ] Migrate UserManagementPage
- [ ] Create .env files for different environments
- [ ] Update deployment documentation

## Next Steps

1. **Complete Branch Migration**
   - Migrate remaining components using `BRANCHES` to `useBranches()`
   - Remove deprecated `BRANCHES` export from constants

2. **Environment Setup**
   - Create `.env.development`, `.env.staging`, `.env.production`
   - Configure CI/CD to use appropriate env files

3. **Testing**
   - Test with different API endpoints
   - Verify fallback behavior when API is unavailable
   - Test branch loading and caching

4. **Documentation**
   - Update deployment guide
   - Document environment variable setup
   - Create troubleshooting guide

## Troubleshooting

### Issue: API calls failing
**Solution:** Check that `VITE_API_URL` is set correctly in your `.env` file

### Issue: Branches not loading
**Solution:** 
1. Check backend API is running
2. Verify `/api/branches` endpoint is accessible
3. Check browser console for errors
4. Falls back to hardcoded branches if API fails

### Issue: SignalR not connecting
**Solution:** Check that `VITE_SIGNALR_URL` matches your backend SignalR hub URL

## Related Documentation
- [Feature Architecture](./feature-architecture.md)
- [Branch Management](./branch-management.md)
- [Backend Architecture](./backend_architecture.md)
