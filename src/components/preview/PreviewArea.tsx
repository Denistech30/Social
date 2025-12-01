import PlatformSelector from './PlatformSelector';
import CharacterCounter from './CharacterCounter';
import AccessibilityIndicator from './AccessibilityIndicator';

interface PreviewAreaProps {
  formattedText: string;
  selectedPlatform: string;
  platformLimit: number;
  onPlatformChange: (platform: string) => void;
  onGeneratePlain?: () => void;
}

export default function PreviewArea({
  formattedText,
  selectedPlatform,
  platformLimit,
  onPlatformChange,
  onGeneratePlain,
}: PreviewAreaProps) {
  return (
    <div className="space-y-4">
      <PlatformSelector
        selectedPlatform={selectedPlatform}
        onPlatformChange={onPlatformChange}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Social Media Ready
        </label>
        <div className="min-h-[300px] max-h-[600px] p-5 bg-gray-50 border border-gray-300 rounded-xl overflow-y-auto whitespace-pre-wrap break-words text-base leading-relaxed text-gray-900">
          {formattedText || (
            <span className="text-gray-400 italic">Your formatted text will appear here...</span>
          )}
        </div>
      </div>

      <CharacterCounter
        text={formattedText}
        platformLimit={platformLimit}
        platformName={selectedPlatform}
      />

      <AccessibilityIndicator
        text={formattedText}
        onGeneratePlain={onGeneratePlain}
      />
    </div>
  );
}
