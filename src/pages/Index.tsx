
import HeroSection from '@/components/HeroSection';
import TemplatePicker from '@/components/TemplatePicker';
import PromptInput from '@/components/PromptInput';
import ResultsGallery from '@/components/ResultsGallery';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <TemplatePicker />
        <PromptInput />
        <ResultsGallery />
      </div>
    </div>
  );
};

export default Index;
