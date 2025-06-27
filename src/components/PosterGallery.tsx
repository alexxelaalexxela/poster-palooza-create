

/* ──────────────────────────────────────────────────────────────
   PosterGallery.tsx
   Affiche UNIQUEMENT les posters générés lors du prompt courant :
   aucune lecture dans Supabase, aucune requête React-Query.
   ────────────────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { usePosterStore } from '@/store/usePosterStore';
import { useToast } from '@/hooks/use-toast';

const PosterGallery = () => {
  /* Zustand : images en mémoire + sélection courante */
  //const { generatedUrls, selectedPoster, setSelectedPoster } = usePosterStore();
  const { generatedUrls = [], selectedPoster, setSelectedPoster } = usePosterStore();
  const { toast } = useToast();

  /* Rien à afficher ? */
  if (!generatedUrls.length) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          No posters generated yet
        </h2>
        <p className="text-center text-gray-600">
          Generate your first poster using the prompt input above!
        </p>
      </motion.section>
    );
  }

  /* Transforme le tableau d’URL en objets uniformes */
  const allImages = generatedUrls.map((url, index) => ({
    id: `gen-${index}`,
    url,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
        Generated Posters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`bg-white/80 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2] p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${selectedPoster === index ? 'ring-2 ring-indigo-500 bg-indigo-50/80' : ''
              }`}
            onClick={() => setSelectedPoster(index)}
          >
            <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg">
              <img
                src={image.url}
                alt={`Generated poster ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PosterGallery;



/*
import { motion } from 'framer-motion';
import { usePosterStore } from '@/store/usePosterStore';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface GeneratedPoster {
  id: string;
  prompt_text: string;
  template_name: string;
  image_urls: string[];
  prompts_used: string[];
  created_at: string;
}

const PosterGallery = () => {
  const { selectedTemplate, selectedPoster, setSelectedPoster } = usePosterStore();
  const { toast } = useToast();

  const { data: posters, isLoading, error } = useQuery({
    queryKey: ['generated-posters', selectedTemplate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_posters')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as GeneratedPoster[];
    },
    enabled: !!selectedTemplate
  });

  if (!selectedTemplate) return null;

  if (isLoading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          Loading generated posters...
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2] p-4 animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </motion.section>
    );
  }

  if (error) {
    toast({
      title: "Error loading posters",
      description: "Failed to load generated posters. Please try again.",
      variant: "destructive",
    });
  }

  if (!posters || posters.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          No posters generated yet
        </h2>
        <p className="text-center text-gray-600">
          Generate your first poster using the prompt input above!
        </p>
      </motion.section>
    );
  }

  // Flatten all images from all posters for display
  const allImages = posters.flatMap((poster, posterIndex) => 
    poster.image_urls.map((url, imageIndex) => ({
      id: `${poster.id}-${imageIndex}`,
      url,
      posterId: poster.id,
      posterIndex,
      imageIndex,
      prompt: poster.prompts_used[imageIndex] || poster.prompt_text,
      originalPrompt: poster.prompt_text
    }))
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
        Generated Posters
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`bg-white/80 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2] p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              selectedPoster === index ? 'ring-2 ring-indigo-500 bg-indigo-50/80' : ''
            }`}
            onClick={() => setSelectedPoster(index)}
          >
            <div className="aspect-[3/4] mb-3 overflow-hidden rounded-lg">
              <img
                src={image.url}
                alt={`Generated poster: ${image.originalPrompt}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {image.originalPrompt}
              </p>
              <p className="text-xs text-gray-600 line-clamp-3">
                {image.prompt}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default PosterGallery;
*/