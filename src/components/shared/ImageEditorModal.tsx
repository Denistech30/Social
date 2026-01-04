import { useState, useRef, useEffect, useCallback } from 'react';
import { X, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Type, Undo, Redo, Save } from 'lucide-react';
import type { EditedImage } from '../../types';

// Import Fabric.js for Vite - using dynamic import to ensure proper loading
let fabric: any = null;

// Dynamically import fabric
const loadFabric = async () => {
  if (!fabric) {
    const fabricModule = await import('fabric');
    fabric = fabricModule.fabric || fabricModule.default || fabricModule;
  }
  return fabric;
};

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string | null;
  onSave: (editedImage: EditedImage) => void;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: any[];
}

// Create filter presets function to ensure fabric is loaded
const createFilterPresets = (): FilterPreset[] => [
  { id: 'original', name: 'Original', filters: [] },
  { 
    id: 'bright', 
    name: 'Bright', 
    filters: fabric?.Image?.filters ? [new fabric.Image.filters.Brightness({ brightness: 0.2 })] : []
  },
  { 
    id: 'warm', 
    name: 'Warm', 
    filters: fabric?.Image?.filters ? [new fabric.Image.filters.ColorMatrix({ 
      matrix: [1.2, 0, 0, 0, 0, 0, 1.1, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 1, 0] 
    })] : []
  },
  { 
    id: 'cool', 
    name: 'Cool', 
    filters: fabric?.Image?.filters ? [new fabric.Image.filters.ColorMatrix({ 
      matrix: [0.8, 0, 0, 0, 0, 0, 1.1, 0, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 0, 1, 0] 
    })] : []
  },
  { 
    id: 'bw', 
    name: 'B&W', 
    filters: fabric?.Image?.filters ? [new fabric.Image.filters.Grayscale()] : []
  },
];

