import React from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'warning';
  icon?: React.ReactNode;
}

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  confirmVariant = 'danger',
  icon
}) => {
  if (!isOpen) return null;

  const buttonClass = confirmVariant === 'danger' 
    ? "w-full py-4 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-100 active:scale-95 transition-all"
    : "w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 active:scale-95 transition-all";

  const iconBg = confirmVariant === 'danger' ? 'bg-red-50' : 'bg-emerald-50';

  return createPortal(
    <div className="fixed inset-0 z-[110000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner`}>
          {icon || <TrashIcon />}
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className={buttonClass}
          >
            {confirmText}
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 text-slate-400 font-semibold hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;