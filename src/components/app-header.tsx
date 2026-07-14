import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

export function AppHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 md:px-8 sticky top-0 bg-background/80 backdrop-blur-md z-10">
      <div className="min-w-0">
        <h1 className="text-sm font-medium truncate">{title}</h1>
        {subtitle ? (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {action ?? (
          <Link
            to="/meetings"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            <Plus className="size-3.5" strokeWidth={2.25} />
            New meeting
          </Link>
        )}
      </div>
    </header>
  );
}
