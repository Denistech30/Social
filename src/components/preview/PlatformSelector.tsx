import { useState } from 'react';
import { ChevronDown, Twitter, Instagram, Linkedin, Facebook, Music, MessageCircle } from 'lucide-react';
import { platforms } from '../../lib/platforms';

const platformIcons: Record<string, typeof Twitter> = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  tiktok: Music,
  threads: MessageCircle,
};

interface PlatformSelectorProps {
  selectedPlatform: string;
  onPlatformChange: (platformId: string) => void;
}

export default function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = platforms.find(p => p.id === selectedPlatform) || platforms[0];
  const SelectedIcon = platformIcons[selected.id] || Twitter;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Preview Platform
      </label>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 px-4 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 flex items-center justify-between transition-all duration-200"
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected.color}`}>
              <SelectedIcon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {selected.name}
              </div>
              <div className="text-xs text-gray-500">
                {selected.charLimit.toLocaleString()} character limit
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
              <div className="p-1">
                {platforms.map((platform) => {
                  const Icon = platformIcons[platform.id] || Twitter;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => {
                        onPlatformChange(platform.id);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                        platform.id === selectedPlatform ? 'bg-green-50' : ''
                      }`}
                      type="button"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${platform.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{platform.name}</div>
                        <div className="text-xs text-gray-500">
                          {platform.charLimit.toLocaleString()} chars max
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
