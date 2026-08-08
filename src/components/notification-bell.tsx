"use client";

import { useTranslations } from "next-intl";
import { Bell, CheckCheck } from "lucide-react";

import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const t = useTranslations("Notifications");
  const { unreadCount, notifications, markRead, markAllRead } = useNotifications();

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
              variant="ghost"
              size="icon"
              className="relative size-10 rounded-xl hover:bg-muted"
              aria-label={t("title")}
          >
            <Bell className="size-5 text-muted-foreground transition-colors hover:text-foreground" />
            {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 rounded-xl border-border/40 p-1.5 shadow-lg">
          <div className="flex items-center justify-between px-3 py-2">
            <DropdownMenuLabel className="p-0 text-xs font-medium text-muted-foreground">
              {t("title")}
            </DropdownMenuLabel>
            {unreadCount > 0 && (
                <button
                    onClick={() => markAllRead()}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <CheckCheck className="size-3.5" />
                  {t("markAllRead")}
                </button>
            )}
          </div>
          <DropdownMenuSeparator className="my-1" />
          {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">{t("empty")}</div>
          ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                    <DropdownMenuItem
                        key={notification.id}
                        onSelect={() => !notification.read && markRead(notification.id)}
                        className="flex cursor-pointer flex-col items-start gap-0.5 rounded-lg px-3 py-2.5"
                    >
                <span className="flex w-full items-center gap-2 text-sm font-semibold">
                  {!notification.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                  {notification.title}
                </span>
                      <span className="text-xs text-muted-foreground">{notification.message}</span>
                    </DropdownMenuItem>
                ))}
              </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
