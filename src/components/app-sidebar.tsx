import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Video,
  ListChecks,
  BookOpen,
  Search,
  Settings,
} from "lucide-react";

const items = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Meetings", to: "/meetings", icon: Video },
  { title: "Tasks", to: "/tasks", icon: ListChecks },
  { title: "Knowledge", to: "/knowledge", icon: BookOpen },
  { title: "Search", to: "/search", icon: Search },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 border-r border-border bg-surface flex-col p-5">
      <Link to="/dashboard" className="flex items-center gap-2 mb-8 px-2">
        <div className="size-6 bg-primary rounded flex items-center justify-center">
          <div className="size-2 bg-primary-foreground rounded-full animate-pulse" />
        </div>
        <span className="font-semibold tracking-tight text-base">Clarity</span>
      </Link>

      <nav className="flex-1 space-y-0.5">
        {items.map((item) => {
          const active =
            pathname === item.to ||
            (item.to !== "/dashboard" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors " +
                (active
                  ? "bg-background border border-border font-medium text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60")
              }
            >
              <item.icon className="size-4" strokeWidth={1.75} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          to="/settings"
          className={
            "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors " +
            (pathname.startsWith("/settings")
              ? "bg-background border border-border font-medium text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60")
          }
        >
          <Settings className="size-4" strokeWidth={1.75} />
          Settings
        </Link>
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 px-2">
          <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-[11px] font-medium">
            SC
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium">Sarah Chen</span>
            <span className="text-[10px] text-muted-foreground">Pro plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
