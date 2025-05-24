
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-blue to-pastel-mint py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 mb-8">
            About Postfilio
          </h1>
          <div className="text-6xl mb-8">🎨</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-8 md:p-12 drop-shadow-lg space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              At Postfilio, we believe that everyone deserves access to beautiful, professional-quality poster design. 
              Our mission is to democratize design by making it simple, fast, and accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">🚀 Innovation</h3>
              <p className="text-gray-700 leading-relaxed">
                We harness the power of artificial intelligence to transform your ideas into stunning visual designs. 
                Our advanced algorithms understand your vision and bring it to life in seconds.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Simplicity</h3>
              <p className="text-gray-700 leading-relaxed">
                No design experience? No problem. Our intuitive interface makes poster creation as simple as 
                describing your idea. Just tell us what you want, and we'll handle the rest.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">🌟 Quality</h3>
              <p className="text-gray-700 leading-relaxed">
                Every poster generated through Postfilio meets professional design standards. We ensure 
                high-resolution outputs suitable for both digital use and physical printing.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">💚 Accessibility</h3>
              <p className="text-gray-700 leading-relaxed">
                Design should be for everyone. We're committed to making professional-quality design tools 
                accessible to creators of all backgrounds and skill levels.
              </p>
            </div>
          </div>

          <div className="text-center border-t border-gray-200 pt-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Community</h3>
            <p className="text-lg text-gray-700 mb-6">
              Whether you're creating posters for events, marketing campaigns, or personal projects, 
              Postfilio is here to help you express your creativity with confidence.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              Start Creating Today
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
