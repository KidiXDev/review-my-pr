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
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 px-2">
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
        </div>
      </div>
    </div>
  );
}
