import { useState, useEffect } from 'react';
import { X, Download, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function InstallBanner() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const isDismissed = localStorage.getItem('installBannerDismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    // Check engagement level
    const copyCount = parseInt(localStorage.getItem('copyCount') || '0');

    // Show banner after user has copied 3 times
    if (copyCount >= 3 && isInstallable && !isInstalled && !dismissed) {
      // Delay showing banner by 2 seconds after 3rd copy
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-6 relative">
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              Love TextCraft? 💚
            </h3>
            <p className="text-sm text-white/90 mb-4">
              Install the app for offline access, faster performance, and a native app experience!
            </p>

            {/* Install button */}
            <button
              onClick={handleInstall}
              className="w-full bg-white text-green-600 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Install App</span>
            </button>

            {/* Dismiss link */}
            <button
              onClick={handleDismiss}
              className="w-full mt-3 text-sm text-white/70 hover:text-white transition-colors"
            >
              No thanks, maybe later
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
