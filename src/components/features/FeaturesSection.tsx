import { Zap, Shield, Smartphone, Sparkles, Globe, Lock } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}

export default function FeaturesSection() {
  const features: Feature[] = [
    {
      icon: <Zap className="w-6 h-6" />,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      title: 'Instant Formatting',
      description: 'Real-time preview as you type. See exactly how your post will look before publishing.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      title: 'Accessibility First',
      description: 'Real-time accessibility scoring ensures your content is inclusive for all users, including screen readers.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Works Everywhere',
      description: 'Compatible with Twitter, LinkedIn, Instagram, TikTok, Facebook, YouTube, Discord & more.',
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'Mobile Optimized',
      description: 'Fully responsive design. Format your posts on-the-go from any device with ease.',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-100',
      title: 'Multiple Copy Formats',
      description: 'Copy as Unicode, Plain Text, HTML, or Markdown. Choose the format that works best for your needs.',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-100',
      title: 'Privacy Focused',
      description: 'No signup required. No tracking. No data collection. Your text stays on your device.',
    },
  ];

  const scrollToTool = () => {
    document.getElementById('main-tool')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <section className="py-16 md:py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose TextCraft?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The most powerful and user-friendly text formatter built specifically for social media creators.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* CTA at bottom */}
        <div className="mt-16 text-center">
          <button
            onClick={scrollToTool}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <span>Try It Now - It's Free!</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
      {/* Icon */}
      <div className={`inline-flex p-3 rounded-xl ${feature.iconBg} ${feature.iconColor} mb-4 group-hover:scale-110 transition-transform duration-200`}>
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}
