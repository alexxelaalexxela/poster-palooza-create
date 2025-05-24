
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Radial Gradient Background */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-pastel-purple via-pastel-blue to-pastel-mint"
        style={{
          background: 'radial-gradient(ellipse at center, #fdf8ff 0%, #e0edff 40%, #d9f8f3 100%)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-semibold text-gray-900 mb-6"
        >
          Build your perfect poster 🖼️
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
        >
          Describe your idea, pick a style, get beautiful prints in seconds.
        </motion.p>
      </div>
    </section>
  );
};

export default HeroSection;
