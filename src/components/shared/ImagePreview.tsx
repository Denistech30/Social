import { Edit3, Download, X } from 'lucide-react';
import type { EditedImage } from '../../types';

interface ImagePreviewProps {
  image: EditedImage;
  onEdit: () => void;
  onRemove: () => void;
}

export default function ImagePreview({ image, onEdit, onRemove }: ImagePreviewProps) {
  const handleDownload = () => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
    const filename = `textcraft-post-${timestamp}.jpg`;

    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Edited Image Attached</h3>
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="relative group">
        <img
          src={image.dataUrl}
          alt="Edited image preview"
          className="w-full h-32 object-cover rounded-lg border border-gray-200"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Re-edit
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Edit Image
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}