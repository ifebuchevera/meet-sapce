import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Video,
  ListChecks,
  BookOpen,
  Search,
} from "lucide-react";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/meetings", icon: Video, label: "Meetings" },
  { to: "/tasks", icon: ListChecks, label: "Tasks" },
  { to: "/knowledge", icon: BookOpen, label: "Knowledge" },
  { to: "/search", icon: Search, label: "Search" },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-border bg-background/95 backdrop-blur-md z-20">
      <div className="flex justify-around items-center py-2">
        {items.map((item) => {
          const active =
            pathname === item.to ||
            (item.to !== "/dashboard" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors " +
                (active ? "text-foreground" : "text-muted-foreground")
              }
            >
              <item.icon className="size-4" strokeWidth={1.75} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
