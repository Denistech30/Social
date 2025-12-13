import { Sparkles, Check, Zap, Shield } from 'lucide-react';

export default function HeroSection() {
  const scrollToTool = () => {
    document.getElementById('main-tool')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <section className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>100% Free • No Signup Required • Works Offline</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Format Text for<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-lime-200 to-green-200">
            Social Media
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
          Transform boring posts into eye-catching content with beautiful Unicode formatting. 
          Works on Twitter, LinkedIn, Instagram & everywhere else.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10">
          <FeaturePill icon={<Zap className="w-4 h-4" />} text="Instant Formatting" />
          <FeaturePill icon={<Shield className="w-4 h-4" />} text="Accessibility Scoring" />
          <FeaturePill icon={<Check className="w-4 h-4" />} text="8 Platforms Supported" />
        </div>

        {/* CTA Button */}
        <div className="space-y-4">
          <button
            onClick={scrollToTool}
            className="group relative inline-flex items-center gap-2 px-8 py-4 md:px-8 md:py-4 bg-white text-green-600 rounded-xl text-lg md:text-lg font-bold hover:bg-gray-50 transition-all duration-200 hover:scale-105 hover:shadow-2xl w-full max-w-sm md:w-auto"
          >
            <span>Start Formatting Now</span>
            <svg 
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          {/* Mobile-specific quick access hint */}
          <div className="md:hidden">
            <p className="text-sm text-white/80 font-medium animate-pulse">
              👆 Tap to jump to the editor
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-sm text-white/70">
          <p>Join 1,000+ content creators using TextCraft daily</p>
        </div>
      </div>
    </section>
  );
}

// Feature Pill Component
function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors">
      {icon}
      <span>{text}</span>
    </div>
  );
}
