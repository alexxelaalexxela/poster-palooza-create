import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePosterStore } from '@/store/usePosterStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
//import { useQueryClient } from '@tanstack/react-query';

/**
 * Mapping of template IDs to both a user‑friendly name (used in the UI)
 * and a richer description (sent to the backend so the generation function
 * receives a clear style guide).
 */
const templates: Record<number, { name: string; description: string }> = {
  1: {
    name: 'Manga',
    description: `
    Illustration au trait monochrome façon affiche rétro-vintage mêlant esthétique manga et voyage. 
    Scène épurée composée uniquement de noirs et d’un fond crème clair, sans dégradés ni couleurs superflues, 
    où de fines hachures croisées et quelques aplats pleins suggèrent ombres et textures. 
    Composition en format portrait avec :
      • Sujet central : une silhouette manga stylisée en trois-quarts arrière, traits minimalistes…
      • Arrière-plan graphique : monument iconique dessiné à la plume…
      • Lettrage vintage : un cartouche rectangulaire en haut porte le titre…
      • Éléments d’accent : quelques idéogrammes ou symboles graphiques…
    
    Le style global reste sobre et intemporel, jouant sur l’alternance de traits nets…
  `.trim(),
  },
  2: {
    name: 'Vintage',
    description:
      'Illustration vectorielle minimaliste au style rétro façon affiche touristique vintage. Scène naturelle épurée, composée de larges aplats de couleurs chaudes et douces (sable, ocre, orange, vert doux pour la plage, ou autre pour etre adapté au theme), sans contours ni détails superflus. Perspective simple sur une plage avec la mer à l’horizon et un soleil couchant. Silhouettes humaines stylisées, sans traits du visage. Mise en page équilibrée avec un titre en haut, en majuscules, utilisant une typographie sans-serif épaisse, arrondie, bien espacée, dans une couleur contrastant harmonieusement avec le fond. L’ambiance est calme, chaleureuse, intemporelle et invite à la détente.',
  },
  3: {
    name: 'Modern',
    description:
      'New version Bold geometric shapes, gradient backgrounds and sleek sans‑serif headlines.',
  },
  4: {
    name: 'Abstract',
    description:
      'Vibrant contrasting colours with free‑form geometric or organic patterns.',
  },
};

const getTemplate = (id: number | null) =>
  id && templates[id] ? templates[id] : { name: 'Unknown', description: '' };

const PromptBar = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedTemplate, setGeneratedUrls } = usePosterStore();
  const { toast } = useToast();
  //const queryClient = useQueryClient();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Please enter a prompt',
        description: "Describe what kind of poster you'd like to create.",
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: 'Please select a template',
        description: 'Choose a template style before generating posters.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Starting poster generation...');

      const { name: templateName, description: templateDescription } =
        getTemplate(selectedTemplate);

      setGeneratedUrls([]);
      console.log('Invoking generate-posters function with:', {
        prompt: prompt.trim(),
        templateName,
        templateDescription,
        hasImage: false,
      });
      const { data, error } = await supabase.functions.invoke('generate-posters', {
        body: {
          prompt: prompt.trim(),
          templateName,
          templateDescription, // <-- send the description instead of the name
          hasImage: false,
        },
      });

      console.log('Poster generation response:', data, error);


      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Generation failed');
      //setGeneratedUrls(data.imageUrls);
      //setGeneratedUrls(Array.isArray(data.imageUrls) ? data.imageUrls : []);
      const urls =
        Array.isArray(data.imageUrls) ? data.imageUrls :
          Array.isArray(data.poster?.image_urls) ? data.poster.image_urls :
            [];

      setGeneratedUrls(urls);

      console.log('data urls', urls);

      toast({
        title: 'Posters generated successfully!',
        description: 'Your custom posters are ready. Check them out below!',
      });

      // Refresh the posters query
      //queryClient.invalidateQueries({ queryKey: ['generated-posters'] });
      setPrompt('');
    } catch (error: any) {
      console.error('Error generating posters:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate posters. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const currentTemplate = getTemplate(selectedTemplate);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
        Describe your poster idea
      </h2>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white/60 backdrop-blur rounded-2xl ring-1 ring-[#c8d9f2] p-6">
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your poster idea... (e.g., 'A motivational quote about success with mountain backdrop')"
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none transition-all duration-200"
                rows={3}
                disabled={isGenerating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedTemplate ? (
                  <span>
                    Template: <strong>{currentTemplate.name}</strong>
                  </span>
                ) : (
                  <span className="text-orange-600">⚠️ Please select a template first</span>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || !selectedTemplate}
                className="px-6 py-3 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  'Generate Posters'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default PromptBar;
