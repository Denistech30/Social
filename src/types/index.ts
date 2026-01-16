// Core types for the Social Text Formatter

export interface Platform {
  id: string;
  name: string;
  charLimit: number;
  icon: string;
  color: string;
}

export interface Draft {
  id: string;
  content: string;
  platform: string;
  timestamp: Date;
  preview: string;
  formattedContent: string;
}

export interface AccessibilityScore {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
}

export interface FormatButtonConfig {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
  action: string;
  shortcut?: string;
}

export type FormatType = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikethrough' 
  | 'heading-1' 
  | 'heading-2' 
  | 'heading-3' 
  | 'heading-4'
  | 'bullet-list'
  | 'numbered-list';

export interface CharacterCount {
  plainTextCount: number;
  unicodeCount: number;
  platformLimit: number;
  percentage: number;
}

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export type StyleType = 'bold-serif' | 'italic' | 'script' | 'circle' | 'fraktur' | 'monospace';

export interface QuickStyle {
  id: StyleType;
  label: string;
  example: string;
}

export interface LinkedInAnalysis {
  reachScore: number;
  charCount: number;
  hashtagCount: number;
  formattingPercentage: number;
  hasExternalLink: boolean;
  hasEngagementBait: boolean;
  issues: string[];
}

export interface PlatformCompatibility {
  platform: string;
  platformName: string;
  compatible: boolean;
  supportPercentage: number;
  issues: string[];
}

export type CopyFormat = 'unicode' | 'plain' | 'html' | 'markdown';

export interface CopyResult {
  success: boolean;
  method: 'modern' | 'standard' | 'legacy' | 'failed';
  format: CopyFormat;
}

// AI Format types
export interface HighlightSpan {
  text: string; // exact substring from the block
  style?: 'bold' | 'italic' | 'underline'; // optional, default bold
}

export interface FormatBlock {
  type: 'heading' | 'subheading' | 'paragraph' | 'bullets' | 'numbered' | 'cta' | 'hashtags' | 'separator';
  text?: string;
  items?: string[];
  highlights?: HighlightSpan[];
}

export interface FormattedPost {
  platform: string;
  blocks: FormatBlock[];
}

export interface FormatResponse {
  results: FormattedPost[]; // Array of formatted posts
}

// Image Editor types
export interface EditedImage {
  blob: Blob;
  dataUrl: string;
}

export interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: string | null;
  onSave: (editedImage: EditedImage) => void;
}
