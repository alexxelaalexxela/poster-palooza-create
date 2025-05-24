
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PromptInput = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        toast({
          title: "Image attached",
          description: `${file.name} has been attached to your request.`,
        });
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what you'd like your poster to show.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Poster generated!",
        description: "Your beautiful poster has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Postfilio to generate a poster to show …"
          className="w-full min-h-32 p-6 pr-16 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 resize-none transition-colors bg-white drop-shadow-lg"
          disabled={isLoading}
        />
        
        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className="absolute bottom-4 right-4 w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors drop-shadow-lg"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowUp size={20} />
          )}
        </motion.button>
      </div>
      
      {/* File Upload Button */}
      <button
        onClick={handleFileSelect}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
      >
        <Paperclip size={16} />
        <span>Attach picture of the people (optional)</span>
        {selectedFile && (
          <span className="text-green-600">- {selectedFile.name}</span>
        )}
      </button>
    </motion.section>
  );
};

export default PromptInput;
