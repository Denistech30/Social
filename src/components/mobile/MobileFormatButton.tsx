interface MobileFormatButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

export default function MobileFormatButton({ 
  icon, 
  label, 
  onClick, 
  active = false 
}: MobileFormatButtonProps) {
  return (
    <button
      onClick={onClick}
      onTouchStart={() => {
        // Haptic feedback on touch devices
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }}
      className={`min-w-[56px] h-12 px-3 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors duration-150 touch-manipulation ${
        active
          ? 'bg-green-500 text-white active:bg-green-600'
          : 'bg-white border-2 border-gray-300 text-gray-700 active:bg-green-50 active:border-green-500'
      }`}
      aria-label={label}
      type="button"
    >
      {/* Icon */}
      <div className="w-5 h-5 flex items-center justify-center">
        {icon}
      </div>

      {/* Label */}
      <span className="text-[10px] font-medium leading-none">
        {label}
      </span>
    </button>
  );
}
