import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { UserProfile } from "@/components/dashboard/user-profile";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden border-r bg-muted/40 md:block md:w-64">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="">WhatsApp Bot</span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <SidebarNav />
          </ScrollArea>
          <UserProfile />
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            {/* Breadcrumb or Search could go here */}
          </div>
        </header>
        <ScrollArea className="flex-1 p-4 lg:p-6">{children}</ScrollArea>
      </main>
    </div>
  );
}

import Link from "next/link";
