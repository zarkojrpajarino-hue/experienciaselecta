import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1, "Por favor selecciona una puntuación").max(5),
  comment: z.string().trim().max(500, "El comentario debe tener menos de 500 caracteres").optional(),
});

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  basketName: string;
  orderId: string;
  userId: string;
}

const ReviewModal = ({ isOpen, onClose, userName, basketName, orderId, userId }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate data
      reviewSchema.parse({ rating, comment });
      
      setIsSubmitting(true);

      // Insert review into database
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: userId,
          order_id: orderId,
          basket_name: basketName,
          rating,
          comment: comment.trim() || null,
        });

      if (error) throw error;

      toast.success('¡Gracias por tu valoración!', {
        description: 'Tu opinión nos ayuda a mejorar.',
      });

      onClose();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Error submitting review:', error);
        toast.error('Error al enviar tu valoración. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog modal={false} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-card/95 backdrop-blur-sm border-2 border-border/50 rounded-2xl p-0">
        <DialogTitle className="sr-only">Valorar tu compra</DialogTitle>
        <DialogDescription className="sr-only">
          Deja una valoración de tu experiencia
        </DialogDescription>
        
        <div className="relative p-6">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 mt-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-4xl">🎉</span>
            </motion.div>
            
            <h2 className="text-2xl font-poppins font-bold text-primary mb-2">
              ¡Gracias por tu compra!
            </h2>
            
            <p className="text-lg font-work-sans mb-1">
              <span className="font-bold">{userName}</span>
            </p>
            
            <p className="text-muted-foreground font-work-sans text-sm">
              Has comprado: <span className="font-bold text-foreground">{basketName}</span>
            </p>
          </div>

          {/* Rating Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <p className="text-base font-work-sans font-medium mb-4">
                Deja una valoración de tu compra en nuestra web
              </p>
              
              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-0 bg-transparent border-0 cursor-pointer"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  {rating === 1 && "Mejorable"}
                  {rating === 2 && "Podría ser mejor"}
                  {rating === 3 && "Buena"}
                  {rating === 4 && "Muy buena"}
                  {rating === 5 && "¡Excelente!"}
                </motion.p>
              )}
            </div>

            {/* Comment Section */}
            <div className="space-y-2">
              <label className="text-sm font-work-sans font-medium text-primary">
                Comentario (opcional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia..."
                rows={4}
                maxLength={500}
                className="bg-background/50 border-border/50 focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
                disabled={isSubmitting}
              >
                Ahora no
              </Button>
              <Button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="flex-1 bg-secondary hover:bg-secondary/90"
              >
                <motion.div
                  animate={isSubmitting ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: isSubmitting ? Infinity : 0 }}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </motion.div>
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
