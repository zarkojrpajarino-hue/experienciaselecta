import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const feedbackSchema = z.object({
  generalRating: z.number().min(1, "Por favor selecciona una puntuación").max(5),
  understoodPurpose: z.boolean().nullable(),
  intuitiveComment: z.string().trim().max(500).optional(),
  suggestion: z.string().trim().max(500).optional(),
});

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [generalRating, setGeneralRating] = useState(0);
  const [hoveredGeneralRating, setHoveredGeneralRating] = useState(0);
  const [understoodPurpose, setUnderstoodPurpose] = useState<boolean | null>(null);
  const [intuitiveComment, setIntuitiveComment] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      feedbackSchema.parse({ 
        generalRating,
        understoodPurpose,
        intuitiveComment,
        suggestion
      });
      
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          userName: user?.email || 'Usuario anónimo',
          generalRating,
          purchaseRating: null,
          understoodPurpose,
          intuitiveComment: intuitiveComment.trim() || null,
          suggestion: suggestion.trim() || null,
          isPostPurchase: false,
        },
      });

      if (error) throw error;

      sessionStorage.setItem('feedbackGiven', 'true');

      toast.success('¡Gracias por tu feedback!', {
        description: 'Tu opinión nos ayuda a mejorar.',
      });

      // Reset form
      setGeneralRating(0);
      setUnderstoodPurpose(null);
      setIntuitiveComment("");
      setSuggestion("");
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
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
    <div className="min-h-screen bg-petroleo py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-mango/20 to-gold/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <span className="text-5xl">💬</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-crema mb-3">
            <span className="capitalize">t</span>u opinión nos importa.
          </h1>
          
          <p className="text-crema/80 font-poppins text-base sm:text-lg max-w-xl mx-auto">
            <span className="capitalize">a</span>yúdanos a <span className="font-bold">mejorar</span> tu experiencia en nuestra web.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-petroleo/50 backdrop-blur-sm border-2 border-crema/20 rounded-2xl p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* General Rating */}
            <div className="space-y-4">
              <label className="text-base sm:text-lg font-poppins font-medium text-crema block">
                <span className="capitalize">v</span>aloración <span className="font-bold">general</span> de la web.
              </label>
              <div className="flex justify-center gap-2 sm:gap-3">
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
                      className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
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
                  className="text-sm sm:text-base text-crema/70 text-center font-poppins"
                >
                  {getRatingText(generalRating)}
                </motion.p>
              )}
            </div>

            {/* Understood Purpose */}
            <div className="space-y-3">
              <label className="text-base sm:text-lg font-poppins font-medium text-crema block">
                ¿<span className="capitalize">h</span>as entendido nuestro <span className="font-bold">propósito-mensaje</span>?
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setUnderstoodPurpose(true)}
                  className={`flex-1 font-poppins text-base ${
                    understoodPurpose === true 
                      ? 'bg-mango hover:bg-mango/90 text-crema' 
                      : 'bg-transparent border-2 border-crema/30 text-crema hover:bg-crema/10'
                  }`}
                >
                  <span className="capitalize">s</span>í.
                </Button>
                <Button
                  type="button"
                  onClick={() => setUnderstoodPurpose(false)}
                  className={`flex-1 font-poppins text-base ${
                    understoodPurpose === false 
                      ? 'bg-mango hover:bg-mango/90 text-crema' 
                      : 'bg-transparent border-2 border-crema/30 text-crema hover:bg-crema/10'
                  }`}
                >
                  <span className="capitalize">n</span>o.
                </Button>
              </div>
            </div>

            {/* Intuitive Comment */}
            <div className="space-y-3">
              <label className="text-base sm:text-lg font-poppins font-medium text-crema block">
                ¿<span className="capitalize">t</span>e ha parecido <span className="font-bold">intuitiva</span> la web?
              </label>
              <Textarea
                value={intuitiveComment}
                onChange={(e) => setIntuitiveComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia..."
                rows={4}
                maxLength={500}
                className="bg-crema/10 border-2 border-crema/30 focus:border-mango resize-none text-crema placeholder:text-crema/50 font-poppins text-base"
              />
              <p className="text-xs sm:text-sm text-crema/50 text-right font-poppins">
                {intuitiveComment.length}/500
              </p>
            </div>

            {/* Suggestion */}
            <div className="space-y-3">
              <label className="text-base sm:text-lg font-poppins font-medium text-crema block">
                ¿<span className="capitalize">a</span>lguna <span className="font-bold">sugerencia concreta</span> - algo que cambiarías o añadirías?
              </label>
              <Textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Tus ideas son valiosas..."
                rows={4}
                maxLength={500}
                className="bg-crema/10 border-2 border-crema/30 focus:border-mango resize-none text-crema placeholder:text-crema/50 font-poppins text-base"
              />
              <p className="text-xs sm:text-sm text-crema/50 text-right font-poppins">
                {suggestion.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-transparent border-2 border-crema/30 text-crema hover:bg-crema/10 font-poppins text-base order-2 sm:order-1"
                disabled={isSubmitting}
              >
                <span className="capitalize">v</span>olver.
              </Button>
              <Button
                type="submit"
                disabled={generalRating === 0 || understoodPurpose === null || isSubmitting}
                className="flex-1 bg-mango hover:bg-mango/90 text-crema font-poppins font-bold text-base order-1 sm:order-2"
              >
                <motion.div
                  animate={isSubmitting ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: isSubmitting ? Infinity : 0 }}
                  className="flex items-center gap-2 justify-center"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? (
                    <>
                      <span className="capitalize">e</span>nviando...
                    </>
                  ) : (
                    <>
                      <span className="capitalize">e</span>nviar.
                    </>
                  )}
                </motion.div>
              </Button>
            </div>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-crema/60 font-poppins text-sm mt-8"
        >
          <span className="capitalize">g</span>racias por ayudarnos a <span className="font-bold">mejorar</span> cada día.
        </motion.p>
      </div>
    </div>
  );
};

export default FeedbackPage;
