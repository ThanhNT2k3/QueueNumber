# Frontend Architecture - Feature-Based Structure

## 📁 Cấu trúc thư mục

```
src/
├── assets/              # Static assets (images, fonts, icons)
├── components/          # Shared UI Components
│   └── ui/              # Reusable UI components (Button, Modal, UserMenu)
├── config/              # Configuration & Constants
│   ├── constants.ts     # App constants (API URLs, routes, colors)
│   ├── service-definitions.ts  # Service type definitions
│   └── translations.ts  # i18n translations (EN/VI)
├── features/            # ⭐ Feature-based modules (Business logic)
│   ├── auth/            # Authentication feature
│   │   ├── LoginPage.tsx
│   │   └── UserProfile.tsx
│   ├── queue/           # Queue management feature
│   │   ├── Kiosk.tsx
│   │   ├── MainDisplay.tsx
│   │   └── FeedbackTerminal.tsx
│   ├── counter/         # Counter operations feature
│   │   ├── CounterTerminal.tsx
│   │   └── CounterDisplay.tsx
│   ├── dashboard/       # Dashboard & Analytics
│   │   └── Dashboard.tsx
│   └── admin/           # Admin management
│       ├── UserManagement.tsx
│       ├── CategoryManagement.tsx
│       └── AdminPanel.tsx
├── hooks/               # Custom React hooks (useDebounce, useClickOutside)
├── layouts/             # Layout components (MainLayout, AuthLayout)
├── lib/                 # Third-party library configurations
│   └── services/        # API service layer
├── pages/               # Page components (Route wrappers)
├── routes/              # React Router configuration
├── stores/              # Global state management
│   ├── AuthContext.tsx  # Authentication state
│   └── QMSContext.tsx   # Queue management state
├── types/               # TypeScript type definitions
│   └── types.ts         # Shared types (Ticket, Counter, User)
├── utils/               # Utility functions (formatDate, formatMoney)
├── App.tsx              # Main App component with routing
└── main.tsx             # Application entry point
```

## 🎯 Nguyên tắc tổ chức

### 1. **Feature-Based Organization**
Mỗi feature là một module độc lập chứa:
- Components liên quan đến nghiệp vụ
- Business logic riêng
- Có thể có hooks, utils riêng nếu cần

**Ví dụ**: Feature `auth` chứa LoginPage, UserProfile, và có thể có `useAuth` hook.

### 2. **Separation of Concerns**
- **components/ui**: Chỉ chứa UI components thuần túy, không biết về business logic
- **features**: Chứa components có business logic cụ thể
- **stores**: Quản lý state toàn cục
- **lib**: Cấu hình thư viện bên thứ 3 (axios, SignalR)

### 3. **Import Paths**
```typescript
// ❌ Tránh
import { User } from '../../../types/types';

// ✅ Nên dùng (với path alias trong tsconfig.json)
import { User } from '@/types/types';
import { API_BASE_URL } from '@/config/constants';
```

## 📦 Các Feature hiện tại

### 🔐 Auth Feature
- **LoginPage**: Đăng nhập với demo accounts
- **UserProfile**: Xem và chỉnh sửa thông tin cá nhân
- **State**: `AuthContext` (stores/)

### 🎫 Queue Feature
- **Kiosk**: Màn hình lấy số
- **MainDisplay**: Màn hình hiển thị số được gọi
- **FeedbackTerminal**: Đánh giá dịch vụ
- **State**: `QMSContext` (stores/)

### 🖥️ Counter Feature
- **CounterTerminal**: Màn hình quầy giao dịch
- **CounterDisplay**: Màn hình hiển thị tại quầy
- **State**: Shared với QMSContext

### 📊 Dashboard Feature
- **Dashboard**: Thống kê và báo cáo

### 👥 Admin Feature
- **UserManagement**: Quản lý nhân viên
- **CategoryManagement**: Quản lý dịch vụ
- **AdminPanel**: Panel quản trị tổng hợp

## 🔄 Data Flow

```
User Action → Component → Context/Store → API Service → Backend
                ↓                ↓
            Local State    Global State
```

## 🌐 Internationalization (i18n)

Sử dụng `useTranslation` hook từ `config/translations.ts`:

```typescript
import { useTranslation } from '@/config/translations';

const { t, lang, setLang } = useTranslation();

// Usage
<h1>{t.login.title}</h1>
<button onClick={() => setLang('vi')}>Tiếng Việt</button>
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Colors**: Defined in `config/constants.ts`
- **Responsive**: Mobile-first approach

## 🚀 Next Steps

### Recommended Improvements:

1. **Add Path Aliases** (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/features/*": ["src/features/*"],
      "@/config/*": ["src/config/*"]
    }
  }
}
```

2. **Create Shared Hooks**
```
src/hooks/
├── useDebounce.ts
├── useClickOutside.ts
└── useLocalStorage.ts
```

3. **Add Layout Components**
```
src/layouts/
├── MainLayout.tsx      # Layout with navigation
├── AuthLayout.tsx      # Layout for login page
└── DisplayLayout.tsx   # Full-screen layout for displays
```

4. **Implement Route Guards**
```
src/routes/
├── index.tsx           # Route configuration
├── ProtectedRoute.tsx  # Auth guard
└── RoleBasedRoute.tsx  # Role-based guard
```

5. **Add API Service Layer**
```
src/lib/services/
├── api.ts              # Axios instance
├── ticketService.ts    # Ticket API calls
├── counterService.ts   # Counter API calls
└── authService.ts      # Auth API calls
```

## 📝 Migration Notes

### Files Moved:
- `contexts/` → `src/stores/`
- `components/LoginPage.tsx` → `src/features/auth/`
- `components/Kiosk.tsx` → `src/features/queue/`
- `components/CounterTerminal.tsx` → `src/features/counter/`
- `components/Dashboard.tsx` → `src/features/dashboard/`
- `components/UserManagement.tsx` → `src/features/admin/`
- `types.ts` → `src/types/`
- `translations.ts` → `src/config/`
- `constants.ts` → `src/config/service-definitions.ts`

### Import Path Updates:
All imports have been updated to reflect the new structure using relative paths.

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📚 Resources

- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
