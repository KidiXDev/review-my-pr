"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/providers/alert-provider";

export function UserProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const { confirm } = useAlert();

  const handleSignOut = async () => {
    const ok = await confirm({
      title: "Logout",
      description:
        "Are you sure you want to log out? You will need to sign in again to access your dashboard.",
      confirmText: "Log out",
      variant: "destructive",
    });

    if (!ok) return;

    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  if (!session) return null;

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-2 h-auto py-2 hover:bg-white/5 transition-colors group"
          >
            <Avatar className="h-8 w-8 border border-white/10 group-hover:border-primary/20 transition-colors shadow-sm">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {session.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start truncate">
              <span className="font-medium text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                {session.user.name}
              </span>
              <span className="text-xs text-muted-foreground truncate w-full max-w-[140px] group-hover:text-muted-foreground/80 transition-colors">
                {session.user.email}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-sidebar/95 backdrop-blur-xl border-white/10 text-sidebar-foreground"
        >
          <DropdownMenuLabel className="text-muted-foreground">
            My Account
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="focus:bg-white/5 focus:text-foreground cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
