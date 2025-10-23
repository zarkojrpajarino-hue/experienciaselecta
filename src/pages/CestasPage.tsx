
import BasketCategories from "@/components/BasketCategories";
import VisualHeader from "@/components/VisualHeader";
import ScrollIndicator from "@/components/ScrollIndicator";
import PageNavigation from "@/components/PageNavigation";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CestasPage = () => {
  const navigate = useNavigate();
  // Prevent auto-scroll on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If coming from external catalog (/cestas#cesta-ID), redirect to full-site section
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#cesta-')) {
      navigate('/experiencia-selecta', { replace: true });
    }
  }, [navigate]);

  return <div className="min-h-screen font-work-sans bg-white">
      
      <PageNavigation />
      
      {/* Hero Section with rotating images */}
      <div className="relative">
        
        <ScrollIndicator />
      </div>
      
      {/* Basket Categories Section */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BasketCategories />
        </div>
      </section>
    </div>;
};
export default CestasPage;