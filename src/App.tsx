import { useState, useEffect, useCallback } from 'react';
import HeroSection from './components/hero/HeroSection';
import StatsBar from './components/hero/StatsBar';
import FeaturesSection from './components/features/FeaturesSection';
import MainLayout from './components/layout/MainLayout';
import InputSection from './components/input/InputSection';
import PreviewSection from './components/preview/PreviewSection';
import MobileFormattingToolbar from './components/mobile/MobileFormattingToolbar';
import EmojiPicker from './components/input/EmojiPicker';
import DraftsSidebar from './components/drafts/DraftsSidebar';
import Toast from './components/shared/Toast';
import Footer from './components/footer/Footer';
import InstallBanner from './components/pwa/InstallBanner';
import { formatText, applyQuickStyle, stripFormatting } from './lib/unicode-transforms';
import { platforms, getPlatformById } from './lib/platforms';
import { useDrafts } from './hooks/useDrafts';
import { useAutoSave } from './hooks/useAutoSave';
import { useHistory } from './hooks/useHistory';
import { useResponsive } from './hooks/useResponsive';
import type { Draft, FormatType, TextSelection, StyleType, Platform } from './types';
import './App.css';

// Demo text to show on initial load
const DEMO_TEXT = `# Welcome to TextCraft! 🎨

Transform your social media posts with **bold**, *italic*, and ~~strikethrough~~ formatting.

## Why TextCraft?
- Works on all platforms (Twitter, LinkedIn, Instagram)
- No signup required
- 100% free forever
- Accessibility-friendly

Try editing this text or click "Clear" to start fresh!

**Pro tip:** Select text and use the toolbar to apply formatting instantly.`;

