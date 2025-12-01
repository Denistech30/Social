interface MobileTabNavProps {
  activeTab: 'write' | 'preview';
  onTabChange: (tab: 'write' | 'preview') => void;
}

export default function MobileTabNav({ activeTab, onTabChange }: MobileTabNavProps) {
  return (
    <div className="lg:hidden bg-white border-b border-gray-200">
      <div className="flex">
        <button
          onClick={() => onTabChange('write')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'write'
              ? 'text-green-600 border-b-2 border-green-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Write
        </button>
        <button
          onClick={() => onTabChange('preview')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-green-600 border-b-2 border-green-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preview
        </button>
      </div>
    </div>
  );
}
