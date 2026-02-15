import React from 'react';

interface ErrorRetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  message: string;
}

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

const ErrorRetryModal: React.FC<ErrorRetryModalProps> = ({ isOpen, onClose, onRetry, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-md p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-red-50/50">
          <AlertTriangleIcon />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2">Sync Failed</h3>
        <p className="text-slate-600 text-sm mb-8 leading-relaxed font-medium whitespace-pre-line">
          {message || "We couldn't reach the Google Sheet.\nPlease check your connection and try again."}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onRetry}
            className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            Try Sync Again
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 text-slate-400 font-semibold hover:text-slate-600 transition-colors text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorRetryModal;