import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import type { User } from "@/pages/Index";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  user: User;
  onAddNotification?: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationBell = ({ user }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(`notifications_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
  }, [notifications, user.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  useEffect(() => {
    (window as any).addNotification = addNotification;
    return () => {
      delete (window as any).addNotification;
    };
  }, [addNotification]);

  const getIconByType = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "CheckCircle2";
      case "warning":
        return "AlertCircle";
      case "error":
        return "XCircle";
      default:
        return "Info";
    }
  };

  const getColorByType = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Icon name="Bell" size={18} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Уведомления</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 text-xs"
            >
              Отметить все прочитанными
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Icon name="Bell" size={48} className="mx-auto mb-2 opacity-20" />
              <p>Уведомлений пока нет</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? "bg-blue-50/30" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getColorByType(
                      notification.type
                    )}`}
                  >
                    <Icon
                      name={getIconByType(notification.type)}
                      size={16}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;