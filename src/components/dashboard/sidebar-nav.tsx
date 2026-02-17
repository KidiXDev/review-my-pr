"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Settings,
  HelpCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const items = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Groups", href: "/dashboard/groups", icon: Users },
  { title: "Repositories", href: "/dashboard/repos", icon: GitBranch },
];

const secondaryItems = [
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
  { title: "Help", href: "#", icon: HelpCircle },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6 px-2">
      <nav className="grid gap-1">
        {items.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "justify-start gap-3 px-3 py-2.5 transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-[0_0_10px_rgba(34,197,94,0.15)] ring-1 ring-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="grid gap-1">
        <div className="px-3 text-xs font-medium text-muted-foreground mb-2">
          System
        </div>
        {secondaryItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "justify-start gap-3 px-3 py-2.5 transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-[0_0_10px_rgba(34,197,94,0.15)] ring-1 ring-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
