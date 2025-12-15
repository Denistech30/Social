import { Shield, Zap, Globe, UserCheck } from 'lucide-react';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export default function StatsBar() {
  const benefits: Benefit[] = [
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: 'No Signup',
      description: 'Start formatting instantly',
      color: 'text-green-600',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Works Offline',
      description: 'No internet required',
      color: 'text-emerald-600',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: '6 Platforms',
      description: 'Twitter, LinkedIn, Instagram & more',
      color: 'text-teal-600',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Privacy-First',
      description: 'All data stays local',
      color: 'text-green-500',
    },
  ];

  return (
    <section className="bg-gradient-to-r from-gray-50 to-gray-100 border-y border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className={`${benefit.color} mb-3 group-hover:scale-110 transition-transform duration-200`}>
        {benefit.icon}
      </div>
      <div className="text-lg md:text-xl font-bold text-gray-900 mb-1">
        {benefit.title}
      </div>
      <div className="text-sm text-gray-600">
        {benefit.description}
      </div>
    </div>
  );
}
