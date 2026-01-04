import { useState, useRef } from 'react';
import { Copy, Save, X, Check, Loader2, Info, QrCode, Download } from 'lucide-react';
import { smartCopy } from '../../lib/copy-system';
import type { CopyFormat, EditedImage } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';
import QrCodeModal from '../shared/QrCodeModal';
import QRTooltip from '../shared/QRTooltip';
import ImageUploadButton from '../shared/ImageUploadButton';
import ImagePreview from '../shared/ImagePreview';
import ImageEditorModal from '../shared/ImageEditorModal';
import { 
  hasSeenQRFeature, 
  markQRFeatureAsSeen, 
  shouldShowCopyNudge, 
  incrementCopyNudgeCount,
  trackQREvent 
} from '../../utils/featureFlags';

interface ActionButtonsProps {
  text: string;
  onSave: () => void;
  onClear: () => void;
  isUserTyping?: boolean;
}

export default function ActionButtons({ text, onSave, onClear, isUserTyping = false }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [copyMethod, setCopyMethod] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCopyNudge, setShowCopyNudge] = useState(false);
  const [editedImage, setEditedImage] = useState<EditedImage | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [initialImageForEditor, setInitialImageForEditor] = useState<string | null>(null);
  const { isMobile } = useResponsive();
  const qrButtonRef = useRef<HTMLButtonElement>(null);

  const handleCopy = async (format: CopyFormat = 'unicode') => {
    if (!text) return;

    const result = await smartCopy(text, format);

    if (result.success) {
      setCopied(true);
      setCopyMethod(result.method);
      
      // Show copy nudge if conditions are met
      if (format === 'unicode' && shouldShowCopyNudge()) {
        incrementCopyNudgeCount();
        setShowCopyNudge(true);
      }
      
      setTimeout(() => {
        setCopied(false);
        setShowFormats(false);
        setShowCopyNudge(false);
      }, 4000); // Extended to show nudge
    } else {
      // Show manual copy fallback
      setShowFormats(true);
    }
  };

  const handleSave = async () => {
    if (!text) return;
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const handleQRClick = () => {
    markQRFeatureAsSeen();
    trackQREvent('qr_opened');
    setShowQrModal(true);
  };

  const handleTooltipTryIt = () => {
    handleQRClick();
  };

  // Image editor handlers
  const handleImageSelect = (imageDataUrl: string) => {
    setInitialImageForEditor(imageDataUrl);
    setShowImageEditor(true);
  };

  const handleImageSave = (image: EditedImage) => {
    setEditedImage(image);
    setShowImageEditor(false);
  };

  const handleImageEdit = () => {
    if (editedImage) {
      setInitialImageForEditor(editedImage.dataUrl);
      setShowImageEditor(true);
    }
  };

  const handleImageRemove = () => {
    setEditedImage(null);
  };

  const handleDownloadImage = () => {
    if (!editedImage) return;

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
    const filename = `textcraft-post-${timestamp}.jpg`;

    const link = document.createElement('a');
    link.href = editedImage.dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Image Editor Section */}
      <div className="space-y-3">
        {editedImage ? (
          <ImagePreview
            image={editedImage}
            onEdit={handleImageEdit}
            onRemove={handleImageRemove}
          />
        ) : (
          <ImageUploadButton
            onImageSelect={handleImageSelect}
            hasImage={!!editedImage}
          />
        )}
      </div>

      {/* Primary Copy Button - Enhanced with shimmer effect */}
      <button
        onClick={() => handleCopy('unicode')}
        disabled={!text}
        className={`group relative w-full h-14 px-8 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden ${
          copied 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/50' 
            : 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 hover:scale-105 active:scale-95'
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none`}
        style={{ backgroundSize: '200% auto' }}
        type="button"
      >
        {/* Shimmer effect overlay */}
        {!copied && text && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        )}
        
        {copied ? (
          <>
            <Check className="w-6 h-6 animate-bounce" />
            <span>Copied Successfully!</span>
          </>
        ) : (
          <>
            <Copy className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
            <span>Copy Formatted Text</span>
          </>
        )}
      </button>

      {/* Alternative Format Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleCopy('plain')}
          disabled={!text}
          className="flex-1 h-10 px-4 text-sm font-medium bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Copy Plain
        </button>
        <button
          onClick={() => handleCopy('html')}
          disabled={!text}
          className="flex-1 h-10 px-4 text-sm font-medium bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Copy HTML
        </button>
        <button
          onClick={() => handleCopy('markdown')}
          disabled={!text}
          className="flex-1 h-10 px-4 text-sm font-medium bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Copy MD
        </button>
      </div>

      {/* QR for Link Button */}
      <button
        ref={qrButtonRef}
        onClick={handleQRClick}
        className="w-full h-10 px-4 text-sm font-medium bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 relative"
        type="button"
      >
        <QrCode className="w-4 h-4" />
        <span>QR for Link</span>
        {!hasSeenQRFeature() && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold text-white bg-green-500 rounded-full animate-pulse">
            NEW
          </span>
        )}
      </button>

      {/* Mobile/Fallback Manual Copy */}
      {(showFormats || (isMobile && copied && copyMethod === 'failed')) && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-3">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-2">
                {isMobile 
                  ? "Tap and hold the text below to copy manually:"
                  : "Select and copy the text below:"}
              </p>
              <div className="p-3 bg-white border border-blue-300 rounded-lg text-sm font-mono select-all break-all max-h-32 overflow-y-auto">
                {text}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success feedback with method used */}
      {copied && copyMethod !== 'failed' && (
        <div className="p-3 bg-green-50 rounded-lg text-green-800 space-y-1">
          <div className="text-xs text-center">
            ✓ Copied using {copyMethod} method
          </div>
          {showCopyNudge && (
            <div className="text-xs text-center text-green-700 border-t border-green-200 pt-2">
              Need to share a website link? Use 'QR for Link' to generate a scannable code.
            </div>
          )}
        </div>
      )}

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!text || saving}
          className="flex-1 h-12 px-6 rounded-xl font-medium flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span className="hidden sm:inline">Save Draft</span>
            </>
          )}
        </button>

        {editedImage && (
          <button
            onClick={handleDownloadImage}
            className="h-12 px-4 rounded-xl flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 active:scale-95"
            type="button"
            title="Download edited image"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Image</span>
          </button>
        )}

        <button
          onClick={onClear}
          disabled={!text}
          className="h-12 px-4 rounded-xl flex items-center justify-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          type="button"
        >
          <X className="w-5 h-5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* QR Tooltip */}
      <QRTooltip 
        targetRef={qrButtonRef as React.RefObject<HTMLElement>}
        isUserTyping={isUserTyping}
        onTryIt={handleTooltipTryIt}
      />

      {/* QR Code Modal */}
      <QrCodeModal open={showQrModal} onOpenChange={setShowQrModal} />

      {/* Image Editor Modal */}
      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        initialImage={initialImageForEditor}
        onSave={handleImageSave}
      />
    </div>
  );
}
