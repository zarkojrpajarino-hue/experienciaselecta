import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PageNavigation from "@/components/PageNavigation";
import { useNavigate } from "react-router-dom";
import historyBackgroundImg from "@/assets/historia-familia-invernadero-clean.png";
import teamBackgroundImg from "@/assets/equipo-background-embutidos-clean-v2.png";
import ctaBackgroundImg from "@/assets/cta-background-jamon-clean-v2.png";
import aboutBackgroundImg from "@/assets/sobre-nosotros-jamon-clean.png";
import CarouselSection from "@/components/CarouselSection";
import planDiferenteImg from "@/assets/beneficio-plan-diferente-pareja-terraza-clean.png";
import cuandoDondeQuierasImg from "@/assets/beneficio-donde-quieras-grupo-jardin-clean.png";
import conocerEscucharImg from "@/assets/conocer-amigos-sala-clean.png";
import momentosUnicosImg from "@/assets/beneficio-momentos-familia-cocina-clean.png";
import conversacionesProfundasImg from "@/assets/proposito-sobremesas-clean.png";
import alternativaAsequibleImg from "@/assets/beneficio-asequible-grupo-rooftop-clean.png";
import equipoBackgroundImg from "@/assets/equipo-pareja-chimenea-clean.png";
import ctaBackgroundImgNew from "@/assets/cta-pareja-balcon-clean.png";

