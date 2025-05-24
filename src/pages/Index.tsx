
import { motion } from 'framer-motion';
import TemplateCard from '@/components/TemplateCard';
import PromptBar from '@/components/PromptBar';
import PosterGallery from '@/components/PosterGallery';
import FormatPicker from '@/components/FormatPicker';
import QualityPicker from '@/components/QualityPicker';
import OrderBar from '@/components/OrderBar';
import { usePosterStore } from '@/store/usePosterStore';

const templates = [
  { id: 1, name: 'Minimalist', image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=400&fit=crop' },
  { id: 2, name: 'Vintage', image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=400&fit=crop' },
  { id: 3, name: 'Modern', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=400&fit=crop' },
  { id: 4, name: 'Abstract', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=400&fit=crop' },
];

const Index = () => {
  const { selectedTemplate, setSelectedTemplate } = usePosterStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-semibold text-gray-900 text-center"
          >
            Build your own poster and receive it in perfect quality
          </motion.h1>
          
          {/* Gradient divider */}
          <div className="mt-10 h-0.5 w-full bg-gradient-to-r from-transparent via-[#deeaff] to-transparent"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-12">
        
        {/* Template Picker */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-medium">Choose among these templates</h2>
          <div className="grid grid-cols-4 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                onSelect={() => setSelectedTemplate(template.id)}
              />
            ))}
          </div>
        </motion.section>

        {/* Prompt Input */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PromptBar />
        </motion.section>

        {/* Poster Gallery */}
        <PosterGallery />

        {/* Format Picker */}
        <FormatPicker />

        {/* Quality Picker */}
        <QualityPicker />

        {/* Order Bar */}
        <OrderBar />
        
      </div>
    </div>
  );
};

export default Index;
