import React from 'react';

interface SyncOverlayProps {
  isVisible: boolean;
  isBlocking?: boolean;
  accentColor?: string;
}

const SyncOverlay: React.FC<SyncOverlayProps> = ({ isVisible, isBlocking = true, accentColor = '#2563eb' }) => {
  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[80000] pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${isBlocking ? 'pointer-events-auto touch-none' : ''}`}
    >
      {/* Minimalistic Backdrop */}
      {isBlocking && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" />
      )}

      {/* Discrete Top Progress Shimmer */}
      <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
        <div 
          className="h-full w-1/3 animate-progress-slide" 
          style={{ 
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            filter: 'blur(1px)'
          }} 
        />
      </div>

      <style>{`
        @keyframes progress-slide {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(350%); }
        }
        .animate-progress-slide {
          animation: progress-slide 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SyncOverlay;