import { Undo2, Redo2, Eraser, Eye, Save, Plus } from 'lucide-react';

interface QuickActionsProps {
  onUndo: () => void;
  onRedo: () => void;
  onStripFormatting: () => void;
  onMakeAccessible?: () => void;
  onSaveDraft?: () => void;
  onSaveNewDraft?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges?: boolean;
}

export default function QuickActions({
  onUndo,
  onRedo,
  onStripFormatting,
  onMakeAccessible,
  onSaveDraft,
  onSaveNewDraft,
  canUndo,
  canRedo,
  hasUnsavedChanges = false,
}: QuickActionsProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Undo/Redo Group */}
      <div className="flex gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-lg transition-colors ${
            canUndo 
              ? 'hover:bg-gray-200 text-gray-700' 
              : 'opacity-30 cursor-not-allowed text-gray-400'
          }`}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          type="button"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded-lg transition-colors ${
            canRedo 
              ? 'hover:bg-gray-200 text-gray-700' 
              : 'opacity-30 cursor-not-allowed text-gray-400'
          }`}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
          type="button"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300" />

      {/* Save Draft Buttons */}
      {onSaveDraft && (
        <>
          <button
            onClick={onSaveDraft}
            disabled={!hasUnsavedChanges}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              hasUnsavedChanges
                ? 'text-blue-700 hover:bg-blue-50 border border-blue-200'
                : 'text-gray-400 cursor-not-allowed opacity-50'
            }`}
            title={hasUnsavedChanges ? "Save current text as draft" : "No changes to save"}
            type="button"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>
          
          {onSaveNewDraft && (
            <button
              onClick={onSaveNewDraft}
              disabled={!hasUnsavedChanges}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                hasUnsavedChanges
                  ? 'text-green-700 hover:bg-green-50 border border-green-200'
                  : 'text-gray-400 cursor-not-allowed opacity-50'
              }`}
              title={hasUnsavedChanges ? "Save as new draft (creates separate draft)" : "No changes to save"}
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Draft</span>
            </button>
          )}
        </>
      )}

      {onSaveDraft && <div className="w-px h-6 bg-gray-300" />}

      {/* Strip Formatting Button */}
      <button
        onClick={onStripFormatting}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        title="Remove all formatting"
        type="button"
      >
        <Eraser className="w-4 h-4" />
        <span className="hidden sm:inline">Remove Formatting</span>
      </button>

      {onMakeAccessible && (
        <>
          <div className="w-px h-6 bg-gray-300" />

          {/* Make Accessible Button */}
          <button
            onClick={onMakeAccessible}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            title="Convert to accessible version"
            type="button"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Make Accessible</span>
          </button>
        </>
      )}
    </div>
  );
}
