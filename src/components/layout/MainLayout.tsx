import { useState } from 'react';
import { FileText, HelpCircle } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';
import MobileTabNav from './MobileTabNav';

interface MainLayoutProps {
  inputSection: React.ReactNode;
  previewSection: React.ReactNode;
  onOpenDrafts: () => void;
  onOpenHelp?: () => void;
}

export default function MainLayout({ 
  inputSection, 
  previewSection, 
  onOpenDrafts,
  onOpenHelp 
}: MainLayoutProps) {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-3">
          <img 
            src="/icon-192.png" 
            alt="Social Text Formatter Logo" 
            className="w-10 h-10 rounded-lg shadow-md"
          />
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-gray-900">
              TextCraft
            </h1>
          </div>
          <h1 className="sm:hidden text-lg font-semibold text-gray-900">
            TextCraft
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          <button 
            onClick={onOpenDrafts}
            className="flex items-center gap-2 px-3 lg:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Open drafts"
          >
            <FileText className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Drafts</span>
          </button>
          <button 
            onClick={onOpenHelp}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      {isMobile && (
        <MobileTabNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* Main Content */}
      {isMobile ? (
        // Mobile: Single column with tabs
        <main className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'write' ? inputSection : previewSection}
        </main>
      ) : (
        // Desktop/Tablet: Split screen
        <main className="flex-1 flex overflow-hidden">
          {/* LEFT SIDE - Input Area */}
          <div className="w-2/5 bg-white border-r border-gray-200 overflow-y-auto">
            {inputSection}
          </div>
          
          {/* RIGHT SIDE - Preview Area */}
          <div className="w-3/5 bg-gray-50 overflow-y-auto">
            {previewSection}
          </div>
        </main>
      )}
    </div>
  );
}
