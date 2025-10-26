import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const feedbackSchema = z.object({
  generalRating: z.number().min(1, "Por favor selecciona una puntuación").max(5),
  purchaseRating: z.number().min(1).max(5).optional(),
  understoodPurpose: z.boolean().nullable(),
  intuitiveComment: z.string().trim().max(500).optional(),
  suggestion: z.string().trim().max(500).optional(),
});

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  showPurchaseQuestion?: boolean; // true para post-compra, false para menú
  orderId?: string; // ID del pedido para feedback post-compra
}

const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  userName, 
  showPurchaseQuestion = false,
  orderId 
}: FeedbackModalProps) => {
  const [generalRating, setGeneralRating] = useState(0);
  const [hoveredGeneralRating, setHoveredGeneralRating] = useState(0);
  
  const [purchaseRating, setPurchaseRating] = useState(0);
  const [hoveredPurchaseRating, setHoveredPurchaseRating] = useState(0);
  
  const [understoodPurpose, setUnderstoodPurpose] = useState<boolean | null>(null);
  const [intuitiveComment, setIntuitiveComment] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate data
      feedbackSchema.parse({ 
        generalRating,
        purchaseRating: showPurchaseQuestion ? purchaseRating : undefined,
        understoodPurpose,
        intuitiveComment,
        suggestion
      });
      
      setIsSubmitting(true);

      // Get user data
      const { data: { user } } = await supabase.auth.getUser();

      // Send feedback email via edge function
      const { error } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          userName: userName || user?.email || 'Usuario anónimo',
          generalRating,
          purchaseRating: showPurchaseQuestion ? purchaseRating : null,
          understoodPurpose,
          intuitiveComment: intuitiveComment.trim() || null,
          suggestion: suggestion.trim() || null,
          isPostPurchase: showPurchaseQuestion,
        },
      });

      if (error) throw error;

      // Mark feedback as given in this session (same key for both types)
      sessionStorage.setItem('feedbackGiven', 'true');

      toast.success('¡Gracias por tu feedback!', {
        description: 'Tu opinión nos ayuda a mejorar.',
      });

      onClose();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Error submitting feedback:', error);
        toast.error('Error al enviar tu feedback. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const getRatingText = (rating: number) => {
    switch(rating) {
      case 1: return "Mejorable";
      case 2: return "Podría ser mejor";
      case 3: return "Buena";
      case 4: return "Muy buena";
      case 5: return "¡Excelente!";
      default: return "";
    }
  };

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-petroleo backdrop-blur-sm border-2 border-crema/20 rounded-2xl p-0 z-[100]">
        <DialogTitle className="sr-only">Feedback de la web</DialogTitle>
        <DialogDescription className="sr-only">
          Deja tu opinión sobre tu experiencia en la web
        </DialogDescription>
        
        <div className="relative p-6">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-crema/10 transition-colors text-crema"
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
              className="w-16 h-16 bg-gradient-to-br from-mango/20 to-gold/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-4xl">💬</span>
            </motion.div>
            
            <h2 className="text-2xl font-poppins font-bold text-crema mb-2">
              <span className="capitalize">t</span>u opinión nos importa
            </h2>
            
            {userName && (
              <p className="text-lg font-poppins mb-1 text-crema/90">
                <span className="font-bold capitalize">{userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}</span>
              </p>
            )}
            
            <p className="text-crema/70 font-poppins text-sm">
              <span className="capitalize">a</span>yúdanos a mejorar tu experiencia
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Rating */}
            <div className="space-y-3">
              <label className="text-sm font-poppins font-medium text-crema">
                <span className="capitalize">v</span>aloración <span className="font-bold">general</span> de la web
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setGeneralRating(star)}
                    onMouseEnter={() => setHoveredGeneralRating(star)}
                    onMouseLeave={() => setHoveredGeneralRating(0)}
                    className="p-0 bg-transparent border-0 cursor-pointer"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (hoveredGeneralRating || generalRating)
                          ? 'fill-gold text-gold'
                          : 'fill-crema/20 text-crema/20'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {generalRating > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-crema/70 text-center"
                >
                  {getRatingText(generalRating)}
                </motion.p>
              )}
            </div>

            {/* Purchase Rating (only post-purchase) */}
            {showPurchaseQuestion && (
              <div className="space-y-3">
                <label className="text-sm font-poppins font-medium text-crema">
                  ¿<span className="capitalize">c</span>ómo calificarías el <span className="font-bold">sistema de compras</span> de la web?
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPurchaseRating(star)}
                      onMouseEnter={() => setHoveredPurchaseRating(star)}
                      onMouseLeave={() => setHoveredPurchaseRating(0)}
                      className="p-0 bg-transparent border-0 cursor-pointer"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          star <= (hoveredPurchaseRating || purchaseRating)
                            ? 'fill-gold text-gold'
                            : 'fill-crema/20 text-crema/20'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                {purchaseRating > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-crema/70 text-center"
                  >
                    {getRatingText(purchaseRating)}
                  </motion.p>
                )}
              </div>
            )}

            {/* Understood Purpose */}
            <div className="space-y-2">
              <label className="text-sm font-poppins font-medium text-crema">
                ¿<span className="capitalize">h</span>as entendido nuestro <span className="font-bold">propósito-mensaje</span>?
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setUnderstoodPurpose(true)}
                  variant={understoodPurpose === true ? "default" : "outline"}
                  className={`flex-1 ${
                    understoodPurpose === true 
                      ? 'bg-mango hover:bg-mango/90 text-crema' 
                      : 'bg-transparent border-crema/30 text-crema hover:bg-crema/10'
                  }`}
                >
                  <span className="capitalize">s</span>í
                </Button>
                <Button
                  type="button"
                  onClick={() => setUnderstoodPurpose(false)}
                  variant={understoodPurpose === false ? "default" : "outline"}
                  className={`flex-1 ${
                    understoodPurpose === false 
                      ? 'bg-mango hover:bg-mango/90 text-crema' 
                      : 'bg-transparent border-crema/30 text-crema hover:bg-crema/10'
                  }`}
                >
                  <span className="capitalize">n</span>o
                </Button>
              </div>
            </div>

            {/* Intuitive Comment */}
            <div className="space-y-2">
              <label className="text-sm font-poppins font-medium text-crema">
                ¿<span className="capitalize">t</span>e ha parecido <span className="font-bold">intuitiva</span> la web?
              </label>
              <Textarea
                value={intuitiveComment}
                onChange={(e) => setIntuitiveComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia..."
                rows={3}
                maxLength={500}
                className="bg-crema/10 border-crema/30 focus:border-mango resize-none text-crema placeholder:text-crema/50 font-poppins"
              />
              <p className="text-xs text-crema/50 text-right">
                {intuitiveComment.length}/500
              </p>
            </div>

            {/* Suggestion */}
            <div className="space-y-2">
              <label className="text-sm font-poppins font-medium text-crema">
                ¿<span className="capitalize">a</span>lguna <span className="font-bold">sugerencia concreta</span> - algo que cambiarías o añadirías?
              </label>
              <Textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Tus ideas son valiosas..."
                rows={3}
                maxLength={500}
                className="bg-crema/10 border-crema/30 focus:border-mango resize-none text-crema placeholder:text-crema/50 font-poppins"
              />
              <p className="text-xs text-crema/50 text-right">
                {suggestion.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1 bg-transparent border-crema/30 text-crema hover:bg-crema/10 font-poppins"
                disabled={isSubmitting}
              >
                <span className="capitalize">a</span>hora no.
              </Button>
              <Button
                type="submit"
                disabled={generalRating === 0 || (showPurchaseQuestion && purchaseRating === 0) || understoodPurpose === null || isSubmitting}
                className="flex-1 bg-mango hover:bg-mango/90 text-crema font-poppins font-bold"
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

export default FeedbackModal;
