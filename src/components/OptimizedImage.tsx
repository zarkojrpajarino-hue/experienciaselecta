import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

const OptimizedImage = ({ src, alt, className, priority = false, width, height }: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted/30 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={{ transform: 'translateZ(0)' }}
      />
    </div>
  );
};

export default OptimizedImage;
