
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, Lightbulb, Target, Award, Heart, ArrowRight, Palette, Zap, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { buildCanonical, truncate } from '@/lib/utils';

const About = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Helmet>
        <title>À propos – Neoma Poster</title>
        <meta name="description" content={truncate("Notre mission : des posters personnalisés de qualité professionnelle, créés avec l'IA.", 160)} />
        <link rel="canonical" href={buildCanonical('/about')} />
        <meta property="og:title" content="À propos – Neoma Poster" />
        <meta property="og:description" content="Notre mission : des posters personnalisés de qualité professionnelle, créés avec l'IA." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={buildCanonical('/about')} />
      </Helmet>
      {/* Animated background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-800">
        <div 
          className="absolute inset-0 animate-pulse opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 border border-white/20">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              À propos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">Neoma Poster</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-2">
              L'art de créer des posters uniques, professionnels et personnalisés grâce à l'intelligence artificielle
            </p>
          </div>

          {/* Founders Story */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl mb-8 sm:mb-12 lg:mb-16 animate-slide-up">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white flex-shrink-0" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Notre Histoire</h2>
              </div>
              <div className="space-y-4 sm:space-y-6 text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed">
                <p>
                  Nous sommes deux étudiants en fin d'études d'ingénieur et, en parallèle de notre parcours, nous avons développé ce projet avec une idée simple : proposer des posters de bien meilleure qualité que ceux que l'on trouve dans le commerce.
                </p>
                <p>
                  Pour cela, nous avons conçu un modèle d'IA spécialisé, capable de générer des visuels professionnels, élégants et uniques. Mais ici, <strong className="text-white">l'artiste reste vous</strong> : c'est vous qui décidez exactement ce que vous voulez voir apparaître sur votre poster.
                </p>
                <p>
                  Notre rôle est de vous accompagner pour créer l'affiche qui vous ressemble, de manière accessible à tous. Nous tenons à être totalement transparents sur l'usage de l'IA, car notre ambition est de démocratiser et rendre accessible la personnalisation et de permettre à chacun d'avoir chez soi une œuvre vraiment unique, à la fois design et personnelle.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl animate-slide-up-delayed-1">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                  <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">Innovation</h3>
                <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                  Notre IA spécialisée transforme vos idées en visuels professionnels, repoussant les limites de la création personnalisée.
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl animate-slide-up-delayed-2">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">Qualité</h3>
                <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                  Chaque poster respecte des standards professionnels élevés, bien au-dessus de ce qu'on trouve dans le commerce.
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl animate-slide-up-delayed-3 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">Accessibilité</h3>
                <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                  Créer une œuvre unique ne devrait pas être réservé aux experts. Nous rendons l'art accessible à tous.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl mb-8 sm:mb-12 lg:mb-16 animate-slide-up">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white flex-shrink-0" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Pourquoi Poster Palooza ?</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Design Professionnel</h4>
                      <p className="text-white/80 text-sm sm:text-base">Nos algorithmes créent des compositions équilibrées, des palettes harmonieuses et des typographies élégantes.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Rapidité</h4>
                      <p className="text-white/80 text-sm sm:text-base">En quelques secondes, transformez vos idées en posters prêts à imprimer ou à partager.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Transparence</h4>
                      <p className="text-white/80 text-sm sm:text-base">Nous sommes clairs sur l'utilisation de l'IA et sur notre processus de création.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Créé par des Étudiants</h4>
                      <p className="text-white/80 text-sm sm:text-base">Un projet étudiant passionné, développé avec soin pour révolutionner la création de posters.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl animate-slide-up">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12 text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">Prêt à créer votre premier poster ?</h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Rejoignez des milliers de créateurs qui ont déjà découvert la magie de nos posters IA personnalisés.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/subscribe" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 group text-sm sm:text-base">
                    Commencer maintenant
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 sm:mt-12 text-white/60 text-xs sm:text-sm px-4">
            <p>© 2025 Neoma Poster. Créé avec passion par deux étudiants ingénieurs.</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 1s ease-out;
          }
          
          .animate-slide-up {
            animation: slide-up 0.8s ease-out 0.2s both;
          }
          
          .animate-slide-up-delayed-1 {
            animation: slide-up 0.8s ease-out 0.4s both;
          }
          
          .animate-slide-up-delayed-2 {
            animation: slide-up 0.8s ease-out 0.6s both;
          }
          
          .animate-slide-up-delayed-3 {
            animation: slide-up 0.8s ease-out 0.8s both;
          }
        `
      }} />
    </div>
  );
};

export default About;
