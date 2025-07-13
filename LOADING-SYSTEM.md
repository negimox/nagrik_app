# Loading System Documentation

This document explains how to use the comprehensive loading system implemented in the Nagrik application.

## 🚀 Features

- **Multiple Loading Components**: Spinners, dots, skeletons, and full-page loading
- **Global Loading State**: Application-wide loading overlays
- **Local Loading States**: Component-level loading indicators
- **Custom Hooks**: Easy-to-use hooks for different loading scenarios
- **Automatic Page Loading**: Next.js integration for route transitions
- **TypeScript Support**: Fully typed for better development experience

## 📦 Components

### LoadingSpinner

A customizable spinning loader with different sizes.

```tsx
import { LoadingSpinner } from "@/components/ui/loading";

<LoadingSpinner size="md" />
<LoadingSpinner size="lg" className="text-blue-500" />
```

**Props:**

- `size`: `"sm" | "md" | "lg" | "xl"` (default: `"md"`)
- `className`: Additional CSS classes

### LoadingDots

Animated bouncing dots for a playful loading indicator.

```tsx
import { LoadingDots } from "@/components/ui/loading";

<LoadingDots />
<LoadingDots className="justify-center" />
```

### InlineLoading

Loading spinner with accompanying text message.

```tsx
import { InlineLoading } from "@/components/ui/loading";

<InlineLoading message="Fetching data..." size="sm" />;
```

**Props:**

- `message`: Loading text (default: `"Loading..."`)
- `size`: Spinner size `"sm" | "md" | "lg"` (default: `"md"`)
- `className`: Additional CSS classes

### PageLoading

Full-page loading screen with logo and message.

```tsx
import { PageLoading } from "@/components/ui/loading";

<PageLoading message="Loading dashboard..." showLogo={true} />;
```

**Props:**

- `message`: Loading message (default: `"Loading..."`)
- `showLogo`: Whether to show the Nagrik logo (default: `true`)

### Skeleton Components

Placeholder content while actual content is loading.

```tsx
import { Skeleton, CardSkeleton, TableSkeleton } from "@/components/ui/loading";

// Basic skeleton
<Skeleton className="h-4 w-full" />

// Pre-built card skeleton
<CardSkeleton />

// Pre-built table skeleton
<TableSkeleton rows={5} />
```

## 🎣 Hooks

### useGlobalLoading

Manage application-wide loading states.

```tsx
import { useGlobalLoading } from "@/hooks/use-loading";

function MyComponent() {
  const { showLoading, hideLoading, withLoading } = useGlobalLoading();

  const handleAction = async () => {
    // Option 1: Manual control
    showLoading("Processing...");
    try {
      await someAsyncOperation();
    } finally {
      hideLoading();
    }

    // Option 2: Automatic control
    await withLoading(async () => await someAsyncOperation(), "Processing...");
  };
}
```

### useAsyncLoading

Local loading state with error handling.

```tsx
import { useAsyncLoading } from "@/hooks/use-loading";

function MyComponent() {
  const { loading, error, execute } = useAsyncLoading();

  const handleSubmit = async () => {
    const result = await execute(async () => {
      const response = await fetch("/api/data");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    });
  };

  if (loading) return <InlineLoading message="Submitting..." />;
  if (error) return <div>Error: {error}</div>;
}
```

### useSimulateLoading

Simulate loading states for testing and development.

```tsx
import { useSimulateLoading } from "@/hooks/use-loading";

function TestComponent() {
  const { isLoading, simulate } = useSimulateLoading(3000);

  return (
    <Button onClick={simulate} disabled={isLoading}>
      {isLoading ? "Loading..." : "Test Loading"}
    </Button>
  );
}
```

## 🌍 Global Loading Provider

The `LoadingProvider` wraps your entire application and manages global loading states.

```tsx
// Already set up in app/layout.tsx
import { LoadingProvider } from "@/contexts/LoadingContext";

export default function RootLayout({ children }) {
  return <LoadingProvider>{children}</LoadingProvider>;
}
```

## 📄 Page-Level Loading

Next.js automatically uses `loading.tsx` files for route-level loading states:

```tsx
// app/loading.tsx - Global loading
// app/citizen/loading.tsx - Citizen section loading
// app/authority/loading.tsx - Authority section loading
```

These files are automatically shown during page navigation and data fetching.

## 🎨 Customization

### CSS Classes

All loading components support custom CSS classes:

```tsx
<LoadingSpinner className="text-red-500 border-red-200" />
<InlineLoading className="bg-gray-100 p-4 rounded" />
```

### Custom Animations

Additional animations are available via CSS classes:

```css
.animate-spin-slow      /* Slower spinning */
/* Slower spinning */
.animate-pulse-slow     /* Slower pulsing */
.animate-bounce-slow    /* Slower bouncing */
.animate-fade-in        /* Fade in animation */
.animate-slide-up       /* Slide up animation */
.animate-shimmer; /* Shimmer effect for skeletons */
```

## 💡 Best Practices

### 1. Choose the Right Loading Type

- **Page transitions**: Use Next.js `loading.tsx` files
- **Form submissions**: Use `useAsyncLoading` hook
- **Button actions**: Use `InlineLoading` or `LoadingSpinner`
- **Data fetching**: Use `Skeleton` components
- **Global operations**: Use `useGlobalLoading`

### 2. Provide Meaningful Messages

```tsx
// Good
<InlineLoading message="Uploading image..." />
<PageLoading message="Analyzing infrastructure..." />

// Avoid generic messages when specific context is available
<InlineLoading message="Loading..." /> // Too generic
```

### 3. Handle Errors Gracefully

```tsx
const { loading, error, execute } = useAsyncLoading();

// Always handle the error state
if (error) {
  return <ErrorMessage message={error} />;
}
```

### 4. Use Skeletons for Better UX

Instead of showing blank space, use skeleton loaders:

```tsx
// Good
{
  loading ? <CardSkeleton /> : <DataCard data={data} />;
}

// Less ideal
{
  loading ? <div>Loading...</div> : <DataCard data={data} />;
}
```

## 🔧 Integration Examples

### Form Submission

```tsx
function ReportForm() {
  const { loading, error, execute } = useAsyncLoading();

  const handleSubmit = async (formData) => {
    const result = await execute(async () => {
      return await submitReport(formData);
    });

    if (result) {
      // Handle success
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button type="submit" disabled={loading}>
        {loading ? (
          <InlineLoading message="Submitting report..." size="sm" />
        ) : (
          "Submit Report"
        )}
      </Button>
      {error && <ErrorAlert message={error} />}
    </form>
  );
}
```

### Data Fetching

```tsx
function ReportsList() {
  const [reports, setReports] = useState(null);
  const { loading, execute } = useAsyncLoading();

  useEffect(() => {
    execute(async () => {
      const data = await fetchReports();
      setReports(data);
      return data;
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {reports?.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
```

## 🎮 Demo

Visit `/citizen/loading-demo` to see all loading components and patterns in action.

## 🚦 Next Steps

1. **Performance Optimization**: Consider lazy loading for large datasets
2. **Accessibility**: Ensure loading states are announced to screen readers
3. **Testing**: Write tests for loading states and error conditions
4. **Monitoring**: Track loading times and user experience metrics
