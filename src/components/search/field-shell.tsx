import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FieldShellProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}

/** Common "small caps label + big value" cell used by every segment of the search bar. */
export function FieldShell({ icon, label, children, className }: FieldShellProps) {
  return (
    <div className={cn("flex min-h-16 flex-col justify-center gap-0.5 px-4 py-2", className)}>
      <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}
