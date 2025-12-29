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
import QrCodeModal from './components/shared/QrCodeModal';
import { formatText, applyQuickStyle, stripFormatting } from './lib/unicode-transforms';
import { callAIFormatAPI, renderFormatBlocks } from './lib/ai-format-renderer';
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
  const [showQrModal, setShowQrModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  
  // AI Format state
  const [isAIFormatting, setIsAIFormatting] = useState(false);
  const [originalTextForUndo, setOriginalTextForUndo] = useState<string>('');
  const [showUndoToast, setShowUndoToast] = useState(false);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showToast, setShowToast] = useState(false);

  // Hooks
  const { drafts, addDraft, addNewDraft, deleteDraft } = useDrafts();
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

  // Show floating CTA on mobile when user scrolls past hero
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8; // Approximate hero height
      const scrolled = window.scrollY > heroHeight;
      const toolElement = document.getElementById('main-tool');
      const toolVisible = toolElement ? toolElement.getBoundingClientRect().top <= window.innerHeight : false;
      
      // Show floating CTA when scrolled past hero but tool not yet visible
      setShowFloatingCTA(scrolled && !toolVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

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
          case 's':
            e.preventDefault();
            handleSaveDraft();
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

  // Scroll to tool function
  const scrollToTool = () => {
    document.getElementById('main-tool')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
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

    if (inputText === DEMO_TEXT) {
      showToastMessage('Please modify the demo text before saving', 'warning');
      return;
    }

    addDraft(inputText, selectedPlatformId, formattedText);
    showToastMessage('Draft saved successfully! 📝', 'success');
    setHasUnsavedChanges(false);
  };

  // Save as new draft (always creates a new draft)
  const handleSaveNewDraft = () => {
    if (inputText.trim().length === 0) {
      showToastMessage('Nothing to save', 'warning');
      return;
    }

    if (inputText === DEMO_TEXT) {
      showToastMessage('Please modify the demo text before saving', 'warning');
      return;
    }

    addNewDraft(inputText, selectedPlatformId, formattedText);
    showToastMessage('New draft created! ✨', 'success');
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

  // Handle QR modal from header
  const handleHeaderQRClick = () => {
    // Track GA4 event for header QR access
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'qr_opened', {
        event_category: 'qr_feature',
        source: 'header'
      });
    }
    setShowQrModal(true);
  };

  // Handle AI Format
  const handleAIFormat = async () => {
    if (!inputText.trim() || isAIFormatting) return;

    setIsAIFormatting(true);
    setOriginalTextForUndo(inputText); // Save for undo

    try {
      const selectedPlatform = getPlatformById(selectedPlatformId);
      const platformName = selectedPlatform?.id === 'twitter' ? 'x' : selectedPlatform?.id;
      
      const formatResult = await callAIFormatAPI(
        inputText,
        platformName || 'facebook',
        selectedPlatform?.charLimit,
        {
          tone: 'neutral',
          keepHashtags: true,
          keepCTA: true
        }
      );

      // Render blocks into formatted text
      const formattedOutput = renderFormatBlocks(formatResult.blocks);
      
      // Update the input text with formatted result
      handleInputChange(formattedOutput);
      
      // Show success message with undo option
      showToastMessage('Text formatted successfully!', 'success');
      setShowUndoToast(true);
      
      // Hide undo toast after 10 seconds
      setTimeout(() => {
        setShowUndoToast(false);
      }, 10000);

    } catch (error) {
      console.error('AI Format error:', error);
      showToastMessage(
        error instanceof Error ? error.message : 'AI formatting failed. Please try again.',
        'error'
      );
    } finally {
      setIsAIFormatting(false);
    }
  };

  // Handle undo AI format
  const handleUndoAIFormat = () => {
    if (originalTextForUndo) {
      handleInputChange(originalTextForUndo);
      setOriginalTextForUndo('');
      setShowUndoToast(false);
      showToastMessage('Formatting undone', 'success');
    }
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
      onSaveDraft={handleSaveDraft}
      onSaveNewDraft={handleSaveNewDraft}
      onAIFormat={handleAIFormat}
      canUndo={canUndo}
      canRedo={canRedo}
      hasUnsavedChanges={hasUnsavedChanges}
      isAIFormatting={isAIFormatting}
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
      onTextChange={handleInputChange}
    />
  );

  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Quick Access CTA - Mobile Only */}
      {isMobile && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-y border-green-200 py-4">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <button
              onClick={scrollToTool}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <span>🚀 Skip to Editor</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            <p className="text-xs text-gray-600 mt-2">Jump straight to the formatting tool</p>
          </div>
        </div>
      )}
      
      {/* Stats Bar */}
      <StatsBar />
      
      {/* Features Section */}
      <FeaturesSection />

      {/* Main Tool */}
      <div id="main-tool" className="relative">
        {/* Visual indicator for mobile users */}
        {isMobile && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-3 px-6">
            <p className="text-sm font-semibold">
              ✨ Text Formatter Tool - Start typing below!
            </p>
          </div>
        )}
        
        <MainLayout
          inputSection={inputSection}
          previewSection={previewSection}
          onOpenDrafts={() => setShowDrafts(true)}
          onOpenQR={handleHeaderQRClick}
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
          onSaveDraft={handleSaveDraft}
          onSaveNewDraft={handleSaveNewDraft}
          canUndo={canUndo}
          canRedo={canRedo}
          hasUnsavedChanges={hasUnsavedChanges}
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

      {/* Undo AI Format Toast */}
      {showUndoToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700">Text formatted successfully!</span>
            <button
              onClick={handleUndoAIFormat}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QrCodeModal open={showQrModal} onOpenChange={setShowQrModal} />

      {/* Floating CTA Button - Mobile Only */}
      {showFloatingCTA && isMobile && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
          <button
            onClick={scrollToTool}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-2 border-2 border-white"
          >
            <span>✨ Start Formatting</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* PWA Install Banner */}
      <InstallBanner />
    </>
  );
}

export default App;
