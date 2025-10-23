import { motion } from "framer-motion";
import { useState } from "react";

import PageNavigation from "@/components/PageNavigation";
import { Heart, Sparkles, ArrowLeft, ArrowUp, ArrowRight, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect } from "react";
import trioIbericoImg from "@/assets/trio-iberico-nuevo-clean.jpg";
const NuestraIdentidadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isImageOpen, setIsImageOpen] = useState(false);

  // Scroll to section based on hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [location]);
  
  return <div id="nuestra-identidad-page" className="min-h-screen font-work-sans">
      
      <PageNavigation />
      
      {/* Experiencia Section - Combo negro con blanco */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button
              onClick={() => navigate("/#nosotros")}
              variant="ghost"
              className="text-gold hover:text-gold/80 hover:bg-gold/10"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver
            </Button>
          </motion.div>

          {/* Experiencia Section */}
          <motion.div 
            id="experiencia"
            initial={{
              opacity: 0,
              x: -100
            }} 
            whileInView={{
              opacity: 1,
              x: 0
            }} 
            transition={{
              duration: 0.8
            }} 
            viewport={{
              once: true
            }} 
            className="mb-20 max-w-5xl mx-auto"
          >
            <div className="p-8 md:p-12 rounded-3xl transition-all duration-500" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-relaxed normal-case first-letter:uppercase" style={{ color: '#000000' }}>
                  Experiencia
                </h2>
              </div>
              
              <div className="space-y-6 font-lora text-lg leading-relaxed text-center font-bold" style={{ color: '#000000' }}>
                <p className="normal-case first-letter:uppercase lowercase">
                  cada día hablamos más, pero <span style={{ color: '#0066FF' }}>escuchamos menos</span>. nos enseñaron que el tiempo libre es para desconectar. <span style={{ color: '#0066FF' }}>nosotros creemos que es para reconectar</span>.
                </p>
                
                <p className="normal-case first-letter:uppercase lowercase">
                  los mejores recuerdos <span style={{ color: '#0066FF' }}>no se graban, se viven</span>. creamos espacios donde la conversación importa, donde el silencio no es incómodo, donde <span style={{ color: '#0066FF' }}>mirar a los ojos no da miedo</span>.
                </p>

                <p className="normal-case first-letter:uppercase lowercase">
                  porque conocer no es saludar, es <span style={{ color: '#0066FF' }}>escuchar</span>. no es coincidir, es <span style={{ color: '#0066FF' }}>compartir</span>. abrirse no es fácil, pero ahí empieza lo auténtico.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Image Modal */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent hideClose className="max-w-7xl bg-transparent border-0 p-2 shadow-none rounded-3xl overflow-hidden">
          <DialogTitle className="sr-only">Vista previa de imagen</DialogTitle>
          <DialogDescription className="sr-only">Imagen ampliada</DialogDescription>
          <Button 
            onClick={() => setIsImageOpen(false)} 
            className="absolute top-4 right-4 z-50 h-12 w-12 rounded-full bg-white/95 hover:bg-white text-black shadow-2xl transition-all duration-300 border-2 border-black/10 hover:border-black/30" 
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          <img 
            src={trioIbericoImg} 
            alt="Nuestra Identidad" 
            className="w-full h-auto max-h-[80vh] object-contain rounded-3xl" 
          />
        </DialogContent>
      </Dialog>

      {/* Selecta Section - Combo blanco */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            id="selecta"
            initial={{
              opacity: 0,
              x: 100
            }} 
            whileInView={{
              opacity: 1,
              x: 0
            }} 
            transition={{
              duration: 0.8
            }} 
            viewport={{
              once: true
            }} 
            className="mb-20 max-w-5xl mx-auto"
          >
            <div className="p-8 md:p-12 transition-all duration-500">
              <div className="flex justify-center mb-6">
                <Button
                  onClick={() => {
                    const experienciaElement = document.getElementById('experiencia');
                    if (experienciaElement) {
                      experienciaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  variant="ghost"
                  size="lg"
                  className="text-gold hover:text-gold/80 hover:bg-gold/10"
                >
                  <ArrowUp className="h-6 w-6 mr-2" />
                  Ir a Experiencia
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-relaxed normal-case first-letter:uppercase" style={{ color: '#000000' }}>
                  Selecta
                </h2>
              </div>

              <div className="space-y-6 font-lora text-lg leading-relaxed text-center font-bold" style={{ color: '#000000' }}>
                <p className="normal-case first-letter:uppercase lowercase">
                  trabajamos directamente con <span className="text-pink-500">productores españoles</span> que conocen la tierra, respetan los tiempos de la dehesa y cuidan cada detalle. <span className="text-pink-500">personas reales, productos excepcionales</span>.
                </p>

                <p className="normal-case first-letter:uppercase lowercase">
                  selecta es <span className="text-pink-500">priorizar la calidad sobre la cantidad</span>. en los productos, en los momentos, en las relaciones. porque la libertad es poder elegir qué merece tu tiempo.
                </p>

                <p className="normal-case first-letter:uppercase lowercase">
                  <span className="text-pink-500">sostenibilidad</span> es parte de nuestra esencia. elegimos <span className="text-pink-500">empaques responsables</span>, apoyamos <span className="text-pink-500">economías locales</span> y trabajamos con <span className="text-pink-500">proveedores comprometidos</span> con el medio ambiente.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      </div>;
};
export default NuestraIdentidadPage;