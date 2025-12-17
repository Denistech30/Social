import { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, Check, QrCode as QrCodeIcon } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface QrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QrCodeModal({ open, onOpenChange }: QrCodeModalProps) {
  const [linkInput, setLinkInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Validate URL
  const isValid = (() => {
    const trimmed = linkInput.trim();
    if (!trimmed) return false;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
    
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  })();

  // Update error message
  useEffect(() => {
    const trimmed = linkInput.trim();
    if (!trimmed) {
      setError('');
    } else if (!isValid) {
      setError('Enter a valid URL starting with https://');
    } else {
      setError('');
    }
  }, [linkInput, isValid]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setLinkInput('');
      setError('');
      setCopied(false);
    }
  }, [open]);

  const handleDownload = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;

    try {
      // Get data URL from canvas
      const dataUrl = canvas.toDataURL('image/png');
      
      // Extract domain for filename
      const url = new URL(linkInput.trim());
      const domain = url.hostname.replace(/^www\./, '').split('.')[0];
      const filename = `textcraft-qr-${domain}.png`;

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkInput.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Generate QR for Link</h3>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close QR code generator"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input Section */}
          <div>
            <label htmlFor="qr-link-input" className="block text-sm font-semibold text-gray-700 mb-2">
              Website link
            </label>
            <input
              id="qr-link-input"
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://example.com"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-green-500 focus:ring-green-200'
              }`}
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500">
              Paste a full URL that starts with https://
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {error}
              </p>
            )}
          </div>

          {/* QR Preview */}
          {isValid && (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={linkInput.trim()}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="mt-3 text-xs text-gray-600 text-center max-w-xs break-all">
                {linkInput.trim()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={!isValid}
              className={`flex-1 h-12 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                isValid
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              type="button"
            >
              <Download className="w-5 h-5" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleCopyLink}
              disabled={!isValid}
              className={`h-12 px-4 rounded-xl font-medium flex items-center justify-center gap-2 border-2 transition-all duration-200 ${
                isValid
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              type="button"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="hidden sm:inline text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
