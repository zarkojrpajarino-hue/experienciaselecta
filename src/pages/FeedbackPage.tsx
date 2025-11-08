import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useSearchParams } from "react-router-dom";


const feedbackSchema = z.object({
  generalRating: z.number().min(1, "Por favor selecciona una puntuación").max(5),
  understoodPurpose: z.boolean().nullable(),
  howKnewUs: z.string().trim().max(200).optional(),
  intuitiveComment: z.string().trim().max(500).optional(),
  suggestion: z.string().trim().max(500).optional(),
});

const FeedbackPage = () => {
  const [searchParams] = useSearchParams();
  
  const [generalRating, setGeneralRating] = useState(0);
  const [hoveredGeneralRating, setHoveredGeneralRating] = useState(0);
  const [understoodPurpose, setUnderstoodPurpose] = useState<boolean | null>(null);
  const [howKnewUs, setHowKnewUs] = useState("");
  const [intuitiveComment, setIntuitiveComment] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [basketName, setBasketName] = useState("");

  const showPurchaseQuestion = Boolean(sessionStorage.getItem('pendingPurchaseFeedback')) && !sessionStorage.getItem('feedbackGiven');
  const [purchaseRating, setPurchaseRating] = useState(0);
  const [hoveredPurchaseRating, setHoveredPurchaseRating] = useState(0);

  // Pre-fill basket_name if coming from email
  useEffect(() => {
    const basket = searchParams.get('basket');
    if (basket) {
      setBasketName(decodeURIComponent(basket));
      setHowKnewUs(`Email recordatorio - ${decodeURIComponent(basket)}`);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      feedbackSchema.parse({ 
        generalRating,
        understoodPurpose,
        howKnewUs,
        intuitiveComment,
        suggestion
      });
      
      if (showPurchaseQuestion && purchaseRating === 0) {
        toast.error('Por favor valora tu experiencia de compra');
        return;
      }

      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          userName: user?.email || 'Usuario anónimo',
          generalRating,
          purchaseRating: showPurchaseQuestion ? purchaseRating : null,
          understoodPurpose,
          howKnewUs: howKnewUs.trim() || null,
          intuitiveComment: intuitiveComment.trim() || null,
          suggestion: suggestion.trim() || null,
          isPostPurchase: showPurchaseQuestion,
        },
      });

      if (error) throw error;

      sessionStorage.setItem('feedbackGiven', 'true');
      try {
        sessionStorage.removeItem('pendingPurchaseFeedback');
        window.dispatchEvent(new CustomEvent('pendingFeedbackChanged'));
      } catch {}

      toast.success('¡Gracias por tu feedback!', {
        description: 'Tu opinión nos ayuda a mejorar.',
      });

      // Reset form
      setGeneralRating(0);
      setUnderstoodPurpose(null);
      setHowKnewUs("");
      setIntuitiveComment("");
      setSuggestion("");
      
      setTimeout(() => {
        window.location.assign('/');
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
    <div className="min-h-screen bg-white isolate py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button in top left */}
        <button
          onClick={() => window.location.assign('/')}
          className="flex items-center gap-2 text-black font-poppins font-bold text-base hover:opacity-70 transition-opacity mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver.
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-black mb-3">
            <span className="capitalize">t</span>u opinión nos importa.
          </h1>
          
          <p className="text-black/80 font-poppins text-base sm:text-lg max-w-xl mx-auto">
            <span className="capitalize">a</span>yúdanos a <span className="font-bold">mejorar</span> tu experiencia en nuestra web.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-[60] bg-black backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* General Rating */}
            <div className="space-y-4">
              <label className="text-base sm:text-lg font-poppins font-medium text-white block">
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
                  className="text-sm sm:text-base text-white/70 text-center font-poppins"
                >
                  {getRatingText(generalRating)}
                </motion.p>
              )}
            </div>

            {showPurchaseQuestion && (
              <div className="space-y-4">
                <label className="text-base sm:text-lg font-poppins font-medium text-white block">
                  ¿Cómo calificarías el sistema de compras de la web?
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {[1,2,3,4,5].map((star) => (
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
                        className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${star <= (hoveredPurchaseRating || purchaseRating) ? 'fill-gold text-gold' : 'fill-crema/20 text-crema/20'}`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Understood Purpose */}
            <div className="space-y-3">
              <label className="text-base sm:text-lg font-poppins font-medium text-white block">
                ¿<span className="capitalize">h</span>as entendido nuestro <span className="font-bold">propósito-mensaje</span>?
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setUnderstoodPurpose(true)}
                  className={`flex-1 font-poppins text-base tracking-normal ${
                    understoodPurpose === true 
                      ? 'bg-gold hover:bg-gold/90 text-black' 
                      : 'bg-transparent border-2 border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  Sí.
                </Button>
                <Button
                  type="button"
                  onClick={() => setUnderstoodPurpose(false)}
                  className={`flex-1 font-poppins text-base tracking-normal ${
                    understoodPurpose === false 
                      ? 'bg-gold hover:bg-gold/90 text-black' 
                      : 'bg-transparent border-2 border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  No.
                </Button>
              </div>
            </div>

            {/* How Knew Us */}
            <div className="space-y-3">
              <label className="text-base sm:text-lg font-poppins font-medium text-white block">
                ¿<span className="capitalize">c</span>ómo <span className="font-bold">nos has conocido</span>?
              </label>
              <Textarea
                value={howKnewUs}
                onChange={(e) => setHowKnewUs(e.target.value)}
                placeholder="Redes sociales, recomendación, búsqueda en Google..."
                rows={3}
                maxLength={200}
                className="bg-white/10 border-2 border-white/30 focus:border-gold resize-none text-white placeholder:text-white/50 font-poppins text-base"
              />
              <p className="text-xs sm:text-sm text-white/50 text-right font-poppins">
                {howKnewUs.length}/200
              </p>
            </div>

            {/* Intuitive Comment */}
            <div className="space-y-3">
              <label className="text-base sm:text-lg font-poppins font-medium text-white block">
                ¿<span className="capitalize">t</span>e ha parecido <span className="font-bold">intuitiva</span> la web?
              </label>
              <Textarea
                value={intuitiveComment}
                onChange={(e) => setIntuitiveComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia..."
                rows={4}
                maxLength={500}
                className="bg-white/10 border-2 border-white/30 focus:border-gold resize-none text-white placeholder:text-white/50 font-poppins text-base"
              />
              <p className="text-xs sm:text-sm text-white/50 text-right font-poppins">
                {intuitiveComment.length}/500
              </p>
            </div>

            {/* Suggestion */}
            <div className="space-y-3">
              <label className="text-base sm:text-lg font-poppins font-medium text-white block">
                ¿<span className="capitalize">a</span>lguna <span className="font-bold">sugerencia concreta</span> - algo que cambiarías o añadirías?
              </label>
              <Textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Tus ideas son valiosas..."
                rows={4}
                maxLength={500}
                className="bg-white/10 border-2 border-white/30 focus:border-gold resize-none text-white placeholder:text-white/50 font-poppins text-base"
              />
              <p className="text-xs sm:text-sm text-white/50 text-right font-poppins">
                {suggestion.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 relative z-[70]">
              <Button
                type="submit"
                disabled={generalRating === 0 || understoodPurpose === null || isSubmitting}
                className="relative z-[70] w-full bg-white hover:bg-white/90 text-black font-poppins font-extrabold text-base tracking-normal border-2 border-black shadow-2xl pointer-events-auto disabled:opacity-100"
              >
                <motion.div
                  animate={isSubmitting ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: isSubmitting ? Infinity : 0 }}
                  className="flex items-center gap-2 justify-center"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? (
                    <>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar.
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
          className="text-center text-black/60 font-poppins text-sm mt-8"
        >
          <span className="capitalize">g</span>racias por ayudarnos a <span className="font-bold">mejorar</span> cada día.
        </motion.p>
      </div>
    </div>
  );
};

export default FeedbackPage;
