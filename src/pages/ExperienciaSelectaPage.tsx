import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageNavigation from "@/components/PageNavigation";
import CarouselSection from "@/components/CarouselSection";
import experienciaFamiliaCestaImg from "@/assets/experiencia-padel-cesta-clean.png";
import selectaJamonPizarraImg from "@/assets/selecta-jamon-pizarra-clean.png";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp } from "lucide-react";

const ExperienciaSelectaPage = () => {
  const navigate = useNavigate();

  const experienciaSelectaSlides = [
    {
      image: experienciaFamiliaCestaImg,
      backgroundColor: "#FFFFFF",
      textColor: "#D4AF37",
      navigationColor: "#ff1493",
      content: (
        <div className="flex flex-col items-center justify-center gap-1 md:gap-3">
          <h3 
            className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-tight" 
            style={{ color: '#000000' }}
          >
            Experiencia
          </h3>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg font-work-sans lowercase first-letter:capitalize" style={{ color: '#00BFFF' }}>
            Momentos que conectan.
          </p>
        </div>
      )
    },
    {
      image: selectaJamonPizarraImg,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <div className="flex flex-col items-center justify-center gap-1 md:gap-3">
          <h3 
            className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-tight" 
            style={{ color: '#000000' }}
          >
            Selecta
          </h3>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg font-work-sans lowercase first-letter:capitalize" style={{ color: '#ff1493' }}>
            Calidad sin igual.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen font-work-sans bg-white">
      <PageNavigation />
      
      {/* Experiencia Section */}
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
              onClick={() => navigate("/")}
              variant="ghost"
              className="text-gold hover:text-gold/80 hover:bg-gold/10"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver
            </Button>
          </motion.div>

          <motion.div 
            id="experiencia"
            initial={{ opacity: 0, x: -100 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }} 
            className="mb-20 max-w-5xl mx-auto"
          >
            <div className="p-8 md:p-12 rounded-3xl transition-all duration-500" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-relaxed" style={{ color: '#000000' }}>
                  Experiencia
                </h2>
              </div>
              
              <div className="space-y-6 font-lora text-lg leading-relaxed text-center font-bold" style={{ color: '#000000' }}>
                <p className="normal-case first-letter:uppercase lowercase">
                  nos enseñaron a desconectar. nosotros preferimos <span style={{ color: '#D4AF37' }}>reconectar</span>.
                </p>
                
                <p className="normal-case first-letter:uppercase lowercase">
                  creamos espacios donde la <span style={{ color: '#D4AF37' }}>conversación importa</span> y <span style={{ color: '#D4AF37' }}>mirar a los ojos</span> no da miedo.
                </p>

                <p className="normal-case first-letter:uppercase lowercase">
                  porque conocer es <span style={{ color: '#D4AF37' }}>escuchar y compartir</span>. ahí empieza lo auténtico.
                </p>
              </div>
              
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => {
                    const selectaElement = document.getElementById('selecta');
                    if (selectaElement) {
                      selectaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  variant="ghost"
                  size="lg"
                  className="text-gold hover:text-gold/80 hover:bg-gold/10"
                >
                  Ir a Selecta
                  <ArrowUp className="h-6 w-6 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Carrusel Section */}
      <div className="py-8">
        <CarouselSection 
          slides={experienciaSelectaSlides}
        />
      </div>

      {/* Selecta Section */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            id="selecta"
            initial={{ opacity: 0, x: 100 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }} 
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
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-relaxed" style={{ color: '#000000' }}>
                  Selecta
                </h2>
              </div>

              <div className="space-y-6 font-lora text-lg leading-relaxed text-center font-bold" style={{ color: '#000000' }}>
                <p className="normal-case first-letter:uppercase lowercase">
                  trabajamos con <span style={{ color: '#D4AF37' }}>productores españoles</span>. personas reales, <span style={{ color: '#D4AF37' }}>productos excepcionales</span>.
                </p>

                <p className="normal-case first-letter:uppercase lowercase">
                  priorizamos <span style={{ color: '#D4AF37' }}>calidad sobre cantidad</span>. en productos, momentos y relaciones.
                </p>

                <p className="normal-case first-letter:uppercase lowercase">
                  <span style={{ color: '#D4AF37' }}>sostenibilidad</span> y <span style={{ color: '#D4AF37' }}>compromiso local</span> son nuestra esencia.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ExperienciaSelectaPage;
