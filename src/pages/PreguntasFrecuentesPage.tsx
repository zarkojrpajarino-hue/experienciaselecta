import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoundedImageCarousel from "@/components/RoundedImageCarousel";
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

  const faqSlides = [
    { image: faqParejaRooftop, title: "¿Qué incluye cada cesta?", text: "Contenido exclusivo personalizado." },
    { image: faqAmigosMesa, title: "¿Cuánto dura la experiencia?", text: "A tu ritmo." },
    { image: faqParejaCostaNueva, title: "¿Para desconocidos?", text: "Cestas para primeros encuentros." },
    { image: faqJamonPinzas, title: "¿Calidad de productos?", text: "Certificada." },
    { image: faqProductoresLocales, title: "¿De dónde vienen los productos?", text: "De productores locales." },
    { image: faqAmigosProyector, title: "¿Qué combináis en las experiencias?", text: "Tradición española con dinámicas modernas." },
    { image: faqParejaVinedo, title: "¿Cuál es vuestra filosofía?", text: "Los mejores recuerdos se viven, no se graban." },
    { image: faqFamiliaPorche, title: "¿Por qué son importantes las conexiones?", text: "Hablamos más pero escuchamos menos." }
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
      <RoundedImageCarousel slides={faqSlides} autoPlay />
      
      {/* Botón Contáctanos */}
      <div className="py-16 md:py-32 flex justify-center bg-white">
        <ContactModal>
          <div className="flex flex-col items-center gap-2 cursor-pointer">
            <p className="text-black hover:text-gray-600 font-work-sans font-bold text-2xl md:text-3xl tracking-wide transition-all duration-300" style={{ textTransform: "none" }}>
              Contáctanos.
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
