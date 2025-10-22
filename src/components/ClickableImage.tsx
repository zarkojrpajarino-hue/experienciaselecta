import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
        <DialogContent className="max-w-7xl bg-transparent border-0 p-0 shadow-none">
          <Button 
            onClick={() => setIsOpen(false)} 
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-black/80 hover:bg-gold hover:text-black shadow-lg transition-all duration-300 border-0" 
            size="icon"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 90 }} 
              transition={{ duration: 0.3 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          </Button>
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto max-h-[90vh] object-cover rounded-3xl" 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClickableImage;
