
import { useState } from 'react';
import { motion } from 'framer-motion';
import PosterTemplateCard from './PosterTemplateCard';

const templates = [
  { id: 1, name: 'Minimalist', image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=400&fit=crop' },
  { id: 2, name: 'Vintage', image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=400&fit=crop' },
  { id: 3, name: 'Modern', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=400&fit=crop' },
  { id: 4, name: 'Abstract', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=400&fit=crop' },
  { id: 5, name: 'Colorful', image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=300&h=400&fit=crop' },
  { id: 6, name: 'Classic', image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=400&fit=crop' },
];

const TemplatePicker = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  return (
    <section className="space-y-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center"
      >
        Choose among these templates
      </motion.h2>
      
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-4 gap-6">
        {templates.map((template) => (
          <PosterTemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            onSelect={() => setSelectedTemplate(template.id)}
          />
        ))}
      </div>
      
      {/* Mobile Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto">
        <div className="flex space-x-4 pb-4" style={{ width: 'max-content' }}>
          {templates.map((template) => (
            <div key={template.id} className="w-48 flex-shrink-0">
              <PosterTemplateCard
                template={template}
                isSelected={selectedTemplate === template.id}
                onSelect={() => setSelectedTemplate(template.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplatePicker;
