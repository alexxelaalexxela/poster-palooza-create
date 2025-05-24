
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const examples = [
  "a vintage travel poster for Lisbon",
  "A motivational poster for students", 
  "An abstract art poster about connection"
];

const PromptBar = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentExample, setCurrentExample] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const { toast } = useToast();

  // Typewriter effect for examples
  useEffect(() => {
    if (!prompt) {
      const currentExampleText = examples[currentExample];
      let index = 0;
      setIsTyping(true);
      
      const typeInterval = setInterval(() => {
        if (index <= currentExampleText.length) {
          setDisplayText(currentExampleText.slice(0, index));
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          
          // Wait before switching to next example
          setTimeout(() => {
            setCurrentExample((prev) => (prev + 1) % examples.length);
          }, 2000);
        }
      }, 80);

      return () => clearInterval(typeInterval);
    }
  }, [currentExample, prompt]);

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

  const placeholderText = prompt ? "" : `Ask Postfilio to generate a poster to show ${displayText}${isTyping ? '|' : ''}`;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 shadow-xl shadow-indigo-100/20"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholderText}
          className="w-full min-h-24 bg-transparent border-none resize-none focus:outline-none focus:ring-0 placeholder-gray-400 text-lg leading-relaxed"
          style={{ resize: 'none' }}
          disabled={isLoading}
          aria-label="Poster description prompt"
        />
        
        {/* File attach button */}
        <button
          onClick={handleFileSelect}
          disabled={isLoading}
          className="absolute bottom-6 left-6 flex items-center space-x-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50 group"
          aria-label="Attach image file"
        >
          <Paperclip size={16} className="group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Attach picture of the people (optional)</span>
          {selectedFile && (
            <span className="text-emerald-600 font-semibold">- {selectedFile.name}</span>
          )}
        </button>
        
        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 45 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className="absolute bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 shadow-lg"
          aria-label="Generate poster"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowUp size={20} />
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PromptBar;
