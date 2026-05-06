import { useEffect, useState } from "react";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

const listeners: Array<(t: ToastItem) => void> = [];

function emit(t: ToastItem) {
  listeners.forEach((l) => l(t));
}

export const toast = {
  success: (message: string) => emit({ id: Date.now().toString(), message, type: "success" }),
  error: (message: string) => emit({ id: Date.now().toString(), message, type: "error" }),
  info: (message: string) => emit({ id: Date.now().toString(), message, type: "info" }),
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (t: ToastItem) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3000);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in ${
            t.type === "success"
              ? "bg-neon-green/20 border border-neon-green/40 text-neon-green"
              : t.type === "error"
                ? "bg-destructive/20 border border-destructive/40 text-destructive"
                : "bg-card border border-border text-foreground"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
