import { useState } from "react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ClickableImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  rounded?: boolean;
  shadow?: boolean;
}

const ClickableImage = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  rounded = true,
  shadow = true
}: ClickableImageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div 
          className={`relative group cursor-pointer ${containerClassName}`}
        >
          <div className={`overflow-hidden ${rounded ? 'rounded-3xl' : ''} ${shadow ? 'shadow-2xl group-hover:shadow-gold/50' : ''} transition-all duration-300`}>
            <img
              src={src}
              alt={alt}
              className={`group-hover:scale-105 transition-transform duration-500 ${className}`}
            />
          </div>
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        side="right" 
        align="start"
        className="w-auto max-w-2xl p-0 border-2 border-black/10 rounded-[2rem] overflow-hidden shadow-2xl"
        sideOffset={20}
      >
        <div className="relative">
          <Button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 z-50 h-10 w-10 rounded-full bg-white/95 hover:bg-white text-black shadow-lg transition-all duration-300 border-2 border-black/10 hover:border-black/30" 
            size="icon"
            aria-label="Cerrar imagen"
          >
            <X className="h-5 w-5" />
          </Button>
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto max-h-[70vh] object-contain rounded-[2rem]" 
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ClickableImage;
