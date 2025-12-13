import { useEffect, useState } from 'react';
import { TrendingUp, Users, Zap, Globe } from 'lucide-react';

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

export default function StatsBar() {
  const [counts, setCounts] = useState({
    texts: 0,
    users: 0,
    platforms: 0,
    uptime: 0,
  });

  // Animate numbers on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      texts: 1000,
      users: 100,
      platforms: 10,
      uptime: 100,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setCounts({
        texts: Math.floor(targets.texts * progress),
        users: Math.floor(targets.users * progress),
        platforms: Math.floor(targets.platforms * progress),
        uptime: Math.floor(targets.uptime * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats: Stat[] = [
    {
      icon: <Zap className="w-6 h-6" />,
      value: `${counts.texts.toLocaleString()}+`,
      label: 'Texts Formatted',
      color: 'text-green-600',
    },
    {
      icon: <Users className="w-6 h-6" />,
      value: `${counts.users.toLocaleString()}+`,
      label: 'Creators',
      color: 'text-emerald-600',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      value: `${counts.platforms}+`,
      label: 'Platforms',
      color: 'text-teal-600',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      value: `${counts.uptime}%`,
      label: 'Free to Use',
      color: 'text-green-500',
    },
  ];

  return (
    <section className="bg-gradient-to-r from-gray-50 to-gray-100 border-y border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
        
        {/* Disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 font-medium">
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className={`${stat.color} mb-2 group-hover:scale-110 transition-transform duration-200`}>
        {stat.icon}
      </div>
      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
        {stat.value}
      </div>
      <div className="text-sm md:text-base text-gray-600 font-medium">
        {stat.label}
      </div>
    </div>
  );
}
