# Migration to Zustand - Implementation Plan

## Why Zustand?

### ✅ Benefits over Context API

1. **Less Boilerplate**
   - No Provider components needed
   - No useContext hooks
   - Direct store access

2. **Better Performance**
   - No unnecessary re-renders
   - Automatic optimization
   - Selective subscriptions

3. **Simpler Code**
   - Less nesting
   - Cleaner syntax
   - Easier to test

4. **Developer Experience**
   - Better TypeScript support
   - DevTools integration
   - Middleware support

### 📊 Comparison

#### Context API (Current)
```tsx
// Define Context
const BranchContext = createContext<BranchContextType | undefined>(undefined);

// Provider Component (50+ lines)
export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  // ... more state and logic
  
  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};

// Hook
export const useBranches = () => {
  const context = useContext(BranchContext);
  if (!context) throw new Error('...');
  return context;
};

// Usage in main.tsx
<BranchProvider>
  <App />
</BranchProvider>
```

#### Zustand (Proposed)
```tsx
// Store (20 lines)
export const useBranchStore = create<BranchStore>((set) => ({
  branches: [],
  loading: true,
  error: null,
  
  fetchBranches: async () => {
    set({ loading: true });
    const data = await fetch('/api/branches');
    set({ branches: data, loading: false });
  },
  
  refreshBranches: async () => {
    // ... refresh logic
  }
}));

// Usage - NO Provider needed!
const { branches, loading } = useBranchStore();
```

**Result: 50+ lines → 20 lines (60% reduction!)**

---

## Migration Plan

### Phase 1: Setup Zustand
1. Install Zustand
2. Create store structure
3. Add TypeScript types

### Phase 2: Migrate Stores (One by One)
1. ✅ BranchStore
2. ✅ CategoryStore
3. ✅ AuthStore
4. ✅ QMSStore

### Phase 3: Remove Providers
1. Remove Provider components
2. Update main.tsx
3. Clean up old Context files

### Phase 4: Testing & Optimization
1. Test all features
2. Add DevTools
3. Add persistence (if needed)

---

## Proposed Store Structure

```
src/stores/
├── index.ts                    # Export all stores
├── useBranchStore.ts          # Branch data
├── useCategoryStore.ts        # Service categories
├── useAuthStore.ts            # Authentication
└── useQMSStore.ts             # Queue management
```

---

## Implementation Examples

### 1. Branch Store (Zustand)

