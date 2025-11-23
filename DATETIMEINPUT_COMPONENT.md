# DateTimeInput Component

## Overview
The `DateTimeInput` component provides a consistent interface for date, time, and datetime inputs with optional icons and full form integration.

## Features
- ✅ **Three types**: date, time, datetime-local
- ✅ **Optional icons**: Calendar for dates, Clock for time
- ✅ **Label support** with required indicator
- ✅ **Error handling** with error messages
- ✅ **Helper text** for additional context
- ✅ **Disabled state** support
- ✅ **Fully typed** with TypeScript

## Usage

### Basic Date Input
```tsx
import { DateTimeInput } from './components/ui';

<DateTimeInput
  label="Select Date"
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>
```

### Time Input
```tsx
<DateTimeInput
  label="Select Time"
  type="time"
  value={time}
  onChange={(e) => setTime(e.target.value)}
/>
```

### DateTime Input
```tsx
<DateTimeInput
  label="Select Date & Time"
  type="datetime-local"
  value={datetime}
  onChange={(e) => setDatetime(e.target.value)}
/>
```

### With Required Field
```tsx
<DateTimeInput
  label="Birth Date"
  type="date"
  value={birthDate}
  onChange={(e) => setBirthDate(e.target.value)}
  required
/>
```

### With Error
```tsx
<DateTimeInput
  label="Event Date"
  type="date"
  value={eventDate}
  onChange={(e) => setEventDate(e.target.value)}
  error="Date must be in the future"
/>
```

### With Helper Text
```tsx
<DateTimeInput
  label="Appointment Date"
  type="date"
  value={appointmentDate}
  onChange={(e) => setAppointmentDate(e.target.value)}
  helperText="Select a date within the next 30 days"
/>
```

### Without Icon
```tsx
<DateTimeInput
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
  showIcon={false}
/>
```

### Disabled State
```tsx
<DateTimeInput
  label="Created Date"
  type="date"
  value={createdDate}
  disabled
/>
```

## Props

### DateTimeInputProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text above the input |
| `type` | `'date' \| 'time' \| 'datetime-local'` | `'date'` | Type of input |
| `value` | `string` | - | Current value |
| `onChange` | `(e: ChangeEvent) => void` | - | Change handler |
| `error` | `string` | `undefined` | Error message to display |
| `helperText` | `string` | `undefined` | Helper text below input |
| `required` | `boolean` | `false` | Shows required indicator |
| `disabled` | `boolean` | `false` | Disables the input |
| `showIcon` | `boolean` | `true` | Show calendar/clock icon |
| `className` | `string` | `''` | Additional CSS classes |
| `id` | `string` | - | Input ID |
| `name` | `string` | - | Input name |

All standard HTML input attributes are also supported.

## Examples

### Date Range Filter
```tsx
import { DateTimeInput } from './components/ui';

function DateRangeFilter() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div className="flex items-center gap-4">
      <DateTimeInput
        label="From"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <span className="text-gray-400 mt-6">-</span>
      <DateTimeInput
        label="To"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </div>
  );
}
```

### Appointment Scheduler
```tsx
function AppointmentForm() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!date || !time) {
      setError('Both date and time are required');
      return;
    }
    // Submit logic
  };

  return (
    <form>
      <DateTimeInput
        label="Appointment Date"
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setError('');
        }}
        required
        error={error && !date ? error : undefined}
      />

      <DateTimeInput
        label="Appointment Time"
        type="time"
        value={time}
        onChange={(e) => {
          setTime(e.target.value);
          setError('');
        }}
        required
        error={error && !time ? error : undefined}
        helperText="Select a time between 9 AM and 5 PM"
      />
    </form>
  );
}
```

### Compact Date Filter (No Icon)
```tsx
function CompactFilter() {
  const [date, setDate] = useState('');

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Date:</span>
      <DateTimeInput
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        showIcon={false}
        className="w-40"
      />
    </div>
  );
}
```

## Before vs After

### Before (Raw HTML)
```tsx
<div>
  <label className="block text-xs font-medium text-gray-700 mb-1">
    From Date
  </label>
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  />
</div>
```

### After (DateTimeInput)
```tsx
<DateTimeInput
  label="From Date"
  type="date"
  value={fromDate}
  onChange={(e) => setFromDate(e.target.value)}
/>
```

**Result: 75% less code!**

## Styling

The component uses Tailwind CSS and follows the design system:
- **Border**: `border-gray-300` (normal), `border-red-300` (error)
- **Focus**: `focus:ring-2 focus:ring-blue-500`
- **Disabled**: `bg-gray-50 text-gray-500`
- **Icons**: Calendar (date), Clock (time)

## Accessibility

- Proper label association with `htmlFor`
- Required indicator for screen readers
- Error messages linked to input
- Disabled state properly handled
- Focus states clearly visible

## Tips

1. **Use appropriate type**: Choose `date`, `time`, or `datetime-local` based on needs
2. **Provide labels**: Always include labels for better UX
3. **Show errors**: Use error prop for validation feedback
4. **Helper text**: Use for format hints or additional context
5. **Icon visibility**: Hide icons in compact layouts with `showIcon={false}`

## Related Components

- **TextInput** - For text-based inputs
- **Dropdown** - For select inputs
- **Button** - For form actions
- **Label** - Standalone labels

## Browser Support

The `date`, `time`, and `datetime-local` input types are supported in:
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ⚠️ Older browsers may show text input fallback

## Notes

- Date format is `YYYY-MM-DD` (ISO 8601)
- Time format is `HH:MM` (24-hour)
- DateTime format is `YYYY-MM-DDTHH:MM`
- Values are always strings
- Use `new Date(value)` to convert to Date object