function App() {
  // Core state - Initialize with demo text
  const [inputText, setInputText] = useState(DEMO_TEXT);
  const [formattedText, setFormattedText] = useState('');
  const [selectedPlatformId, setSelectedPlatformId] = useState(platforms[0].id);
  const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0, text: '' });
  
  // UI state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);

  // Hooks
  const { drafts, addDraft, deleteDraft } = useDrafts();
  const { push: pushHistory, undo, redo, canUndo, canRedo } = useHistory(inputText);
  const { isMobile } = useResponsive();

  // Get selected platform object
  const selectedPlatform: Platform = getPlatformById(selectedPlatformId) || platforms[0];

  // Format text in real-time with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      const formatted = formatText(inputText);
      setFormattedText(formatted);
    }, 100);

    return () => clearTimeout(timer);
  }, [inputText]);

  // Track unsaved changes (but not for demo text)
  useEffect(() => {
    setHasUnsavedChanges(inputText.trim().length > 0 && inputText !== DEMO_TEXT);
  }, [inputText]);

  // Auto-save functionality
  const handleAutoSave = useCallback(() => {
    if (inputText.trim().length > 0 && inputText !== DEMO_TEXT) {
      addDraft(inputText, selectedPlatformId, formattedText);
      showToastMessage('Draft auto-saved', 'success');
    }
  }, [inputText, selectedPlatformId, formattedText, addDraft]);

  useAutoSave({
    onSave: handleAutoSave,
    delay: 30000,
    enabled: hasUnsavedChanges,
    content: inputText,
  });

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            handleFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            handleFormat('underline');
            break;
          case 'z':
            e.preventDefault();
            handleUndo();
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, inputText]);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Handle text input change with history
  const handleInputChange = (text: string) => {
    setInputText(text);
    pushHistory(text);
  };

  // Handle formatting
  const handleFormat = (type: FormatType) => {
    const { start, end, text: selectedText } = selection;

    if (!selectedText) {
      showToastMessage('Please select text to format', 'warning');
      return;
    }

    let formattedSelection = '';
    switch (type) {
      case 'bold':
        formattedSelection = `**${selectedText}**`;
        break;
      case 'italic':
        formattedSelection = `*${selectedText}*`;
        break;
      case 'underline':
        formattedSelection = `__${selectedText}__`;
        break;
      case 'strikethrough':
        formattedSelection = `~~${selectedText}~~`;
        break;
      case 'heading-1':
        formattedSelection = `# ${selectedText}`;
        break;
      case 'heading-2':
        formattedSelection = `## ${selectedText}`;
        break;
      case 'heading-3':
        formattedSelection = `### ${selectedText}`;
        break;
      case 'heading-4':
        formattedSelection = `#### ${selectedText}`;
        break;
      case 'bullet-list':
        formattedSelection = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
      case 'numbered-list':
        formattedSelection = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        break;
      default:
        formattedSelection = selectedText;
    }

    const newText = inputText.substring(0, start) + formattedSelection + inputText.substring(end);
    handleInputChange(newText);
  };

  // Handle quick style application
  const handleQuickStyle = (style: StyleType) => {
    if (!inputText.trim()) {
      showToastMessage('Please enter some text first', 'warning');
      return;
    }

    const styled = applyQuickStyle(inputText, style);
    handleInputChange(styled);
    showToastMessage(`Applied ${style} style`, 'success');
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    const { start } = selection;
    const newText = inputText.substring(0, start) + emoji + inputText.substring(start);
    handleInputChange(newText);
    setShowEmojiPicker(false);
  };

  // Undo/Redo handlers
  const handleUndo = () => {
    const previousText = undo();
    if (previousText !== inputText) {
      setInputText(previousText);
    }
  };

  const handleRedo = () => {
    const nextText = redo();
    if (nextText !== inputText) {
      setInputText(nextText);
    }
  };

  // Strip formatting
  const handleStripFormatting = () => {
    if (!inputText.trim()) return;
    const plain = stripFormatting(inputText);
    handleInputChange(plain);
    showToastMessage('Formatting removed', 'success');
  };

  // Generate accessible version
  const handleGeneratePlain = () => {
    const plain = stripFormatting(formattedText);
    handleInputChange(plain);
    showToastMessage('Generated accessible version', 'success');
  };

  // Save draft
  const handleSaveDraft = () => {
    if (inputText.trim().length === 0) {
      showToastMessage('Nothing to save', 'warning');
      return;
    }

    addDraft(inputText, selectedPlatformId, formattedText);
    showToastMessage('Draft saved successfully', 'success');
    setHasUnsavedChanges(false);
  };

  // Clear all
  const handleClear = () => {
    setInputText('');
    setFormattedText('');
    setHasUnsavedChanges(false);
  };

  // Load draft
  const handleLoadDraft = (draft: Draft) => {
    setInputText(draft.content);
    setSelectedPlatformId(draft.platform);
    setShowDrafts(false);
    showToastMessage('Draft loaded', 'success');
  };

  // Delete draft
  const handleDeleteDraft = (id: string) => {
    deleteDraft(id);
    showToastMessage('Draft deleted', 'success');
  };

  // LinkedIn optimization
  const handleOptimizeForLinkedIn = (optimizedText: string) => {
    handleInputChange(optimizedText);
    showToastMessage('Text optimized for LinkedIn', 'success');
  };

  // Input Section component
  const inputSection = (
    <InputSection
      inputText={inputText}
      onInputChange={handleInputChange}
      onSelectionChange={setSelection}
      onFormat={handleFormat}
      onQuickStyle={handleQuickStyle}
      onEmojiClick={() => setShowEmojiPicker(true)}
      onUndo={handleUndo}
      onRedo={handleRedo}
      onStripFormatting={handleStripFormatting}
      onMakeAccessible={handleGeneratePlain}
      canUndo={canUndo}
      canRedo={canRedo}
    />
  );

  // Preview Section component
  const previewSection = (
    <PreviewSection
      formattedText={formattedText}
      selectedPlatform={selectedPlatform}
      onPlatformChange={setSelectedPlatformId}
      onOptimizeForLinkedIn={handleOptimizeForLinkedIn}
      onGeneratePlain={handleGeneratePlain}
      onSave={handleSaveDraft}
      onClear={handleClear}
    />
  );

  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Stats Bar */}
      <StatsBar />
      
      {/* Features Section */}
      <FeaturesSection />

      {/* Main Tool */}
      <div id="main-tool">
        <MainLayout
          inputSection={inputSection}
          previewSection={previewSection}
          onOpenDrafts={() => setShowDrafts(true)}
        />
      </div>

      {/* Mobile Formatting Toolbar */}
      {isMobile && (
        <MobileFormattingToolbar
          onFormat={handleFormat}
          onEmojiClick={() => setShowEmojiPicker(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onStripFormatting={handleStripFormatting}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      )}

      {/* Modals */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      <DraftsSidebar
        isOpen={showDrafts}
        drafts={drafts}
        onClose={() => setShowDrafts(false)}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
      />

      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Footer */}
      <Footer />

      {/* PWA Install Banner */}
      <InstallBanner />
    </>
  );
}

export default App;
