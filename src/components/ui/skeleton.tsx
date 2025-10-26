import { cn } from "@/lib/utils";
import { memo } from "react";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted gpu-accelerated", className)} {...props} />;
}

export { Skeleton };
