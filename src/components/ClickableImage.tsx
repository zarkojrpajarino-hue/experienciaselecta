import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    <>
      <div 
        className={`relative group cursor-pointer ${containerClassName}`} 
        onClick={() => setIsOpen(true)}
      >
        <div className={`overflow-hidden ${rounded ? 'rounded-3xl' : ''} ${shadow ? 'shadow-2xl group-hover:shadow-gold/50' : ''} transition-all duration-300`}>
          <img
            src={src}
            alt={alt}
            className={`group-hover:scale-105 transition-transform duration-500 ${className}`}
          />
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent hideClose className="max-w-7xl bg-transparent border-0 p-2 shadow-none rounded-3xl overflow-hidden">
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          <DialogDescription className="sr-only">Imagen ampliada</DialogDescription>
          <Button 
            onClick={() => setIsOpen(false)} 
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30" 
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto max-h-[85vh] object-contain rounded-3xl" 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClickableImage;
