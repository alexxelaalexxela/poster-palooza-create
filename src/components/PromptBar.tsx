
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PromptBar = () => {
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
    <div className="w-full md:w-3/4 mx-auto">
      <div className="relative bg-[#e9f0fa]/60 ring-1 ring-[#c8d9f2] rounded-2xl p-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Postfilio to generate a poster to show …"
          className="w-full min-h-20 bg-transparent border-none resize-none focus:outline-none focus:ring-0 placeholder-gray-500"
          style={{ resize: 'none' }}
          disabled={isLoading}
          aria-label="Poster description prompt"
        />
        
        {/* File attach button */}
        <button
          onClick={handleFileSelect}
          disabled={isLoading}
          className="absolute bottom-4 left-4 flex items-center space-x-1 text-xs text-gray-600 hover:underline transition-all disabled:opacity-50"
          aria-label="Attach image file"
        >
          <Paperclip size={12} />
          <span>Attach picture of the people (optional)</span>
          {selectedFile && (
            <span className="text-green-600">- {selectedFile.name}</span>
          )}
        </button>
        
        {/* Send Button */}
        <motion.button
          whileHover={{ rotate: 45 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className="absolute bottom-4 right-4 w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50"
          aria-label="Generate poster"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowUp size={16} />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default PromptBar;
