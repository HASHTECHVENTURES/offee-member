import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { mainNav, bottomNav } from "@/components/layout/nav-config";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mounted) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [mounted, open, onOpenChange]);

  const run = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <CommandDialog
          open={open}
          onOpenChange={onOpenChange}
          title="Command palette"
          description="Navigate or search"
        >
          <CommandInput placeholder="Search pages..." />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Execution">
              {mainNav.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => run(item.href)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="size-4 opacity-70" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Other">
              {bottomNav.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => run(item.href)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="size-4 opacity-70" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      )}
    </AnimatePresence>
  );
}
