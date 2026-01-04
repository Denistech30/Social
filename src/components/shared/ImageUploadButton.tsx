import { useRef } from 'react';
import { ImagePlus, Upload } from 'lucide-react';

interface ImageUploadButtonProps {
  onImageSelect: (imageDataUrl: string) => void;
  hasImage: boolean;
}

export default function ImageUploadButton({ onImageSelect, hasImage }: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelect(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-all duration-200"
      >
        {hasImage ? (
          <>
            <ImagePlus className="w-4 h-4" />
            Edit Image
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Add Image
          </>
        )}
      </button>
    </>
  );
}