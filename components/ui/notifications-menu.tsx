"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  formatNotificationTime,
  Notification,
  NotificationType,
} from "@/lib/notification-utils";

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setNotifications(getNotifications());
    }
  }, [isOpen]);

  // Handle marking a notification as read
  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    // Update the local state
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Handle deleting a notification
  const handleDelete = (id: string) => {
    deleteNotification(id);
    // Update the local state
    setNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.id !== id)
    );
  };

  // Handle marking all as read
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    // Update the local state
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) => ({ ...n, read: true }))
    );
  };

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "maintenance_scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "maintenance_started":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "maintenance_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "maintenance_cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "high_priority_issue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-h-[16px] min-w-[16px] flex items-center justify-center p-0 bg-red-500 text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <div key={notification.id} className="relative">
                  <DropdownMenuItem
                    className={`flex flex-col items-start gap-1 p-3 ${
                      notification.read ? "" : "bg-blue-50"
                    }`}
                    onSelect={(e) => e.preventDefault()} // Prevent auto-closing
                  >
                    <div className="flex w-full justify-between">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <span className="font-medium text-sm">
                          {notification.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex justify-end gap-2 w-full mt-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              ))}
            </DropdownMenuGroup>
          </ScrollArea>
        ) : (
          <div className="py-6 text-center">
            <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
