import { useState } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

const typeIcons: Record<string, string> = {
  success: "📚",
  warning: "📕",
  info: "ℹ️",
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const NotificationItem = ({
  notification,
  onRead,
  onDelete,
  navigate,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  navigate: (path: string) => void;
}) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id);
    }
    
    // Se a notificação é sobre notícias, redirecionar para a página de notícias
    if (notification.metadata && 'news_id' in notification.metadata) {
      navigate('/noticias');
    }
  };

  return (
    <div
      className={`p-3 rounded-lg transition-colors cursor-pointer group ${
        notification.is_read
          ? "bg-transparent hover:bg-muted/50"
          : "bg-primary/5 hover:bg-primary/10"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base mt-0.5 flex-shrink-0">
          {typeIcons[notification.type] || "🔔"}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium truncate ${notification.is_read ? "text-muted-foreground" : "text-foreground"}`}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {timeAgo(notification.created_at)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const NotificationBell = ({ className = "" }: { className?: string }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`relative p-2 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-sidebar-accent/50 transition-all ${className}`}
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-scale-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="right"
        sideOffset={8}
        className="w-80 p-0 bg-card border-border shadow-xl"
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[360px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
