import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageNavigation from "@/components/PageNavigation";
import ImageGallery3D from "@/components/ImageGallery3D";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp } from "lucide-react";

// Import Experiencia images
import experiencia1 from "@/assets/experiencia-1.png";
import experiencia2 from "@/assets/experiencia-2.png";
import experiencia3 from "@/assets/experiencia-3.png";
import experiencia4 from "@/assets/experiencia-4.png";
import experiencia5 from "@/assets/experiencia-5.png";

// Import Selecta images
import selecta1 from "@/assets/selecta-1.png";
import selecta2 from "@/assets/selecta-2.png";
import selecta3 from "@/assets/selecta-3.png";
import selecta4 from "@/assets/selecta-4.png";
import selecta5 from "@/assets/selecta-5.png";

const ExperienciaSelectaPage = () => {
  const navigate = useNavigate();

  const experienciaImages = [
    experiencia1,
    experiencia2,
    experiencia3,
    experiencia4,
    experiencia5,
  ];

  const selectaImages = [
    selecta1,
    selecta2,
    selecta3,
    selecta4,
    selecta5,
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
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-poppins font-bold leading-relaxed" style={{ color: '#000000' }}>
                  Experiencia
                </h2>
              </div>
              
              <div className="space-y-6 font-poppins text-base md:text-lg leading-relaxed font-bold" style={{ color: '#000000' }}>
                <p>
                  Experiencia Selecta no es para todo el mundo.
                </p>
                
                <p>
                  Las dinámicas que acompañan cada cesta, son preguntas que invitan a pensar, a dialogar, a abrirse, a mostrar quiénes somos realmente.
                </p>

                <p>
                  No son las preguntas que haces cada día, sino las que despiertan algo, las que te hacen mirar hacia dentro y compartir lo que normalmente no se dice.
                </p>

                <p>
                  Nuestro propósito es que las personas puedan manifestar realmente que piensan, quien son, que tú conozcas a las personas que te rodean. En una sociedad en la que cada vez hay menos cosas reales desgraciadamente.
                </p>

                <p>
                  Porque la cesta es solo la excusa: lo que ofrecemos es una experiencia humana, íntima y única, una oportunidad para descubrir personas… y a uno mismo.
                </p>
              </div>
            </div>

            {/* Experiencia Images Gallery */}
            <div className="mt-12">
              <ImageGallery3D images={experienciaImages} title="Experiencia" />
            </div>
          </motion.div>

          <div className="flex justify-center mt-12">
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

            <div className="p-8 md:p-12 transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-poppins font-bold leading-relaxed" style={{ color: '#000000' }}>
                  Selecta
                </h2>
              </div>

              <div className="space-y-6 font-poppins text-base md:text-lg leading-relaxed font-bold" style={{ color: '#000000' }}>
                <p>
                  En Selecta celebramos lo nuestro.
                </p>

                <p>
                  Cada producto que elegimos tiene sello nacional, elaborado por manos que cuidan la tradición, la calidad y la sostenibilidad.
                </p>

                <p>
                  Apoyamos el comercio nacional, trabajamos directamente con productores, con personas que viven de lo que hacen, y apostamos por que el valor se quede aquí, en nuestra tierra.
                </p>

                <p>
                  Creemos que los productos de nuestra tierra no deberían reservarse solo para ocasiones especiales: hacemos accesible lo excepcional, llevando lo mejor de nuestra gastronomía a todos los hogares.
                </p>

                <p>
                  En cada cesta hay compromiso, cercanía y respeto por lo que somos.
                </p>

                <p>
                  Porque para crear algo memorable y único, hace falta un acompañamiento a la altura, apoyar lo nuestro y compartirlo con quienes más queremos.
                </p>
              </div>
            </div>

            {/* Selecta Images Gallery */}
            <div className="mt-12">
              <ImageGallery3D images={selectaImages} title="Selecta" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ExperienciaSelectaPage;
