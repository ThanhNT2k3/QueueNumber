# Core UI Components - Usage Examples

## Toast Component

### Setup
Wrap your app with `ToastProvider`:

```tsx
import { ToastProvider } from './components/ui';

function App() {
  return (
    <ToastProvider>
      {/* Your app content */}
    </ToastProvider>
  );
}
```

### Usage
```tsx
import { useToast } from './components/ui';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Operation completed successfully!', 'success');
  };

  const handleError = () => {
    showToast('Something went wrong!', 'error', 5000); // 5 seconds
  };

  const handleWarning = () => {
    showToast('Please be careful!', 'warning');
  };

  const handleInfo = () => {
    showToast('Here is some information', 'info');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

---

## Alert Component

### Basic Usage
```tsx
import { Alert } from './components/ui';

function MyComponent() {
  return (
    <div>
      <Alert variant="success" title="Success!">
        Your changes have been saved successfully.
      </Alert>

      <Alert variant="error" title="Error">
        Failed to save changes. Please try again.
      </Alert>

      <Alert variant="warning" title="Warning">
        This action cannot be undone.
      </Alert>

      <Alert variant="info">
        This is some helpful information.
      </Alert>
    </div>
  );
}
```

### With Close Button
```tsx
import { Alert } from './components/ui';
import { useState } from 'react';

function MyComponent() {
  const [showAlert, setShowAlert] = useState(true);

  if (!showAlert) return null;

  return (
    <Alert 
      variant="success" 
      title="Success!"
      onClose={() => setShowAlert(false)}
    >
      Your changes have been saved.
    </Alert>
  );
}
```

### Custom Icon
```tsx
import { Alert } from './components/ui';
import { Rocket } from 'lucide-react';

function MyComponent() {
  return (
    <Alert 
      variant="info"
      icon={<Rocket className="w-5 h-5 text-blue-600" />}
    >
      New feature available!
    </Alert>
  );
}
```

---

## ListGroup Component

### Basic List
```tsx
import { ListGroup, ListGroupItem } from './components/ui';

function MyComponent() {
  return (
    <ListGroup>
      <ListGroupItem>First item</ListGroupItem>
      <ListGroupItem>Second item</ListGroupItem>
      <ListGroupItem>Third item</ListGroupItem>
    </ListGroup>
  );
}
```

### With Header
```tsx
import { ListGroup, ListGroupHeader, ListGroupItem } from './components/ui';

function MyComponent() {
  return (
    <ListGroup>
      <ListGroupHeader>Recent Activities</ListGroupHeader>
      <ListGroupItem>User logged in</ListGroupItem>
      <ListGroupItem>New ticket created</ListGroupItem>
      <ListGroupItem>Counter assigned</ListGroupItem>
    </ListGroup>
  );
}
```

### Interactive List with Icons
```tsx
import { ListGroup, ListGroupItem, Badge } from './components/ui';
import * as Icons from 'lucide-react';

function MyComponent() {
  const [selected, setSelected] = useState('item1');

  return (
    <ListGroup>
      <ListGroupItem
        active={selected === 'item1'}
        onClick={() => setSelected('item1')}
        leftIcon={<Icons.Home className="w-5 h-5 text-gray-500" />}
        rightIcon={<Icons.ChevronRight className="w-4 h-4 text-gray-400" />}
      >
        Dashboard
      </ListGroupItem>
      
      <ListGroupItem
        active={selected === 'item2'}
        onClick={() => setSelected('item2')}
        leftIcon={<Icons.Users className="w-5 h-5 text-gray-500" />}
        badge={<Badge variant="info">5</Badge>}
      >
        Users
      </ListGroupItem>
      
      <ListGroupItem
        disabled
        leftIcon={<Icons.Settings className="w-5 h-5 text-gray-500" />}
      >
        Settings (Coming Soon)
      </ListGroupItem>
    </ListGroup>
  );
}
```

### Complex List Items
```tsx
import { ListGroup, ListGroupItem, Badge } from './components/ui';
import * as Icons from 'lucide-react';

function MyComponent() {
  const notifications = [
    { id: 1, title: 'New ticket', time: '2 min ago', unread: true },
    { id: 2, title: 'Counter assigned', time: '1 hour ago', unread: false },
    { id: 3, title: 'User updated', time: '3 hours ago', unread: false },
  ];

  return (
    <ListGroup>
      <ListGroupHeader>Notifications</ListGroupHeader>
      {notifications.map(notif => (
        <ListGroupItem
          key={notif.id}
          onClick={() => console.log('Clicked', notif.id)}
          leftIcon={<Icons.Bell className="w-5 h-5 text-blue-600" />}
          badge={notif.unread && <Badge variant="error">New</Badge>}
        >
          <div>
            <p className="font-medium text-gray-900">{notif.title}</p>
            <p className="text-sm text-gray-500">{notif.time}</p>
          </div>
        </ListGroupItem>
      ))}
    </ListGroup>
  );
}
```

---

## Complete Example

```tsx
import { 
  ToastProvider, 
  useToast, 
  Alert, 
  ListGroup, 
  ListGroupHeader, 
  ListGroupItem,
  Badge,
  Button 
} from './components/ui';
import * as Icons from 'lucide-react';
import { useState } from 'react';

function DemoPage() {
  const { showToast } = useToast();
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="p-8 space-y-6">
      {/* Alerts */}
      {showAlert && (
        <Alert 
          variant="info" 
          title="Welcome!"
          onClose={() => setShowAlert(false)}
        >
          Check out our new UI components below.
        </Alert>
      )}

      {/* Toast Triggers */}
      <div className="space-x-2">
        <Button onClick={() => showToast('Success!', 'success')}>
          Show Success Toast
        </Button>
        <Button onClick={() => showToast('Error occurred', 'error')}>
          Show Error Toast
        </Button>
      </div>

      {/* List Group */}
      <ListGroup>
        <ListGroupHeader>Menu Items</ListGroupHeader>
        <ListGroupItem
          leftIcon={<Icons.Home className="w-5 h-5" />}
          rightIcon={<Icons.ChevronRight className="w-4 h-4" />}
          onClick={() => showToast('Dashboard clicked', 'info')}
        >
          Dashboard
        </ListGroupItem>
        <ListGroupItem
          leftIcon={<Icons.Users className="w-5 h-5" />}
          badge={<Badge variant="info">12</Badge>}
          onClick={() => showToast('Users clicked', 'info')}
        >
          Users
        </ListGroupItem>
      </ListGroup>
    </div>
  );
}

// Wrap with ToastProvider
function App() {
  return (
    <ToastProvider>
      <DemoPage />
    </ToastProvider>
  );
}
```
