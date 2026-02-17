import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { UserProfile } from "@/components/dashboard/user-profile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Bell, Menu, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r bg-card/50 backdrop-blur-xl md:flex">
        <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <span>ReviewMyPR</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <SidebarNav />
        </ScrollArea>
        <div className="mt-auto border-t p-4">
          <UserProfile />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-6 lg:h-[60px] justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Nav Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 w-64">
                <div className="flex h-14 items-center border-b px-6">
                  <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-lg"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <span>ReviewMyPR</span>
                  </Link>
                </div>
                <ScrollArea className="flex-1 py-4">
                  <SidebarNav />
                </ScrollArea>
                <div className="mt-auto border-t p-4">
                  <UserProfile />
                </div>
              </SheetContent>
            </Sheet>

            <InputGroup className="hidden md:flex w-full max-w-[400px] bg-background/50 backdrop-blur-sm shadow-sm transition-all duration-300 focus-within:max-w-[500px] focus-within:shadow-md">
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="Search repositories, groups..."
              />
            </InputGroup>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground relative transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="md:hidden">
              <UserProfile />
            </div>
          </div>
        </header>
        <ScrollArea className="flex-1 min-h-0 bg-slate-50/30 dark:bg-transparent">
          <div className="container mx-auto p-4 lg:p-8">
            <DashboardBreadcrumb />
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
