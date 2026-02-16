"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, GitBranch, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Groups", href: "/dashboard/groups", icon: Users },
  { title: "Repositories", href: "/dashboard/repos", icon: GitBranch },
  // { title: "Templates", href: "/dashboard/templates", icon: FileText },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
      {items.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <Button
            key={index}
            asChild
            variant={isActive ? "secondary" : "ghost"}
            className={cn("justify-start gap-2", isActive && "font-semibold")}
          >
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
