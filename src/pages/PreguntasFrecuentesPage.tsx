import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CarouselSection from "@/components/CarouselSection";
import ContactModal from "@/components/ContactModal";
import faqParejaRooftop from "@/assets/faq-pareja-rooftop-clean.png";
import faqAmigosMesa from "@/assets/faq-amigos-mesa-clean.png";
import faqParejaMontana from "@/assets/faq-pareja-montana-clean.png";
import faqGrupoPatio from "@/assets/faq-grupo-patio-clean.png";
import faqParejaMar from "@/assets/faq-pareja-mar-clean.png";
import faqAmigosProyector from "@/assets/faq-amigos-proyector-clean.png";
import faqGrupoInvernadero from "@/assets/faq-grupo-invernadero-clean.png";
import faqConversacionBiblioteca from "@/assets/faq-conversacion-biblioteca-clean.png";
import faqParejaCostaNueva from "@/assets/faq-pareja-costa-nueva.png";
import faqFamiliaPorche from "@/assets/faq-familia-porche-clean.png";
import faqParejaVinedo from "@/assets/faq-pareja-vinedo-clean.png";
import faqProductoresLocales from "@/assets/faq-productores-locales.png";
import faqJamonPinzas from "@/assets/faq-jamon-pinzas.png";

const PreguntasFrecuentesPage = () => {
  const navigate = useNavigate();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }, []);

  const allSlides = [
    {
      image: faqParejaRooftop,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-4 lowercase first-letter:uppercase tracking-wide">
            ¿qué incluye cada cesta?
          </h3>
          <p className="lowercase first-letter:capitalize font-montserrat font-bold text-base md:text-lg">
            <span className="font-bold" style={{ color: '#FFD700' }}>Contenido</span> <span className="font-bold" style={{ color: '#FFD700' }}>exclusivo</span> <span className="font-bold" style={{ color: '#FFD700' }}>personalizado</span>.
          </p>
        </>
      )
    },
    {
      image: faqAmigosMesa,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-4 lowercase first-letter:uppercase tracking-wide">
            ¿cuánto dura la experiencia?
          </h3>
          <p className="lowercase first-letter:capitalize font-montserrat font-bold text-base md:text-lg">
            A tu <span className="font-bold" style={{ color: '#ff1493' }}>ritmo</span>.
          </p>
        </>
      )
    },
    {
      image: faqParejaCostaNueva,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-4 lowercase first-letter:uppercase tracking-wide">
            ¿para desconocidos?
          </h3>
          <p className="lowercase first-letter:capitalize font-montserrat font-bold text-base md:text-lg">
            Cestas para <span className="font-bold" style={{ color: '#00BFFF' }}>primeros encuentros</span>.
          </p>
        </>
      )
    },
    {
      image: faqJamonPinzas,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-4 lowercase first-letter:uppercase tracking-wide">
            ¿calidad de productos?
          </h3>
          <p className="lowercase first-letter:capitalize font-montserrat font-bold text-base md:text-lg">
            <span className="font-bold" style={{ color: '#FFD700' }}>Certificada</span>.
          </p>
        </>
      )
    },
    {
      image: faqProductoresLocales,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-4 lowercase first-letter:uppercase tracking-wide">
            ¿de dónde vienen los productos?
          </h3>
          <p className="lowercase first-letter:capitalize font-montserrat font-bold text-base md:text-lg">
            De productores <span className="font-bold" style={{ color: '#00BFFF' }}>locales</span>.
          </p>
        </>
      )
    },
    {
      image: faqAmigosProyector,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-4 lowercase first-letter:uppercase tracking-wide">
            ¿qué combináis en las experiencias?
          </h3>
          <p className="lowercase first-letter:capitalize font-montserrat font-bold text-base md:text-lg">
            <span className="font-bold" style={{ color: '#FFD700' }}>tradición</span> <span className="font-bold" style={{ color: '#FFD700' }}>española</span> con <span className="font-bold" style={{ color: '#FFD700' }}>dinámicas modernas</span>.
          </p>
        </>
      )
    },
    {
      image: faqParejaVinedo,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-4 lowercase first-letter:uppercase tracking-wide">
            ¿cuál es vuestra filosofía?
          </h3>
          <p className="lowercase first-letter:capitalize font-montserrat font-bold text-base md:text-lg">
            Los mejores <span className="font-bold" style={{ color: '#ff1493' }}>recuerdos</span> <span className="font-bold" style={{ color: '#ff1493' }}>se viven</span>, no se graban.
          </p>
        </>
      )
    },
    {
      image: faqFamiliaPorche,
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      content: (
        <>
          <h3 className="text-xl md:text-2xl font-cinzel font-bold mb-4 lowercase first-letter:uppercase tracking-wide">
            ¿por qué son importantes las conexiones?
          </h3>
          <p className="lowercase first-letter:capitalize font-montserrat font-bold text-base md:text-lg">
            Hablamos más pero <span className="font-bold" style={{ color: '#00BFFF' }}>escuchamos menos</span>.
          </p>
        </>
      )
    }
  ];



  return (
    <div className="min-h-screen bg-white font-work-sans">
      {/* Back Button */}
      <section className="relative pt-8 pb-2 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="text-gold hover:text-gold/80 hover:bg-gold/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Espacio superior para centrar */}
      <div className="pt-16 md:pt-24"></div>

      {/* Sección única fusionada de FAQ y Valores */}
      <CarouselSection slides={allSlides} position="right" />
      
      {/* Botón Contáctanos */}
      <div className="py-16 md:py-32 flex justify-center bg-white">
        <ContactModal>
          <div className="flex flex-col items-center gap-2 cursor-pointer">
            <p className="text-black hover:text-gray-600 font-cinzel font-bold text-2xl md:text-3xl lowercase first-letter:uppercase tracking-wide transition-all duration-300">
              contáctanos
            </p>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-0 bg-transparent text-black hover:text-gray-600 transition-all duration-300"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </ContactModal>
      </div>
    </div>
  );
};

export default PreguntasFrecuentesPage;
