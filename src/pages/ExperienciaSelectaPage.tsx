import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageNavigation from "@/components/PageNavigation";
import ImageCarousel3D from "@/components/ImageCarousel3D";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp } from "lucide-react";

// Import Experiencia images
import experiencia1 from "@/assets/experiencia-1-clean.png";
import experiencia2 from "@/assets/experiencia-2-clean.png";
import experiencia3 from "@/assets/experiencia-3-clean.png";
import experiencia4 from "@/assets/proposito-pareja-cocinando-clean.png";
import experiencia5 from "@/assets/experiencia-5.png";

// Import Selecta images
import selecta1 from "@/assets/selecta-1-clean.png";
import selecta2 from "@/assets/selecta-2-clean.png";
import selecta3 from "@/assets/selecta-3-clean.png";
import selecta4 from "@/assets/selecta-4-clean.png";
import selecta5 from "@/assets/selecta-5-clean.png";

const ExperienciaSelectaPage = () => {
  const navigate = useNavigate();

  const experienciaSlides = [
    {
      image: experiencia1,
      text: (
        <p>
          Experiencia Selecta no es para <span className="text-gold font-bold">todo el mundo</span>.
        </p>
      )
    },
    {
      image: experiencia2,
      text: (
        <p>
          Las dinámicas que acompañan cada cesta, son <span className="text-gold font-bold">preguntas que invitan a pensar</span>, a dialogar, a abrirse, a mostrar quiénes somos realmente.
        </p>
      )
    },
    {
      image: experiencia3,
      text: (
        <p>
          No son las preguntas que haces cada día, sino las que <span className="text-gold font-bold">despiertan algo</span>, las que te hacen <span className="text-gold font-bold">mirar hacia dentro</span> y compartir lo que normalmente no se dice.
        </p>
      )
    },
    {
      image: experiencia4,
      text: (
        <p>
          Nuestro propósito es que las personas puedan <span className="text-gold font-bold">manifestar realmente que piensan</span>, quien son, que tú <span className="text-gold font-bold">conozcas a las personas que te rodean</span>. En una sociedad en la que cada vez hay <span className="text-gold font-bold">menos cosas reales</span> desgraciadamente.
        </p>
      )
    },
    {
      image: experiencia5,
      text: (
        <p>
          Porque la cesta es solo la excusa: lo que ofrecemos es una <span className="text-gold font-bold">experiencia humana, íntima y única</span>, una oportunidad para descubrir personas… y a uno mismo.
        </p>
      )
    }
  ];

  const selectaSlides = [
    {
      image: selecta1,
      text: (
        <p>
          En Selecta celebramos <span className="text-gold font-bold">lo nuestro</span>.
        </p>
      )
    },
    {
      image: selecta2,
      text: (
        <p>
          Cada producto que elegimos tiene <span className="text-gold font-bold">sello nacional</span>, elaborado por manos que cuidan la <span className="text-gold font-bold">tradición, la calidad y la sostenibilidad</span>.
        </p>
      )
    },
    {
      image: selecta3,
      text: (
        <p>
          Apoyamos el <span className="text-gold font-bold">comercio nacional</span>, trabajamos directamente con <span className="text-gold font-bold">productores</span>, con personas que viven de lo que hacen, y apostamos por que el <span className="text-gold font-bold">valor se quede aquí, en nuestra tierra</span>.
        </p>
      )
    },
    {
      image: selecta4,
      text: (
        <p>
          Creemos que los productos de nuestra tierra no deberían reservarse solo para ocasiones especiales: <span className="text-gold font-bold">hacemos accesible lo excepcional</span>, llevando lo mejor de nuestra gastronomía a todos los hogares.
        </p>
      )
    },
    {
      image: selecta5,
      text: (
        <p>
          En cada cesta hay <span className="text-gold font-bold">compromiso, cercanía y respeto</span> por lo que somos. Porque para crear algo <span className="text-gold font-bold">memorable y único</span>, hace falta un acompañamiento a la altura, apoyar lo nuestro y compartirlo con quienes más queremos.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen font-work-sans bg-white">
      
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
              onClick={() => navigate("/#categoria-cestas")}
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
            className="mb-12 max-w-6xl mx-auto"
          >
            <div className="p-8 md:p-12 rounded-3xl transition-all duration-500" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-relaxed" style={{ color: '#000000' }}>
                  Experiencia.
                </h2>
              </div>
              
              <div className="space-y-6 font-lora text-lg leading-relaxed text-center" style={{ color: '#000000' }}>
                <p className="normal-case first-letter:uppercase lowercase">
                  <span className="font-bold" style={{ color: '#000000' }}>nos enseñaron a <span className="text-gold">desconectar</span>. nosotros preferimos <span className="text-gold">reconectar</span>.</span>
                </p>
                
                <p className="normal-case first-letter:uppercase lowercase">
                  <span className="font-bold" style={{ color: '#000000' }}>creamos espacios donde la <span className="text-gold">conversación importa</span> y <span className="text-gold">mirar a los ojos</span> no da miedo.</span>
                </p>

                <p className="normal-case first-letter:uppercase lowercase">
                  <span className="font-bold" style={{ color: '#000000' }}>porque <span className="text-gold">conocer</span> es <span className="text-gold">escuchar</span> y <span className="text-gold">compartir</span>. ahí empieza lo <span className="text-gold">auténtico</span>.</span>
                </p>
              </div>
            </div>

            {/* Experiencia Carousel */}
            <div className="mt-12">
              <div className="flex justify-center mb-8">
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
              <ImageCarousel3D slides={experienciaSlides} title="Experiencia" carouselId="experiencia" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Selecta Section */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            id="selecta"
            initial={{ opacity: 0, x: 100 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }} 
            className="mb-12 max-w-6xl mx-auto"
          >
            <div className="p-8 md:p-12 transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-work-sans font-bold leading-relaxed" style={{ color: '#000000' }}>
                  Selecta.
                </h2>
              </div>

              <div className="space-y-6 font-lora text-lg leading-relaxed text-center" style={{ color: '#000000' }}>
                <p className="normal-case first-letter:uppercase lowercase">
                  <span className="font-bold" style={{ color: '#000000' }}>trabajamos con <span className="text-gold">productores españoles</span>. <span className="text-gold">personas reales</span>, <span className="text-gold">productos excepcionales</span>.</span>
                </p>

                <p className="normal-case first-letter:uppercase lowercase">
                  <span className="font-bold" style={{ color: '#000000' }}>priorizamos <span className="text-gold">calidad sobre cantidad</span>. en <span className="text-gold">productos, momentos y relaciones</span>.</span>
                </p>

                <p className="normal-case first-letter:uppercase lowercase">
                  <span className="font-bold" style={{ color: '#000000' }}><span className="text-gold">sostenibilidad</span> y <span className="text-gold">compromiso local</span> son nuestra esencia.</span>
                </p>
              </div>
            </div>

            {/* Selecta Carousel */}
            <div className="mt-12">
              <div className="flex justify-center mb-8">
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
              <ImageCarousel3D slides={selectaSlides} title="Selecta" carouselId="selecta" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ExperienciaSelectaPage;
