import PlatformSelector from './PlatformSelector';
import PreviewCard from './PreviewCard';
import CharacterCounter from './CharacterCounter';
import AccessibilityIndicator from './AccessibilityIndicator';
import FontCompatibilityChecker from './FontCompatibilityChecker';
import LinkedInAlgorithmWarning from './LinkedInAlgorithmWarning';
import TestBeforePost from './TestBeforePost';
import ActionButtons from './ActionButtons';
import type { Platform } from '../../types';

interface PreviewSectionProps {
  formattedText: string;
  selectedPlatform: Platform;
  onPlatformChange: (platformId: string) => void;
  onOptimizeForLinkedIn: (text: string) => void;
  onGeneratePlain: () => void;
  onSave: () => void;
  onClear: () => void;
}

export default function PreviewSection({
  formattedText,
  selectedPlatform,
  onPlatformChange,
  onOptimizeForLinkedIn,
  onGeneratePlain,
  onSave,
  onClear,
}: PreviewSectionProps) {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Platform Selector */}
      <PlatformSelector
        selectedPlatform={selectedPlatform.id}
        onPlatformChange={onPlatformChange}
      />

      {/* Live Preview Card */}
      <PreviewCard 
        text={formattedText}
        platformName={selectedPlatform.name}
      />

      {/* Character Counter with Platform Limits */}
      <CharacterCounter 
        text={formattedText}
        platformLimit={selectedPlatform.charLimit}
        platformName={selectedPlatform.name}
      />

      {/* Accessibility Indicator */}
      <AccessibilityIndicator 
        text={formattedText}
        onGeneratePlain={onGeneratePlain}
      />

      {/* LinkedIn Algorithm Warning (if LinkedIn selected) */}
      {selectedPlatform.id === 'linkedin' && (
        <LinkedInAlgorithmWarning 
          text={formattedText}
          onOptimize={onOptimizeForLinkedIn}
        />
      )}

      {/* Font Compatibility Checker */}
      <FontCompatibilityChecker 
        text={formattedText}
      />

      {/* Test Before Post Feature */}
      <TestBeforePost 
        text={formattedText}
        platformId={selectedPlatform.id}
        platformName={selectedPlatform.name}
      />

      {/* Action Buttons */}
      <ActionButtons 
        text={formattedText}
        onSave={onSave}
        onClear={onClear}
      />
    </div>
  );
}
