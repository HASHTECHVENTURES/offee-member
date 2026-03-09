import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CommandPalette } from "@/components/design-system/command-palette";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function AppShell({ children, sidebar }: AppShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = useLocation().pathname;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {sidebar}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden page-gradient">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/80 px-4 backdrop-blur-sm">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 rounded-xl gap-2 text-muted-foreground font-normal border-border/80 transition-all duration-200",
              "hover:bg-muted hover:text-foreground hover:border-primary/20 hover:shadow-sm",
              "focus-visible:ring-2 focus-visible:ring-primary/30"
            )}
            onClick={() => setCommandOpen(true)}
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded-md border border-border bg-muted/80 px-1.5 font-mono text-[10px] font-medium sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-auto">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-full p-6"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
