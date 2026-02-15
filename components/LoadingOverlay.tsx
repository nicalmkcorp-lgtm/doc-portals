import React, { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  color?: string; // Hex color
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message, color = '#db2777' }) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  const getTranslucent = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div 
      className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center backdrop-blur-2xl transition-opacity duration-500 gpu-layer ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ backgroundColor: getTranslucent(color, 0.4) }}
    >
      {/* Background soft color glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full animate-pulse"
          style={{ backgroundColor: getTranslucent(color, 0.3) }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-10">
          <div 
            className="absolute inset-0 blur-3xl rounded-full scale-125 animate-pulse"
            style={{ backgroundColor: getTranslucent(color, 0.4) }}
          ></div>
          <div className="relative w-24 h-24 bg-white/95 rounded-[2.5rem] shadow-2xl border border-white flex items-center justify-center group overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-white/10"></div>
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 24 24" fill="none" style={{ color: color }} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" className="drop-shadow-sm" />
                <path d="M2 17L12 22L22 17" className="opacity-30" />
                <path d="M2 12L12 17L22 12" className="opacity-60" />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter leading-none drop-shadow-lg text-white">
            Nica.Lmk.Corp
          </h1>
          <div className="flex flex-col items-center pt-2">
            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
              Enterprise Division
            </p>
            
            <div className="flex items-center gap-3 bg-white/20 px-5 py-2.5 rounded-2xl border border-white/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
              <p className="text-white text-xs font-bold animate-pulse">
                {message || "Syncing Cloud Ledger..."}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-[loading-dot_1s_infinite_0ms]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-[loading-dot_1s_infinite_200ms]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-[loading-dot_1s_infinite_400ms]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-3">
        <div className="h-px w-12 bg-white/20 mb-1"></div>
        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">
          Secure Sync Engine v5.5
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-bottom duration-700 text-white">
          Made by: Marjun Peji
        </div>
      </div>

      <style>{`
        @keyframes loading-dot {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;