export default function ImageEditorModal({ isOpen, onClose, initialImage, onSave }: ImageEditorModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const imageObjectRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  
  // Adjustment states
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  // Load Fabric.js when component mounts
  useEffect(() => {
    loadFabric().then(() => {
      setFabricLoaded(true);
      setFilterPresets(createFilterPresets());
    });
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !fabricLoaded || !fabric) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f8f9fa',
    });

    fabricCanvasRef.current = canvas;

    // Load initial image if provided
    if (initialImage) {
      loadImage(initialImage);
    }

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [isOpen, initialImage, fabricLoaded]);

  // Save state to history
  const saveToHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const state = JSON.stringify(fabricCanvasRef.current.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Load image onto canvas
  const loadImage = useCallback((imageSrc: string) => {
    if (!fabricCanvasRef.current || !fabric) return;

    setIsLoading(true);
    fabric.Image.fromURL(imageSrc, (img: any) => {
      if (!fabricCanvasRef.current) return;

      // Scale image to fit canvas while maintaining aspect ratio
      const canvas = fabricCanvasRef.current;
      const maxWidth = canvas.width! * 0.9;
      const maxHeight = canvas.height! * 0.9;
      
      const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
      img.scale(scale);
      
      // Center the image
      img.set({
        left: (canvas.width! - img.getScaledWidth()) / 2,
        top: (canvas.height! - img.getScaledHeight()) / 2,
      });

      canvas.clear();
      canvas.add(img);
      canvas.setActiveObject(img);
      imageObjectRef.current = img;
      
      saveToHistory();
      setIsLoading(false);
    }, { crossOrigin: 'anonymous' });
  }, [saveToHistory]);

  // Apply adjustments
  const applyAdjustments = useCallback(() => {
    if (!imageObjectRef.current || !fabric?.Image?.filters) return;

    const filters = [];
    
    if (brightness !== 0) {
      filters.push(new fabric.Image.filters.Brightness({ brightness: brightness / 100 }));
    }
    
    if (contrast !== 0) {
      filters.push(new fabric.Image.filters.Contrast({ contrast: contrast / 100 }));
    }
    
    if (saturation !== 0) {
      filters.push(new fabric.Image.filters.Saturation({ saturation: saturation / 100 }));
    }

    imageObjectRef.current.filters = filters;
    imageObjectRef.current.applyFilters();
    fabricCanvasRef.current?.renderAll();
  }, [brightness, contrast, saturation]);

  // Apply adjustments when values change
  useEffect(() => {
    applyAdjustments();
  }, [brightness, contrast, saturation, applyAdjustments]);

  // Transform functions
  const rotateLeft = () => {
    if (!imageObjectRef.current) return;
    imageObjectRef.current.rotate(imageObjectRef.current.angle! - 90);
    fabricCanvasRef.current?.renderAll();
    saveToHistory();
  };

  const rotateRight = () => {
    if (!imageObjectRef.current) return;
    imageObjectRef.current.rotate(imageObjectRef.current.angle! + 90);
    fabricCanvasRef.current?.renderAll();
    saveToHistory();
  };

  const flipHorizontal = () => {
    if (!imageObjectRef.current) return;
    imageObjectRef.current.set('flipX', !imageObjectRef.current.flipX);
    fabricCanvasRef.current?.renderAll();
    saveToHistory();
  };

  const flipVertical = () => {
    if (!imageObjectRef.current) return;
    imageObjectRef.current.set('flipY', !imageObjectRef.current.flipY);
    fabricCanvasRef.current?.renderAll();
    saveToHistory();
  };

  // Apply filter preset
  const applyFilter = (preset: FilterPreset) => {
    if (!imageObjectRef.current) return;
    
    imageObjectRef.current.filters = [...preset.filters];
    imageObjectRef.current.applyFilters();
    fabricCanvasRef.current?.renderAll();
    saveToHistory();
  };

  // Add text
  const addText = () => {
    if (!fabricCanvasRef.current || !fabric) return;

    const text = new fabric.IText('Add your text', {
      left: fabricCanvasRef.current.width! / 2,
      top: fabricCanvasRef.current.height! / 2,
      fontFamily: 'Arial',
      fontSize: 40,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    saveToHistory();
  };

  // Crop functionality - placeholder for future implementation
  // const startCrop = () => {
  //   setIsCropping(true);
  //   // Implementation would add crop overlay
  // };

  // const applyCrop = () => {
  //   // Implementation would apply crop
  //   setIsCropping(false);
  //   saveToHistory();
  // };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      fabricCanvasRef.current?.loadFromJSON(state, () => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      fabricCanvasRef.current?.loadFromJSON(state, () => {
        fabricCanvasRef.current?.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  // Save edited image
  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;

    setIsLoading(true);
    
    try {
      // Export canvas to blob
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: 'jpeg',
        quality: 0.8,
        multiplier: 1,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      onSave({ blob, dataUrl });
      onClose();
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!fabricLoaded) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading image editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Edit Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-100">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 rounded-lg shadow-lg bg-white"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="w-80 border-l bg-white p-4 overflow-y-auto">
            {/* Transform Tools */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Transform</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={rotateLeft}
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">Rotate L</span>
                </button>
                <button
                  onClick={rotateRight}
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-sm">Rotate R</span>
                </button>
                <button
                  onClick={flipHorizontal}
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="text-sm">Flip H</span>
                </button>
                <button
                  onClick={flipVertical}
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50"
                >
                  <FlipVertical className="w-4 h-4" />
                  <span className="text-sm">Flip V</span>
                </button>
              </div>
            </div>

            {/* Adjustments */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Adjustments</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Brightness</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{brightness}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contrast</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{contrast}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Saturation</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{saturation}</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Filters</h3>
              <div className="grid grid-cols-2 gap-2">
                {filterPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyFilter(preset)}
                    className="p-2 text-sm border rounded-lg hover:bg-gray-50"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Text */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Text</h3>
              <button
                onClick={addText}
                className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 w-full"
              >
                <Type className="w-4 h-4" />
                <span className="text-sm">Add Text</span>
              </button>
            </div>

            {/* History */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">History</h3>
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <Undo className="w-4 h-4" />
                  <span className="text-sm">Undo</span>
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <Redo className="w-4 h-4" />
                  <span className="text-sm">Redo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}