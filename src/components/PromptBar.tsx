
import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePosterStore } from '@/store/usePosterStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const PromptBar = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedTemplate } = usePosterStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getTemplateName = (templateId: number | null) => {
    const templates = {
      1: 'Minimalist',
      2: 'Vintage', 
      3: 'Modern',
      4: 'Abstract'
    };
    return templateId ? templates[templateId as keyof typeof templates] : 'Unknown';
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what kind of poster you'd like to create.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "Please select a template",
        description: "Choose a template style before generating posters.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Starting poster generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-posters', {
        body: {
          prompt: prompt.trim(),
          templateName: getTemplateName(selectedTemplate),
          hasImage: false
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      console.log('Generation successful:', data);

      toast({
        title: "Posters generated successfully!",
        description: "Your custom posters are ready. Check them out below!",
      });

      // Refresh the posters query
      queryClient.invalidateQueries({ queryKey: ['generated-posters'] });
      
      // Clear the prompt
      setPrompt('');

    } catch (error) {
      console.error('Error generating posters:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate posters. Please try again.",
        variant: "destructive",
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
                  <span>Template: <strong>{getTemplateName(selectedTemplate)}</strong></span>
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
