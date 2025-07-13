# Maintenance Notifications System

This document describes the notification system implemented for the maintenance management feature in the report dashboard application.

## 📣 Notification System Overview

The notification system provides real-time alerts for maintenance activities, helping users stay informed about infrastructure repairs and maintenance schedules.

### Key Features

1. **Real-time Notifications**

   - Immediate alerts for new maintenance schedules
   - Status change notifications (started, completed, cancelled)
   - High-priority issue alerts

2. **Notification Management**

   - Mark notifications as read
   - Delete unwanted notifications
   - Bulk actions for all notifications

3. **Persistent Storage**
   - Notifications are stored in local storage
   - Maintains state across browser sessions
   - Preserves notification history

## 🧩 Components

### 1. Notification Utilities (`notification-utils.ts`)

This utility module provides the core functionality for notification management:

```typescript
// Core notification types
export type NotificationType =
  | "maintenance_scheduled"
  | "maintenance_started"
  | "maintenance_completed"
  | "maintenance_cancelled"
  | "high_priority_issue";

// Notification data structure
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  data?: {
    issueId?: string;
    maintenanceId?: string;
    scheduledDate?: Date;
    severity?: string;
  };
}
```

Key functions:

- `addNotification`: Creates and stores a new notification
- `markNotificationAsRead`: Marks a single notification as read
- `markAllNotificationsAsRead`: Marks all notifications as read
- `deleteNotification`: Removes a notification from storage
- `getUnreadCount`: Returns the count of unread notifications

### 2. Notifications Menu Component (`notifications-menu.tsx`)

A dropdown menu interface for viewing and managing notifications:

- Displays notification count badge
- Shows notification history with visual indicators
- Provides controls for managing notifications
- Renders different icons based on notification type

### 3. Integration with Maintenance System

The notification system is integrated with the maintenance workflow:

- `notifyMaintenanceScheduled`: Called when a new maintenance task is scheduled
- `notifyMaintenanceStatusChange`: Called when maintenance status changes
- Visual indicators show the status of each notification

## 🔄 Workflow

1. **Creating Notifications**

   - Maintenance scheduling triggers a notification
   - Status changes (started, completed, cancelled) create notifications
   - High-priority issues automatically generate alerts

2. **Notification Display**

   - Badge shows unread notification count
   - Dropdown menu shows notification history
   - Color coding and icons indicate notification type and priority

3. **User Interaction**
   - Users can mark notifications as read
   - Notifications can be deleted individually
   - "Mark all as read" action for bulk management

## 🛠️ Technical Implementation

### Storage Mechanism

Notifications are stored in browser local storage:

```typescript
// Storage key
const NOTIFICATION_STORAGE_KEY = "maintenance_notifications";

// Save to storage
function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
}

// Retrieve from storage
function getNotifications(): Notification[] {
  const storedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  // Parse and convert dates back to Date objects...
}
```

### Notification Generation

Notifications are created with contextual information:

```typescript
export function notifyMaintenanceScheduled(schedule: MaintenanceSchedule): void {
  // Extract schedule details
  const { issue, date, timeSlot, priority } = schedule;

  // Format time and date information
  const timeSlotText = timeSlot === 'morning' ? '8:00 - 12:00' : /* ... */;
  const formattedDate = date ? format(date, 'MMMM d, yyyy') : 'Unknown date';

  // Create the notification
  addNotification(
    'maintenance_scheduled',
    `Maintenance Scheduled for ${issue}`,
    `Maintenance has been scheduled for ${formattedDate} during ${timeSlotText}. Priority: ${priority}.`,
    {
      maintenanceId: generateId(),
      scheduledDate: date,
      severity: priority
    }
  );
}
```

### UI Components

The notification UI components use these Shadcn UI elements:

- `Badge`: For displaying notification counts
- `DropdownMenu`: For the notifications container
- `Button`: For action controls
- `ScrollArea`: For scrollable notification lists

## 📝 Future Enhancements

1. **Server-side Storage**

   - Move notifications to a database for cross-device access
   - Enable push notifications to mobile devices

2. **Enhanced Filtering**

   - Filter notifications by type, date, or priority
   - Search functionality for finding specific notifications

3. **Notification Settings**

   - Allow users to customize notification preferences
   - Set notification expiration times

4. **Integration with External Systems**
   - Send SMS/email alerts for high-priority issues
   - Integration with work order and dispatch systems