const SobreNosotrosDetalle = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<number>(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(0);
  
  const carouselSectionRef = useRef<HTMLDivElement>(null);

  // Auto-rotate carousel cards - only when no card is expanded
  useEffect(() => {
    if (expandedCard !== null) return;

    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, [expandedCard]);

  const handleCardClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveCard(index);
    setExpandedCard(expandedCard === index ? null : index);
  };

  const carouselCards = [
    {
      title: "nuestra historia",
      subtitle: "el origen",
      backgroundImage: historyBackgroundImg
    },
    {
      title: "nuestro equipo",
      subtitle: "expertos en conexión",
      backgroundImage: equipoBackgroundImg
    },
    {
      title: "crea tu experiencia",
      subtitle: "únete",
      backgroundImage: ctaBackgroundImgNew,
      highlightWord: "sobre"
    }
  ];

  const benefitsSlides = [{
    image: planDiferenteImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#00BFFF",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            diferente.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            es <span style={{ color: '#00BFFF' }}>atreverse</span>.
          </p>
        </>
  }, {
    image: cuandoDondeQuierasImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#FFD700",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            pausa.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            es <span style={{ color: '#FFD700' }}>vivir</span>.
          </p>
        </>
  }, {
    image: conocerEscucharImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#ff1493",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            conocer.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            es <span style={{ color: '#ff1493' }}>escuchar</span>.
          </p>
        </>
  }, {
    image: momentosUnicosImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#00BFFF",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            valioso.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            necesita <span style={{ color: '#00BFFF' }}>tiempo</span>.
          </p>
        </>
  }, {
    image: conversacionesProfundasImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#FFD700",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            propósito.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            falta en <span style={{ color: '#FFD700' }}>planes</span>.
          </p>
        </>
  }, {
    image: alternativaAsequibleImg,
    backgroundColor: "#FFFFFF",
    textColor: "#000000",
    navigationColor: "#ff1493",
    content: <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            sobremesas.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            son <span style={{ color: '#ff1493' }}>disfrutar</span>.
          </p>
        </>
  }];


  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      
      {/* Back Button - Above Hero Section */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Button
            onClick={() => {
              navigate('/#categoria-cestas');
            }}
            variant="ghost"
            className="text-black hover:text-gold hover:bg-transparent transition-all duration-300 font-work-sans"
          >
            <ArrowLeft className="mr-2" size={20} />
            Volver
          </Button>
        </motion.div>
      </div>
      
      
      {/* Sección Porque Elegirnos */}
      <section id="porque-elegirnos-section" className="relative overflow-hidden py-2">
        <CarouselSection slides={benefitsSlides} position="right" imageHeightClasses="h-[180px] md:h-[220px]" />
      </section>

      {/* Botón Ver Más Sobre Nosotros */}
      <div className="pt-16 pb-8 flex justify-center">
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => {
          const element = document.getElementById('carousel-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}>
          <p className="text-black hover:text-gold font-work-sans font-bold text-lg lowercase first-letter:uppercase tracking-wider transition-all duration-300">
            ver más sobre nosotros
          </p>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-0 bg-transparent text-black hover:text-gold transition-all duration-300"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </div>
      
      {/* Carousel Section - Always Open */}
      <section 
        id="carousel-section"
        ref={carouselSectionRef}
        className="relative z-10 overflow-hidden pt-6 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <Button
                onClick={() => {
                  navigate('/#categoria-cestas');
                }}
                variant="ghost"
                className="text-black hover:text-gold hover:bg-transparent transition-all duration-300 font-work-sans"
              >
                <ArrowLeft className="mr-2" size={20} />
                Volver
              </Button>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold lowercase first-letter:uppercase">
                <span className="text-black">sobre</span>{' '}
                <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">nosotros</span>
              </h1>
            </motion.div>

            {/* Carousel Cards */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                height: 'auto',
                opacity: 1
              }}
              transition={{ 
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="overflow-visible"
            >
              <div className="flex justify-center pb-8 px-4">
                <div className="flex gap-3 md:gap-4 w-full max-w-6xl overflow-x-scroll md:overflow-visible snap-x snap-mandatory scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {carouselCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ 
                        opacity: activeCard === index ? 1 : 0.6,
                        x: activeCard === index ? 0 : 20,
                        scale: activeCard === index ? 1 : 0.95
                      }}
                      transition={{ duration: 0.5 }}
                      className={`flex-shrink-0 w-40 sm:w-48 md:w-56 lg:w-64 snap-center snap-always transition-all duration-500 ${
                        activeCard === index ? 'opacity-100' : 'opacity-60'
                      }`}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedCard === index}
                        onClick={(e) => handleCardClick(index, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            // @ts-ignore
                            handleCardClick(index, e as any);
                          }
                        }}
                        className={`relative h-28 md:h-36 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                          activeCard === index ? 'ring-4 ring-gold' : ''
                        } cursor-pointer focus:outline-none focus:ring-4 focus:ring-gold/70`}
                        style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,${index === 2 ? '0.25' : '0.15'}), rgba(0,0,0,${index === 2 ? '0.25' : '0.15'})), url(${card.backgroundImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2 md:p-4">
                          <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
                            <h3 className="text-sm sm:text-base md:text-lg font-cinzel font-bold lowercase first-letter:uppercase text-white">
                              {card.title}
                            </h3>
                            <button
                              onClick={(e) => handleCardClick(index, e)}
                              className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-gold/20 hover:bg-gold/30 border-2 border-gold flex items-center justify-center transition-all duration-300 hover:scale-110"
                            >
                              <motion.div
                                animate={{ rotate: expandedCard === index ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {expandedCard === index ? (
                                  <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-gold" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gold" />
                                )}
                              </motion.div>
                            </button>
                          </div>
                          <p className="text-white font-roboto font-bold text-xs md:text-sm lowercase first-letter:uppercase">{card.subtitle}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Expanded Content */}
            <motion.div
              initial={false}
              animate={{ 
                height: expandedCard !== null ? 'auto' : 0,
                opacity: expandedCard !== null ? 1 : 0
              }}
              transition={{ 
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="overflow-hidden"
            >
              {expandedCard === 0 && (
                <div className="rounded-lg p-8 max-w-4xl mx-auto relative overflow-hidden">
                  <div className="space-y-6 font-poppins text-black text-lg leading-relaxed relative z-10 text-center">
                    <p className="first-letter:uppercase lowercase text-xl font-semibold">
                      nace de la necesidad de <span className="text-gold font-bold">reconectar</span> con lo que importa.
                    </p>
                    <p className="first-letter:uppercase lowercase font-medium">
                      en un mundo donde todos están <span className="text-gold font-bold">conectados</span> pero pocos se <span className="text-gold font-bold">conocen de verdad</span>.
                    </p>
                    <p className="first-letter:uppercase lowercase font-medium">
                      creemos que la <span className="text-gold font-bold">gastronomía ibérica</span> es el pretexto perfecto para <span className="text-gold font-bold">pausar</span>, compartir y crear <span className="text-gold font-bold">conexiones auténticas</span>.
                    </p>
                    <p className="first-letter:uppercase lowercase font-medium">
                      combinamos productos de <span className="text-gold font-bold">calidad</span> con dinámicas diseñadas para facilitar <span className="text-gold font-bold">conversaciones profundas</span> y momentos únicos.
                    </p>
                  </div>
                </div>
              )}

              {expandedCard === 1 && (
                <div className="rounded-lg p-8 max-w-4xl mx-auto relative overflow-hidden">
                  <div className="space-y-6 font-poppins text-black text-lg leading-relaxed relative z-10 text-center">
                    <p className="first-letter:uppercase lowercase text-xl font-semibold">
                      somos <span className="text-gold font-bold">psicólogos</span>, <span className="text-gold font-bold">gastrónomos</span> y <span className="text-gold font-bold">facilitadores</span> apasionados por las relaciones humanas.
                    </p>
                    <p className="first-letter:uppercase lowercase font-medium">
                      cada uno aporta su <span className="text-gold font-bold">experiencia</span> para crear momentos que van más allá de una simple comida.
                    </p>
                    <p className="first-letter:uppercase lowercase font-medium">
                      estudiamos el <span className="text-gold font-bold">comportamiento humano</span>, seleccionamos los mejores <span className="text-gold font-bold">productos</span> y diseñamos dinámicas que facilitan la <span className="text-gold font-bold">conexión real</span>.
                    </p>
                    <p className="first-letter:uppercase lowercase font-medium">
                      nuestro objetivo es transformar cada encuentro en una <span className="text-gold font-bold">experiencia memorable</span> llena de conversaciones auténticas y vínculos duraderos.
                    </p>
                  </div>
                </div>
              )}

              {expandedCard === 2 && (
                <div className="rounded-lg p-8 max-w-4xl mx-auto relative overflow-hidden">
                  <div className="space-y-6 font-poppins text-black text-lg leading-relaxed text-center relative z-10">
                    <p className="text-2xl first-letter:uppercase lowercase font-bold">
                      ¿estás listo para vivir algo <span className="text-gold font-bold">diferente</span>?
                    </p>
                    <p className="first-letter:uppercase lowercase font-medium">
                      escoge tu <span className="text-gold font-bold">cesta</span>, reúne a quien quieras y crea <span className="text-gold font-bold">recuerdos</span> que durarán para siempre.
                    </p>
                    <p className="first-letter:uppercase lowercase font-medium">
                      cada experiencia está diseñada para que <span className="text-gold font-bold">conectes de verdad</span> con las personas que te importan.
                    </p>
                  </div>
                  <div className="flex justify-center pt-6 relative z-10">
                    <Button 
                      size="lg" 
                      variant="ghost"
                      className="text-gold font-bold hover:text-black hover:bg-transparent transition-all duration-300 font-work-sans uppercase tracking-wide text-lg"
                      onClick={() => navigate('/#categoria-cestas')}
                    >
                      Ver Cestas
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobreNosotrosDetalle;
