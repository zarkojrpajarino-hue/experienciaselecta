import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
interface BasketCTASectionProps {
  basketImage: string;
  basketName: string;
  position?: "left" | "right";
  arrowColor?: string;
  textColor?: string;
}
const BasketCTASection = ({
  basketImage,
  basketName,
  position = "left",
  arrowColor = "#D4AF37",
  textColor = "#D4AF37"
}: BasketCTASectionProps) => {
  const navigate = useNavigate();
  const [isImageOpen, setIsImageOpen] = useState(false);
  return <>
      <section className="py-8 md:py-10 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent hideClose className="max-w-7xl bg-transparent border-0 p-0 shadow-none rounded-3xl overflow-hidden">
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          <DialogDescription className="sr-only">Imagen ampliada</DialogDescription>
          <Button onClick={() => setIsImageOpen(false)} className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30" size="icon">
            <X className="h-6 w-6" />
          </Button>
          <div className="rounded-[1.5rem] overflow-hidden border-2 border-black/10 bg-white">
            <img src={basketImage} alt={basketName} className="w-full h-auto max-h-[80vh] object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </>;
};
export default BasketCTASection;