```typescript
// src/stores/useBranchStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { API_BASE_URL } from '../config/constants';

interface Branch {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

interface BranchStore {
  // State
  branches: Branch[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchBranches: () => Promise<void>;
  refreshBranches: () => Promise<void>;
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, branch: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
}

export const useBranchStore = create<BranchStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      branches: [],
      loading: false,
      error: null,

      // Fetch branches
      fetchBranches: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/branches`);
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          set({ branches: data, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false 
          });
        }
      },

      // Refresh
      refreshBranches: async () => {
        await get().fetchBranches();
      },

      // Add branch
      addBranch: (branch) => {
        set((state) => ({ 
          branches: [...state.branches, branch] 
        }));
      },

      // Update branch
      updateBranch: (id, updates) => {
        set((state) => ({
          branches: state.branches.map(b => 
            b.id === id ? { ...b, ...updates } : b
          )
        }));
      },

      // Delete branch
      deleteBranch: (id) => {
        set((state) => ({
          branches: state.branches.filter(b => b.id !== id)
        }));
      }
    }),
    { name: 'BranchStore' }
  )
);
```

### 2. Category Store (Zustand)

```typescript
// src/stores/useCategoryStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { API_BASE_URL } from '../config/constants';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
}

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  fetchCategories: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>()(
  devtools(
    (set) => ({
      categories: [],
      loading: false,
      error: null,

      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/category`);
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          const sorted = data.sort((a: Category, b: Category) => 
            a.displayOrder - b.displayOrder
          );
          set({ categories: sorted, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false 
          });
        }
      },

      refreshCategories: async () => {
        await useCategoryStore.getState().fetchCategories();
      }
    }),
    { name: 'CategoryStore' }
  )
);
```

### 3. Auth Store (Zustand)

```typescript
// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId?: string;
  assignedCounterId?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        loading: false,

        login: async (email, password) => {
          set({ loading: true });
          try {
            // Login logic
            const user = await loginAPI(email, password);
            set({ user, isAuthenticated: true, loading: false });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        logout: () => {
          set({ user: null, isAuthenticated: false });
        },

        setUser: (user) => {
          set({ user, isAuthenticated: true });
        }
      }),
      { name: 'auth-storage' }
    ),
    { name: 'AuthStore' }
  )
);
```

---

## Usage Examples

### Before (Context API)
```tsx
import { useBranches } from '../stores/BranchContext';

function MyComponent() {
  const { branches, loading, refreshBranches } = useBranches();
  
  return (
    <div>
      {loading ? 'Loading...' : branches.map(b => <div>{b.name}</div>)}
      <button onClick={refreshBranches}>Refresh</button>
    </div>
  );
}
```

### After (Zustand)
```tsx
import { useBranchStore } from '../stores/useBranchStore';

function MyComponent() {
  const { branches, loading, refreshBranches } = useBranchStore();
  
  return (
    <div>
      {loading ? 'Loading...' : branches.map(b => <div>{b.name}</div>)}
      <button onClick={refreshBranches}>Refresh</button>
    </div>
  );
}
```

**Same API, but NO Provider needed!**

### Selective Subscription (Performance)
```tsx
// Only re-render when branches change, not loading
const branches = useBranchStore((state) => state.branches);

// Multiple selectors
const { branches, error } = useBranchStore(
  (state) => ({ branches: state.branches, error: state.error })
);
```

---

## Main.tsx Comparison

### Before (Context API)
```tsx
import { BranchProvider } from './stores/BranchContext';
import { CategoryProvider } from './stores/CategoryContext';
import { AuthProvider } from './stores/AuthContext';
import { QMSProvider } from './stores/QMSContext';

root.render(
  <AuthProvider>
    <BranchProvider>
      <CategoryProvider>
        <QMSProvider>
          <App />
        </QMSProvider>
      </CategoryProvider>
    </BranchProvider>
  </AuthProvider>
);
```

### After (Zustand)
```tsx
// NO PROVIDERS NEEDED!
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

**Result: Clean, simple, no nesting!**

---

## Advanced Features

### 1. DevTools Integration
```typescript
import { devtools } from 'zustand/middleware';

export const useBranchStore = create<BranchStore>()(
  devtools(
    (set) => ({ /* ... */ }),
    { name: 'BranchStore' }
  )
);
```

### 2. Persistence
```typescript
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({ /* ... */ }),
    { name: 'auth-storage' }
  )
);
```

### 3. Immer for Immutability
```typescript
import { immer } from 'zustand/middleware/immer';

export const useQMSStore = create<QMSStore>()(
  immer((set) => ({
    tickets: [],
    addTicket: (ticket) => set((state) => {
      state.tickets.push(ticket); // Mutable syntax!
    })
  }))
);
```

---

## Migration Steps

### Step 1: Install Zustand
```bash
npm install zustand
```

### Step 2: Create First Store
Start with BranchStore (simplest)

### Step 3: Update Components
Replace `useBranches()` with `useBranchStore()`

### Step 4: Remove Provider
Remove `<BranchProvider>` from main.tsx

### Step 5: Repeat for Other Stores
Migrate one store at a time

### Step 6: Clean Up
Delete old Context files

---

## Testing

### Before (Context)
```tsx
test('component', () => {
  render(
    <BranchProvider>
      <MyComponent />
    </BranchProvider>
  );
});
```

### After (Zustand)
```tsx
test('component', () => {
  // No provider needed!
  render(<MyComponent />);
  
  // Or mock the store
  useBranchStore.setState({ branches: mockData });
});
```

---

## Recommendation

✅ **YES, migrate to Zustand!**

### Benefits:
- 60% less code
- Better performance
- Simpler testing
- No provider hell
- Better DevTools
- Easier to maintain

### Timeline:
- **Week 1:** Setup + BranchStore + CategoryStore
- **Week 2:** AuthStore + QMSStore
- **Week 3:** Testing + Cleanup

### Risk: Low
- Can migrate incrementally
- Zustand and Context can coexist
- Easy to rollback if needed

---

## Next Steps

1. **Approve migration?**
2. **Install Zustand**
3. **Start with BranchStore**
4. **Migrate one by one**

Would you like me to start the migration?
