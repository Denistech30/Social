import { Github, Twitter, Download, Heart, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function Footer() {
  const { isInstallable, install } = usePWAInstall();
  const currentYear = new Date().getFullYear();

  const handleInstall = async () => {
    await install();
  };

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t-2 border-gray-200 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center space-y-8">
          
          {/* Brand & Description */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              TextCraft
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Transform your social media posts with beautiful Unicode formatting. 
              Free, fast, and works everywhere.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center items-center gap-6">
            
            {/* GitHub */}
            <a
              href="https://github.com/Denistech30/Social"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Twitter */}
            <a
              href="https://twitter.com/Denistech30"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors group"
            >
              <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Twitter</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Install App - Only show if installable */}
            {isInstallable && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
              >
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Install App</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            
            {/* Copyright */}
            <div className="text-gray-600">
              © {currentYear} TextCraft. All rights reserved.
            </div>

            {/* Made with Love */}
            <div className="flex items-center gap-2 text-gray-600">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" />
              <span>by</span>
              <a
                href="https://github.com/Denistech30"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-green-600 hover:text-green-700 hover:underline"
              >
                Denis
              </a>
            </div>

            {/* Version */}
            <div className="text-gray-400 text-xs">
              v1.0.0
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <a href="/privacy.html" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms.html" className="hover:text-gray-700 transition-colors">
              Terms of Use
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
