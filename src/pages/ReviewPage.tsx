import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1, "Por favor selecciona una puntuación").max(5),
  comment: z.string().trim().min(10, "El comentario debe tener al menos 10 caracteres").max(500),
});

const ReviewPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderExists, setOrderExists] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [basketName, setBasketName] = useState("");

  useEffect(() => {
    const checkOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if order exists and belongs to current user
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            id, 
            customer_id,
            order_items!inner(basket_name)
          `)
          .eq('id', orderId)
          .eq('status', 'completed')
          .single();

        if (orderError || !orderData) {
          setOrderExists(false);
          setIsLoading(false);
          return;
        }

        // Check if user is authenticated and owns this order
        if (!user || orderData.customer_id !== user.id) {
          toast.error('No tienes permiso para valorar esta orden');
          navigate('/');
          return;
        }

        setOrderExists(true);
        
        // Get basket name from first order item
        const firstItem = (orderData as any).order_items?.[0];
        const basketName = firstItem?.basket_name || 'Cesta';
        setBasketName(basketName);

        // Check if already reviewed
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('id')
          .eq('order_id', orderId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (reviewData) {
          setAlreadyReviewed(true);
        }
      } catch (error) {
        console.error('Error checking order:', error);
        setOrderExists(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOrder();
  }, [orderId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId) {
      toast.error('ID de orden no válido');
      return;
    }

    try {
      reviewSchema.parse({ rating, comment });

      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Debes iniciar sesión para dejar una valoración');
        navigate('/');
        return;
      }

      // Insert review
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          order_id: orderId,
          basket_name: basketName,
          rating,
          comment: comment.trim(),
        });

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('Ya has valorado esta orden');
          setAlreadyReviewed(true);
          return;
        }
        throw insertError;
      }

      toast.success('¡Gracias por tu valoración!', {
        description: 'Tu opinión nos ayuda a mejorar.',
      });

      setTimeout(() => {
        navigate('/');
      }, 1500);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!orderId || !orderExists) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-poppins font-bold text-black mb-4">
            Orden no encontrada
          </h1>
          <p className="text-black/70 mb-6">
            No pudimos encontrar esta orden o ya ha sido completada.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-black text-white hover:bg-black/90"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-poppins font-bold text-black mb-4">
            Ya has valorado esta orden
          </h1>
          <p className="text-black/70 mb-6">
            Gracias por tu feedback. Solo puedes valorar una orden una vez.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-black text-white hover:bg-black/90"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white isolate py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
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
            <span className="capitalize">v</span>alora tu experiencia.
          </h1>
          
          <p className="text-black/80 font-poppins text-base sm:text-lg max-w-xl mx-auto">
            <span className="capitalize">t</span>u opinión nos ayuda a <span className="font-bold">seguir mejorando</span>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-[60] bg-black backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Rating */}
            <div className="space-y-4">
              <label className="text-base sm:text-lg font-poppins font-medium text-white block">
                ¿<span className="capitalize">c</span>ómo <span className="font-bold">valorarías</span> tu experiencia?
              </label>
              <div className="flex justify-center gap-2 sm:gap-3">
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
                      className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'fill-gold text-gold'
                          : 'fill-crema/20 text-crema/20'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm sm:text-base text-white/70 text-center font-poppins"
                >
                  {getRatingText(rating)}
                </motion.p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <label className="text-base sm:text-lg font-poppins font-medium text-white block">
                <span className="capitalize">c</span>uéntanos más sobre tu <span className="font-bold">experiencia</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué te gustó? ¿Qué podríamos mejorar?"
                rows={5}
                maxLength={500}
                className="bg-white/10 border-2 border-white/30 focus:border-gold resize-none text-white placeholder:text-white/50 font-poppins text-base"
              />
              <p className="text-xs sm:text-sm text-white/50 text-right font-poppins">
                {comment.length}/500 (mínimo 10 caracteres)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-3 pt-4 relative z-[70]">
              <Button
                type="submit"
                disabled={rating === 0 || comment.trim().length < 10 || isSubmitting}
                className="relative z-[70] w-full bg-white hover:bg-white/90 text-black font-poppins font-extrabold text-base tracking-normal border-2 border-black shadow-2xl pointer-events-auto disabled:opacity-50"
              >
                <motion.div
                  animate={isSubmitting ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: isSubmitting ? Infinity : 0 }}
                  className="flex items-center gap-2 justify-center"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Enviando...' : 'Enviar valoración.'}
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
          <span className="capitalize">g</span>racias por tu <span className="font-bold">confianza</span>.
        </motion.p>
      </div>
    </div>
  );
};

export default ReviewPage;
