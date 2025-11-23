# Branch Management

## Overview
Branches are now loaded dynamically from the API instead of being hardcoded.

## Usage

### Using the useBranches Hook

```tsx
import { useBranches } from '../stores/BranchContext';

function MyComponent() {
  const { branches, loading, error, refreshBranches } = useBranches();

  if (loading) return <div>Loading branches...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {branches.map(branch => (
        <div key={branch.id}>
          <h3>{branch.name}</h3>
          <p>{branch.address}</p>
        </div>
      ))}
    </div>
  );
}
```

### API Endpoint
- **GET** `/api/branches` - Returns list of all branches
- **Response Format**:
```json
[
  {
    "id": "HQ",
    "name": "Headquarters",
    "address": "123 Bank Street",
    "isActive": true
  }
]
```

### Fallback Behavior
If the API fails to load, the system will automatically fallback to hardcoded branches defined in `src/config/constants.ts`.

### Migration Guide

**Before (Hardcoded):**
```tsx
import { BRANCHES } from '../config/constants';

function MyComponent() {
  return (
    <select>
      {BRANCHES.map(branch => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
  );
}
```

**After (Dynamic from API):**
```tsx
import { useBranches } from '../stores/BranchContext';

function MyComponent() {
  const { branches, loading } = useBranches();

  if (loading) return <div>Loading...</div>;

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
1. ✅ **Dynamic Updates** - Branches can be added/removed without code changes
2. ✅ **Centralized Management** - Managed through BranchManagement admin page
3. ✅ **Automatic Sync** - All components use the same data source
4. ✅ **Fallback Safety** - Still works if API is unavailable
