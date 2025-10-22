
import ProcessSteps from "@/components/ProcessSteps";
import AboutSection from "@/components/AboutSection";
import PageNavigation from "@/components/PageNavigation";
import experienciaBg from "@/assets/experiencia-selecta-nuevo.jpg";

const ExperienciaPage = () => {
  return (
    <div 
      className="min-h-screen font-work-sans"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${experienciaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundAttachment: 'scroll',
        backgroundColor: 'black'
      }}
    >
      
      <PageNavigation />
      <AboutSection />
      <ProcessSteps />
    </div>
  );
};

export default ExperienciaPage;