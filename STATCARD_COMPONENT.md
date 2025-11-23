# StatCard Component

## Overview
The `StatCard` component is designed for displaying key metrics and statistics in dashboards. It provides a consistent, professional look with support for icons, trends, and subtitles.

## Features
- ✅ **Icon support** with 7 color variants
- ✅ **Trend indicators** (positive/negative)
- ✅ **Subtitle support** for additional context
- ✅ **Click handler** for interactive cards
- ✅ **Hover effects** built-in
- ✅ **Fully typed** with TypeScript

## Usage

### Basic Example
```tsx
import { StatCard } from './components/ui';
import * as Icons from 'lucide-react';

<StatCard
  title="Total Users"
  value={1234}
  icon={<Icons.Users size={28} />}
  iconColor="blue"
/>
```

### With Trend (Positive)
```tsx
<StatCard
  title="Revenue"
  value="$45,231"
  icon={<Icons.DollarSign size={28} />}
  iconColor="green"
  trend={{ value: '12% vs last month', isPositive: true }}
/>
```

### With Trend (Negative)
```tsx
<StatCard
  title="Avg Response Time"
  value="4m 12s"
  icon={<Icons.Clock size={28} />}
  iconColor="orange"
  trend={{ value: '30s slower', isPositive: false }}
/>
```

### With Subtitle
```tsx
<StatCard
  title="Customer Satisfaction"
  value="4.8"
  icon={<Icons.Star size={28} />}
  iconColor="yellow"
  subtitle="Based on 156 reviews"
/>
```

### Clickable Card
```tsx
<StatCard
  title="Active Tickets"
  value={42}
  icon={<Icons.Ticket size={28} />}
  iconColor="purple"
  onClick={() => navigate('/tickets')}
/>
```

## Props

### StatCardProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | The title/label of the stat |
| `value` | `string \| number` | **required** | The main value to display |
| `icon` | `React.ReactNode` | `undefined` | Icon element (usually from lucide-react) |
| `iconColor` | `'blue' \| 'green' \| 'red' \| 'yellow' \| 'purple' \| 'orange' \| 'gray'` | `'blue'` | Color theme for the icon background |
| `trend` | `{ value: string; isPositive?: boolean }` | `undefined` | Trend information with direction |
| `subtitle` | `string` | `undefined` | Additional text below the value |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `() => void` | `undefined` | Click handler (makes card interactive) |

## Icon Colors

The component supports 7 predefined color schemes:

| Color | Text Color | Background | Use Case |
|-------|-----------|------------|----------|
| `blue` | `text-blue-500` | `bg-blue-50` | General stats, users |
| `green` | `text-green-500` | `bg-green-50` | Revenue, positive metrics |
| `red` | `text-red-500` | `bg-red-50` | Errors, alerts |
| `yellow` | `text-yellow-500` | `bg-yellow-50` | Ratings, warnings |
| `purple` | `text-purple-500` | `bg-purple-50` | VIP, premium |
| `orange` | `text-orange-500` | `bg-orange-50` | Time, performance |
| `gray` | `text-gray-500` | `bg-gray-50` | Neutral stats |

## Dashboard Example

```tsx
import { StatCard } from './components/ui';
import * as Icons from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatCard
        title="Total Tickets"
        value={1234}
        icon={<Icons.Ticket size={28} />}
        iconColor="blue"
        trend={{ value: '12% vs yesterday', isPositive: true }}
      />

      <StatCard
        title="Avg Wait Time"
        value="4m 12s"
        icon={<Icons.Clock size={28} />}
        iconColor="orange"
        trend={{ value: '30s over SLA', isPositive: false }}
      />

      <StatCard
        title="Customer Satisfaction"
        value="4.8"
        icon={<Icons.Star size={28} />}
        iconColor="yellow"
        subtitle="156 reviews"
      />

      <StatCard
        title="VIP Customers"
        value={42}
        icon={<Icons.Crown size={28} />}
        iconColor="purple"
      />
    </div>
  );
};
```

## Before vs After

### Before (44 lines)
```tsx
<Card>
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-500 font-medium">Total Tickets</h3>
      <Icons.Ticket className="text-blue-500 bg-blue-50 p-1 rounded" size={28} />
    </div>
    <p className="text-3xl font-bold text-gray-800">{count}</p>
    <p className="text-green-500 text-sm mt-2">↑ 12% vs yesterday</p>
  </div>
</Card>
```

### After (7 lines)
```tsx
<StatCard
  title="Total Tickets"
  value={count}
  icon={<Icons.Ticket size={28} />}
  iconColor="blue"
  trend={{ value: '12% vs yesterday', isPositive: true }}
/>
```

**Result: 84% less code!**

## Styling

The component uses Tailwind CSS and follows the design system:
- **Border radius**: `rounded-2xl`
- **Shadow**: `shadow-sm` with `hover:shadow-md`
- **Padding**: `p-6`
- **Transitions**: All hover effects are smooth

## Accessibility

- Proper semantic HTML structure
- Color contrast meets WCAG AA standards
- Hover states for interactive cards
- Keyboard accessible when `onClick` is provided

## Tips

1. **Use consistent icon sizes**: Stick to `size={28}` for uniformity
2. **Choose appropriate colors**: Match icon color to the metric type
3. **Keep values concise**: Use abbreviations (K, M) for large numbers
4. **Trend vs Subtitle**: Use trend for comparisons, subtitle for context
5. **Grid layout**: Use `grid grid-cols-4 gap-6` for 4-column layouts

## Related Components

- **Card** - For more complex content
- **Badge** - For status indicators
- **Button** - For actions
