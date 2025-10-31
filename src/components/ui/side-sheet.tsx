import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

// Lightweight right-side sheet without Radix to avoid React interop issues
const SideSheet: React.FC<SideSheetProps> = ({ open, onOpenChange, title, className, children }) => {
  useEffect(() => {
    console.log('[SideSheet] State changed:', open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Post-mount check of DOM presence and position
    setTimeout(() => {
      const el = document.getElementById('side-sheet-root');
      if (el) {
        const rect = el.getBoundingClientRect();
        console.log('[SideSheet] Root present. rect=', rect);
      } else {
        console.warn('[SideSheet] Root NOT found in DOM');
      }
    }, 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const content = (
    <div id="side-sheet-root" className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-full sm:max-w-2xl bg-background shadow-xl border-l",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="text-lg font-semibold text-foreground">{title}</div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-57px)] bg-background">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default SideSheet;
