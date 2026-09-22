import { Timer } from "lucide-react";

import { cn } from "@/lib/utils";

type CountdownTimerProps = {
  /** Milliseconds remaining, already clamped to >= 0 by the caller (see BookingTrackingPage,
   *  which owns the single ticking clock this is purely presentational for). */
  remainingMs: number;
  className?: string;
};

/** mm:ss under an hour, hh:mm above - a Travel Terminus hold is typically 15 minutes, but other
 *  providers' holds can run much longer, so this doesn't assume either shape. */
function formatRemaining(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CountdownTimer({ remainingMs, className }: CountdownTimerProps) {
  const urgent = remainingMs > 0 && remainingMs <= 2 * 60 * 1000;

  return (
    <span
      className={cn(
          "inline-flex items-center gap-1.5 font-mono font-black tabular-nums",
          urgent ? "text-destructive" : "text-amber-600 dark:text-amber-400",
          className,
      )}
    >
      <Timer className="size-3.5 shrink-0" />
      {formatRemaining(remainingMs)}
    </span>
  );
}
