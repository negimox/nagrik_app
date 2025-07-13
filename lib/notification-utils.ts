/**
 * Utility functions for handling maintenance notifications
 */

import { MaintenanceSchedule } from "@/components/ui/maintenance-scheduler";
import { format } from "date-fns";

// Types of notifications
export type NotificationType =
  | "maintenance_scheduled"
  | "maintenance_started"
  | "maintenance_completed"
  | "maintenance_cancelled"
  | "high_priority_issue";

// Notification model
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

// Local storage key for notifications
const NOTIFICATION_STORAGE_KEY = "maintenance_notifications";

/**
 * Generate a unique ID for notifications
 */
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Get all stored notifications
 */
export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];

  const storedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (!storedNotifications) return [];

  try {
    const parsed = JSON.parse(storedNotifications);
    // Convert string dates back to Date objects
    return parsed.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      data: n.data
        ? {
            ...n.data,
            scheduledDate: n.data.scheduledDate
              ? new Date(n.data.scheduledDate)
              : undefined,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("Error parsing notifications:", error);
    return [];
  }
}

/**
 * Save notifications to storage
 */
function saveNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
}

/**
 * Add a new notification
 */
export function addNotification(
  type: NotificationType,
  title: string,
  message: string,
  data?: Notification["data"]
): Notification {
  const newNotification: Notification = {
    id: generateId(),
    type,
    title,
    message,
    createdAt: new Date(),
    read: false,
    data,
  };

  const currentNotifications = getNotifications();
  saveNotifications([newNotification, ...currentNotifications]);

  return newNotification;
}

/**
 * Mark a notification as read
 */
export function markNotificationAsRead(id: string): void {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );

  saveNotifications(updatedNotifications);
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(): void {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map((n) => ({ ...n, read: true }));

  saveNotifications(updatedNotifications);
}

/**
 * Delete a notification
 */
export function deleteNotification(id: string): void {
  const notifications = getNotifications();
  const updatedNotifications = notifications.filter((n) => n.id !== id);

  saveNotifications(updatedNotifications);
}

/**
 * Get the count of unread notifications
 */
export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

/**
 * Create a notification for maintenance scheduling
 */
export function notifyMaintenanceScheduled(
  schedule: MaintenanceSchedule
): void {
  const { issue, date, timeSlot, priority } = schedule;

  const timeSlotText =
    timeSlot === "morning"
      ? "8:00 - 12:00"
      : timeSlot === "afternoon"
      ? "12:00 - 16:00"
      : "16:00 - 20:00";

  const formattedDate = date ? format(date, "MMMM d, yyyy") : "Unknown date";

  addNotification(
    "maintenance_scheduled",
    `Maintenance Scheduled for ${issue}`,
    `Maintenance has been scheduled for ${formattedDate} during ${timeSlotText}. Priority: ${priority}.`,
    {
      maintenanceId: generateId(),
      scheduledDate: date,
      severity: priority,
    }
  );
}

/**
 * Create a notification for maintenance status change
 */
export function notifyMaintenanceStatusChange(
  schedule: MaintenanceSchedule,
  newStatus: MaintenanceSchedule["status"]
): void {
  const { issue } = schedule;

  let type: NotificationType;
  let title: string;
  let message: string;

  switch (newStatus) {
    case "in-progress":
      type = "maintenance_started";
      title = `Maintenance Started for ${issue}`;
      message = `Work has begun on the ${issue} maintenance task.`;
      break;
    case "completed":
      type = "maintenance_completed";
      title = `Maintenance Completed for ${issue}`;
      message = `The ${issue} has been successfully repaired and maintenance is complete.`;
      break;
    case "cancelled":
      type = "maintenance_cancelled";
      title = `Maintenance Cancelled for ${issue}`;
      message = `The scheduled maintenance for ${issue} has been cancelled.`;
      break;
    default:
      return; // Don't create notification for other status changes
  }

  addNotification(type, title, message, {
    maintenanceId: generateId(),
    severity: schedule.priority,
  });
}

/**
 * Format notification time as relative time (e.g. "2 hours ago")
 */
export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`;
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  } else if (diffDay < 30) {
    return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  } else {
    // Just return the date for older notifications
    return date.toLocaleDateString();
  }
}
