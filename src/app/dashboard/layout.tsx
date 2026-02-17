import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { UserProfile } from "@/components/dashboard/user-profile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { Notifications } from "@/components/dashboard/notifications";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-72 flex-col border-r border-white/5 bg-sidebar/80 backdrop-blur-md md:flex z-50 transition-all duration-300">
        <div className="flex h-16 items-center border-b border-white/5 px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="tracking-tight text-white/90 group-hover:text-white transition-colors">
              ReviewMyPR
            </span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-6 px-4">
          <SidebarNav />
        </ScrollArea>
        <div className="mt-auto p-4 w-full border-t border-white/5 bg-black/20">
          <UserProfile />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 pointer-events-none z-0 bg-[url('/grid-pattern.svg')] opacity-[0.015]" />

        <header className="flex h-16 items-center gap-4 border-b border-white/5 bg-background/60 backdrop-blur-xl px-6 justify-between z-40 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Nav Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-muted-foreground hover:text-foreground"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex flex-col p-0 w-72 bg-sidebar border-r border-white/10 text-sidebar-foreground"
              >
                <div className="flex h-16 items-center border-b border-white/5 px-6">
                  <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-lg"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <span>ReviewMyPR</span>
                  </Link>
                </div>
                <ScrollArea className="flex-1 py-6 px-4">
                  <SidebarNav />
                </ScrollArea>
                <div className="mt-auto border-t border-white/5 p-4 bg-black/20">
                  <UserProfile />
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden md:block w-full max-w-[480px]">
              <GlobalSearch />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Notifications />
            <div className="md:hidden">
              <UserProfile />
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 min-h-0 relative z-10">
          <div className="container mx-auto p-4 lg:p-8 space-y-8">
            <DashboardBreadcrumb />
            <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
