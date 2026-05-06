import { createContext, useContext, useState, ReactNode, HTMLAttributes } from "react";
import { clsx } from "clsx";

const TooltipContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false,
  setOpen: () => {},
});

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  asChild: _asChild,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = useContext(TooltipContext);
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
    </div>
  );
}

export function TooltipContent({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { open } = useContext(TooltipContext);
  if (!open) return null;
  return (
    <div
      className={clsx(
        "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-3 py-1.5 text-xs rounded-md bg-popover text-popover-foreground border border-border shadow-md whitespace-nowrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
