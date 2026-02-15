import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DualConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const DualConfirmModal: React.FC<DualConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Delete" }) => {
  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLeftActive(false);
      setRightActive(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (leftActive && rightActive) {
      if (window.navigator.vibrate) window.navigator.vibrate(50);
      const timer = setTimeout(() => {
        onConfirm();
        onClose();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [leftActive, rightActive, onConfirm, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500 opacity-20"></div>
        
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangleIcon />
        </div>
        
        <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-xs mb-8 leading-relaxed font-bold uppercase tracking-tight">
          {message}
        </p>

        <div className="bg-slate-100/50 p-4 rounded-[2rem] border border-slate-100 mb-6">
           <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">
             Offline Security Interlock
           </p>
           
           <div className="flex gap-4 justify-center items-center">
              <button 
                onPointerDown={() => setLeftActive(true)}
                onPointerUp={() => setLeftActive(false)}
                onPointerLeave={() => setLeftActive(false)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-150 shadow-lg active:scale-90 ${leftActive ? 'bg-amber-500 text-white shadow-amber-200 scale-95' : 'bg-white text-slate-400 border-2 border-slate-200'}`}
              >
                <LockIcon />
              </button>

              <div className="flex flex-col items-center gap-1 opacity-40">
                 <div className={`w-1 h-1 rounded-full ${leftActive && rightActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                 <div className={`w-1 h-1 rounded-full ${leftActive && rightActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                 <div className={`w-1 h-1 rounded-full ${leftActive && rightActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </div>

              <button 
                onPointerDown={() => setRightActive(true)}
                onPointerUp={() => setRightActive(false)}
                onPointerLeave={() => setRightActive(false)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-150 shadow-lg active:scale-90 ${rightActive ? 'bg-amber-500 text-white shadow-amber-200 scale-95' : 'bg-white text-slate-400 border-2 border-slate-200'}`}
              >
                <LockIcon />
              </button>
           </div>
           
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-4">
             {leftActive && rightActive ? 'Authorized - Releasing...' : 'Press and hold both buttons'}
           </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
        >
          Cancel Action
        </button>
      </div>
    </div>,
    document.body
  );
};

export default DualConfirmModal;