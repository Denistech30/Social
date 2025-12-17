import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { hasSeenQRTooltip, markQRTooltipAsSeen, markQRFeatureAsSeen, trackQREvent } from '../../utils/featureFlags';

interface QRTooltipProps {
  targetRef: React.RefObject<HTMLElement>;
  isUserTyping: boolean;
  onTryIt: () => void;
}

export default function QRTooltip({ targetRef, isUserTyping, onTryIt }: QRTooltipProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check if tooltip should be shown
  useEffect(() => {
    if (hasSeenQRTooltip() || isUserTyping) {
      setShow(false);
      return;
    }

    // Show tooltip after a short delay to avoid immediate distraction
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isUserTyping]);

  // Update position when shown
  useEffect(() => {
    if (!show || !targetRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const target = targetRef.current;
      const tooltip = tooltipRef.current;
      if (!target || !tooltip) return;

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Position above the target by default
      let top = targetRect.top - tooltipRect.height - 12;
      let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

      // Adjust if tooltip goes off screen
      if (left < 8) left = 8;
      if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }

      // If no space above, position below
      if (top < 8) {
        top = targetRect.bottom + 12;
      }

      // If still no space, position to the side
      if (top + tooltipRect.height > viewportHeight - 8) {
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + 12;
        
        // If no space on right, try left
        if (left + tooltipRect.width > viewportWidth - 8) {
          left = targetRect.left - tooltipRect.width - 12;
        }
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [show, targetRef]);

  // Handle escape key
  useEffect(() => {
    if (!show) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show]);

  const handleTryIt = () => {
    markQRTooltipAsSeen();
    markQRFeatureAsSeen();
    trackQREvent('qr_tooltip_try_it');
    setShow(false);
    onTryIt();
  };

  const handleDismiss = () => {
    markQRTooltipAsSeen();
    trackQREvent('qr_tooltip_dismissed');
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={handleDismiss} />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 w-80 max-w-[calc(100vw-16px)] bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          top: position.top,
          left: position.left,
        }}
        role="dialog"
        aria-labelledby="qr-tooltip-title"
        aria-describedby="qr-tooltip-description"
      >
        {/* Arrow pointing to target */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-200 rotate-45" />
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close tooltip"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="pr-6">
          <h3 id="qr-tooltip-title" className="font-semibold text-gray-900 mb-2">
            Share links on Facebook
          </h3>
          <p id="qr-tooltip-description" className="text-sm text-gray-600 mb-4">
            If your link isn't clickable in comments, generate a QR for your website link here.
          </p>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleTryIt}
              className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Try it
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
}