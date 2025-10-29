import type { FC, ReactNode, ReactElement, ButtonHTMLAttributes, HTMLAttributes } from "react";
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
  forwardRef,
  isValidElement,
  cloneElement,
  createContext,
} from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

// Lightweight, Radix-free Dialog implementation to avoid React interop issues
// API-compatible with shadcn/ui exports used across the app

type OpenChangeHandler = (open: boolean) => void;

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?: OpenChangeHandler;
  children?: ReactNode;
}

const Dialog: FC<DialogProps> = ({ open, defaultOpen, modal, onOpenChange, children }) => {
  const isControlled = typeof open === "boolean";
  const [internalOpen, setInternalOpen] = useState(!!defaultOpen);
  const actualOpen = isControlled ? (open as boolean) : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const value = useMemo(() => ({ open: actualOpen, setOpen }), [actualOpen, setOpen]);

  useEffect(() => {
    if (!actualOpen || typeof document === 'undefined') return;
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    
    // Bloquear scroll en body y html para evitar problemas de posicionamiento
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
    };
  }, [actualOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!actualOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [actualOpen, setOpen]);

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
};

// Trigger
interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: ReactNode;
}

const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ asChild, onClick, children, ...props }, ref) => {
    const ctx = useContext(DialogContext);
    if (!ctx) return asChild && isValidElement(children) ? (children as any) : <button {...props} ref={ref} />;

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      onClick?.(e);
      if (!e.defaultPrevented) ctx.setOpen(true);
    };

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement, {
        onClick: (e: any) => {
          (children as any).props?.onClick?.(e);
          handleClick(e);
        },
        ref,
      });
    }

    return (
      <button type="button" onClick={handleClick} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);
DialogTrigger.displayName = "DialogTrigger";

// Close
interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(({ asChild, onClick, children, ...props }, ref) => {
  const ctx = useContext(DialogContext);
  if (!ctx) return asChild && isValidElement(children) ? (children as any) : <button {...props} ref={ref} />;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (!e.defaultPrevented) ctx.setOpen(false);
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement, {
      onClick: (e: any) => {
        (children as any).props?.onClick?.(e);
        handleClick(e);
      },
      ref,
    });
  }

  return (
    <button type="button" onClick={handleClick} ref={ref} {...props}>
      {children}
    </button>
  );
});
DialogClose.displayName = "DialogClose";

// Portal & Overlay
const DialogPortal: FC<{ children?: ReactNode }> = ({ children }) => {
  if (typeof document === "undefined") return null;
  return createPortal(children as ReactNode, document.body);
};

const DialogOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, onClick, style, ...props }, ref) => {
    const ctx = useContext(DialogContext);
    return (
      <div
        ref={ref}
        onClick={(e) => {
          onClick?.(e as any);
          if (!(e as any).defaultPrevented) ctx?.setOpen(false);
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className,
        )}
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = "DialogOverlay";

// Content
interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  hideClose?: boolean;
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(({ className, children, hideClose = false, style, ...props }, ref) => {
  const ctx = useContext(DialogContext);

  if (!ctx || !ctx.open) return null;

  return (
    <DialogPortal>
      <DialogOverlay data-state="open" onClick={(e) => e.stopPropagation()}>
        <div
          role="dialog"
          aria-modal="true"
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            zIndex: 9999,
            maxHeight: '90vh',
            maxWidth: '100%',
            overflowY: 'auto',
            margin: '1rem',
            ...style
          }}
          className={cn(
            "grid w-full gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
          {...props}
        >
          {children}
          {!hideClose && (
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          )}
        </div>
      </DialogOverlay>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

// Header / Footer / Title / Description
const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(({ className, asChild, children, ...props }, ref) => {
  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement, {
      ref,
      className: cn("text-lg font-semibold leading-none tracking-tight", className, (children as any).props?.className),
      ...props,
    });
  }
  return (
    <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h2>
  );
});
DialogTitle.displayName = "DialogTitle";

interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, asChild, children, ...props }, ref) => {
    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement, {
        ref,
        className: cn("text-sm text-muted-foreground", className, (children as any).props?.className),
        ...props,
      });
    }
    return (
      <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}>
        {children}
      </p>
    );
  },
);
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
