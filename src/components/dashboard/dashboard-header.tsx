import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  showAction?: boolean;
}

export function DashboardHeader({
  heading,
  text,
  children,
  showAction = true,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 px-2 mb-8">
      <div className="flex items-center justify-between">
        <div className="grid gap-1.5">
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {heading}
          </h1>
          {text && (
            <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-[700px]">
              {text}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
          {children}
          {showAction && (
            <Link href="/dashboard/repos">
              <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Add Repository
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
