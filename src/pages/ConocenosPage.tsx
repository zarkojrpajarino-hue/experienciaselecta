import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import RoundedImageCarousel from "@/components/RoundedImageCarousel";
import { Button } from "@/components/ui/button";

// Importar imágenes
import nuevaSeccion01Img from "@/assets/nueva-seccion-01-clean.png";
import nuevaSeccion02Img from "@/assets/nueva-seccion-02-clean.png";
import nuevaSeccion03Img from "@/assets/nueva-seccion-03-clean.png";
import nuevaSeccion04Img from "@/assets/nueva-seccion-04-clean.png";
import nuevaSeccion05Img from "@/assets/nueva-seccion-05-clean.png";
import nuevaSeccion06Img from "@/assets/nueva-seccion-06-clean.png";
import planDiferenteImg from "@/assets/beneficio-diferente-torre-pimientos.png";
import cuandoDondeQuierasImg from "@/assets/nueva-seccion-03.jpg";
import conocerEscucharImg from "@/assets/nueva-seccion-04-final.jpg";
import momentosUnicosImg from "@/assets/nueva-seccion-05-final.jpg";
import conversacionesProfundasImg from "@/assets/proposito-planes-final.png";
import alternativaAsequibleImg from "@/assets/beneficio-tiempo-enrollados.png";

const ConocenosPage = () => {
  const navigate = useNavigate();

  // Scroll al inicio al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Datos para la sección "Porque no vendemos cestas"
  const processSlides = [
    { 
      image: nuevaSeccion01Img, 
      title: <span style={{color: 'black'}}>Creamos <span style={{color: '#D4AF37', fontWeight: 'bold'}}>experiencias</span> para que vosotros conozcáis a <span style={{color: '#D4AF37', fontWeight: 'bold'}}>personas</span>.</span>
    },
    { 
      image: nuevaSeccion02Img, 
      title: <span style={{color: 'black'}}>Transformamos <span style={{color: '#D4AF37', fontWeight: 'bold'}}>productos gourmet</span> en un plan <span style={{color: '#D4AF37', fontWeight: 'bold'}}>alternativo</span>, <span style={{color: '#D4AF37', fontWeight: 'bold'}}>personalizado</span> y <span style={{color: '#D4AF37', fontWeight: 'bold'}}>asequible</span>.</span>
    },
    { 
      image: nuevaSeccion03Img, 
      title: <span style={{color: "black"}}>Compra o regala cestas que guían hacia una <span style={{color: "#D4AF37", fontWeight: "bold"}}>experiencia única</span> y <span style={{color: "#D4AF37", fontWeight: "bold"}}>personalizada</span>, para explorar <span style={{color: "#D4AF37", fontWeight: "bold"}}>emociones</span> que no conocías y hacer un <span style={{color: "#D4AF37", fontWeight: "bold"}}>regalo original</span> e <span style={{color: "#D4AF37", fontWeight: "bold"}}>inolvidable</span> de forma <span style={{color: "#D4AF37", fontWeight: "bold"}}>asequible</span>.</span>
    },
    { 
      image: nuevaSeccion04Img, 
      title: <span style={{color: "black"}}>Nuestras <span style={{color: "#D4AF37", fontWeight: "bold"}}>dinámicas</span> son <span style={{color: "#D4AF37", fontWeight: "bold"}}>preguntas personalizadas</span> para cada tipo de grupo, diseñadas para generar <span style={{color: "#D4AF37", fontWeight: "bold"}}>diálogos profundos</span>, <span style={{color: "#D4AF37", fontWeight: "bold"}}>conocerse</span>, explorar <span style={{color: "#D4AF37", fontWeight: "bold"}}>sentimientos</span> y <span style={{color: "#D4AF37", fontWeight: "bold"}}>abrirse</span> de forma natural.</span>
    },
    { 
      image: nuevaSeccion05Img, 
      title: <span style={{color: "black"}}>Convertimos una comida excepcional en una <span style={{color: "#D4AF37", fontWeight: "bold"}}>experiencia emocional</span>, <span style={{color: "#D4AF37", fontWeight: "bold"}}>memorable</span>.</span>
    },
    { 
      image: nuevaSeccion06Img, 
      title: <span style={{color: "black"}}>Hacemos posible un <span style={{color: "#D4AF37", fontWeight: "bold"}}>ocio distinto</span>, rompemos la <span style={{color: "#D4AF37", fontWeight: "bold"}}>monotonía</span>, y devolvemos <span style={{color: "#D4AF37", fontWeight: "bold"}}>sentido</span> a compartir.</span>
    }
  ];

  // Datos para la sección "Como te entendemos"
  const benefitsSlides = [
    {
      image: planDiferenteImg,
      title: (
        <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            busca lo distinto.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            <span className="font-bold" style={{ color: '#00BFFF' }}>diferente</span> es <span className="font-bold" style={{ color: '#00BFFF' }}>atreverse</span>.
          </p>
        </>
      )
    },
    {
      image: cuandoDondeQuierasImg,
      title: (
        <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            pausa para vivir.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            <span className="font-bold" style={{ color: '#FFD700' }}>pausa</span> es <span className="font-bold" style={{ color: '#FFD700' }}>vivir</span>.
          </p>
        </>
      )
    },
    {
      image: conocerEscucharImg,
      title: (
        <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            ver no es conocer.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            <span className="font-bold" style={{ color: '#ff1493' }}>conocer es</span> <span className="font-bold" style={{ color: '#ff1493' }}>escuchar</span>.
          </p>
        </>
      )
    },
    {
      image: momentosUnicosImg,
      title: (
        <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            lo valioso lleva tiempo.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            lo <span className="font-bold" style={{ color: '#00BFFF' }}>bueno</span> necesita <span className="font-bold" style={{ color: '#00BFFF' }}>tiempo</span>.
          </p>
        </>
      )
    },
    {
      image: conversacionesProfundasImg,
      title: (
        <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            planes con propósito.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            falta <span className="font-bold" style={{ color: '#FFD700' }}>propósito</span>.
          </p>
        </>
      )
    },
    {
      image: alternativaAsequibleImg,
      title: (
        <>
          <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 lowercase first-letter:uppercase">
            sobremesas reales.
          </h3>
          <p className="font-poppins lowercase first-letter:capitalize">
            ocupar no es <span className="font-bold" style={{ color: '#ff1493' }}>disfrutar</span>.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background font-work-sans">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-10 bg-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-8 border-2 border-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start mb-4">
            <Button 
              variant="link" 
              onClick={() => navigate('/')} 
              className="text-black hover:text-black/80 p-0"
            >
              ← Volver al inicio
            </Button>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-black mb-4">
              Conócenos.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-black">
              Descubre quiénes somos y qué nos mueve.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Espaciado blanco */}
      <div className="bg-white py-8"></div>

      <div id="porque-no-vendemos-cestas" className="bg-white">
        <RoundedImageCarousel slides={processSlides} titleBold={false} />
      </div>

      {/* Espaciado blanco */}
      <div className="bg-white py-8"></div>

      {/* Sección: Como te entendemos */}
      <div id="como-te-entendemos" className="bg-white">
        <RoundedImageCarousel slides={benefitsSlides} titleBold={false} />
      </div>

      {/* Espaciado blanco */}
      <div className="bg-white py-8"></div>
    </div>
  );
};

export default ConocenosPage;
