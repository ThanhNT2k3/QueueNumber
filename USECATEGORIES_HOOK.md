# useCategories Hook

## Overview
The `useCategories` hook fetches service categories from the API instead of using hardcoded data. This ensures that service definitions are always up-to-date and can be managed from the backend.

## Features
- ✅ **Fetches from API** - No hardcoded data
- ✅ **Auto-sorting** - Sorted by displayOrder
- ✅ **Loading state** - Shows loading indicator
- ✅ **Error handling** - Catches and reports errors
- ✅ **Refetch support** - Manual refresh capability
- ✅ **TypeScript** - Fully typed

## Usage

### Basic Usage
```tsx
import { useCategories } from '../hooks/useCategories';

function MyComponent() {
  const { categories, loading, error } = useCategories();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}
```

### With Refetch
```tsx
function MyComponent() {
  const { categories, loading, refetch } = useCategories();

  return (
    <div>
      <button onClick={refetch}>Refresh Categories</button>
      {categories.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  );
}
```

### Filter Active Only
```tsx
function ServiceSelector() {
  const { categories } = useCategories();
  
  const activeCategories = categories.filter(c => c.isActive);

  return (
    <select>
      {activeCategories.map(category => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
```

## API Response

### Category Interface
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
}
```

### Example Response
```json
[
  {
    "id": "1",
    "name": "Deposit & Withdrawal",
    "description": "Cash deposits and withdrawals",
    "icon": "Wallet",
    "color": "#3B82F6",
    "isActive": true,
    "displayOrder": 1
  },
  {
    "id": "2",
    "name": "Loans & Credit",
    "description": "Loan applications and credit services",
    "icon": "Banknote",
    "color": "#10B981",
    "isActive": true,
    "displayOrder": 2
  }
]
```

## Return Values

| Property | Type | Description |
|----------|------|-------------|
| `categories` | `Category[]` | Array of service categories |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message if any |
| `refetch` | `() => void` | Function to manually refetch |

## Examples

### CurrentTicketDisplay
```tsx
import { useCategories } from '../../../../hooks/useCategories';

export const CurrentTicketDisplay = ({ ticket }) => {
  const { categories } = useCategories();
  
  const serviceName = categories.find(
    c => c.id === ticket.serviceType?.toString()
  )?.name || 'Unknown Service';

  return (
    <div>
      <h2>{ticket.number}</h2>
      <Badge>{serviceName}</Badge>
    </div>
  );
};
```

### TransferModal
```tsx
import { useCategories } from '../../../../hooks/useCategories';

export const TransferModal = ({ isOpen, onConfirm }) => {
  const { categories, loading } = useCategories();
  const [selected, setSelected] = useState('');

  return (
    <Modal isOpen={isOpen}>
      {loading ? (
        <p>Loading services...</p>
      ) : (
        categories
          .filter(c => c.isActive)
          .map(category => (
            <label key={category.id}>
              <input
                type="radio"
                value={category.id}
                checked={selected === category.id}
                onChange={() => setSelected(category.id)}
              />
              {category.name}
            </label>
          ))
      )}
    </Modal>
  );
};
```

### ServiceList
```tsx
function ServiceList() {
  const { categories, loading, error, refetch } = useCategories();

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Alert variant="error">
        {error}
        <Button onClick={refetch}>Retry</Button>
      </Alert>
    );
  }

  return (
    <div>
      <Button onClick={refetch}>Refresh</Button>
      <ul>
        {categories.map(category => (
          <li key={category.id}>
            <strong>{category.name}</strong>
            <p>{category.description}</p>
            <Badge variant={category.isActive ? 'success' : 'neutral'}>
              {category.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Migration Guide

### Before (Hardcoded)
```tsx
import { SERVICES } from '../config/service-definitions';

function MyComponent({ ticket }) {
  const serviceName = SERVICES.find(
    s => s.id === ticket.serviceType
  )?.name;

  return <div>{serviceName}</div>;
}
```

### After (API-based)
```tsx
import { useCategories } from '../hooks/useCategories';

function MyComponent({ ticket }) {
  const { categories } = useCategories();
  
  const serviceName = categories.find(
    c => c.id === ticket.serviceType?.toString()
  )?.name;

  return <div>{serviceName}</div>;
}
```

## Benefits

1. **Dynamic Data** - Services can be added/removed from backend
2. **No Redeployment** - Changes don't require frontend rebuild
3. **Centralized** - Single source of truth (database)
4. **Flexible** - Easy to add new properties
5. **Scalable** - Works with any number of services

## Error Handling

The hook handles errors gracefully:

```tsx
const { categories, error } = useCategories();

if (error) {
  // Show error message
  return <Alert variant="error">{error}</Alert>;
}
```

## Performance

- **Auto-fetch** - Fetches on component mount
- **Cached** - Uses React state (no re-fetch on re-render)
- **Sorted** - Pre-sorted by displayOrder
- **Lightweight** - Minimal API calls

## Backend Integration

### API Endpoint
```
GET /api/category
```

### Response Format
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "icon": "string",
    "color": "string",
    "isActive": boolean,
    "displayOrder": number
  }
]
```

## Tips

1. **Use loading state** - Show spinner while fetching
2. **Handle errors** - Display user-friendly error messages
3. **Filter active** - Only show active categories in UI
4. **Sort by order** - Hook auto-sorts by displayOrder
5. **Refetch when needed** - Use refetch() after updates

## Related

- **useBranches** - Fetch branches from API
- **useCounters** - Fetch counters from API
- **useTickets** - Fetch tickets from API

## Notes

- Categories are sorted by `displayOrder` automatically
- Inactive categories are included but can be filtered
- Hook fetches once per component mount
- Use `refetch()` to manually refresh data
