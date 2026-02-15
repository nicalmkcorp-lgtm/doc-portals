import React, { useState, useEffect } from 'react';
import { TabType } from '../types';

interface TabSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string, newType: TabType) => void;
  currentName: string;
  currentType: TabType;
  hasRecords: boolean;
  allTabs?: string[];
}

const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1-1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1-1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" cy="8" x2="12" y2="12"/><line x1="12" cy="16" x2="12.01" y2="16"/></svg>;

const TabSettingsModal: React.FC<TabSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentName, 
  currentType, 
  hasRecords,
  allTabs = []
}) => {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError("Name cannot be empty");
      return;
    }

    if (trimmedName !== currentName && allTabs.includes(trimmedName)) {
      setError("A section with this name already exists");
      return;
    }

    onConfirm(trimmedName, currentType);
  };

  const getLabelByType = (type: TabType) => {
    switch(type) {
      case 'debt': return 'Debt Ledger';
      case 'rent': return 'Rental Manager';
      case 'cashflow': return 'Cash Flow';
      case 'salary': return 'Salary Tracker';
      case 'business': return 'Business Cycles';
      case 'savings': return 'Savings Fund';
      case 'supply': return 'Supply Inventory';
      case 'product': return 'Product Portfolio';
      default: return 'General Section';
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <SettingsIcon />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Rename Section</h3>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 text-center leading-relaxed">
          Update the display name for your {getLabelByType(currentType)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Section Name</label>
            <input 
              type="text"
              autoFocus
              className={`w-full p-4 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-2xl text-center font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-inner`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
            />
            {error && (
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 px-1">
                <AlertCircleIcon /> {error}
              </p>
            )}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Locked Format</p>
            <p className="text-[11px] font-black text-slate-700 text-center uppercase tracking-tight">
              {getLabelByType(currentType)}
            </p>
            <p className="text-[7px] font-bold text-slate-400 text-center uppercase mt-1 leading-none">Format cannot be changed once created</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Update Name
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-3 text-slate-400 font-semibold hover:text-slate-600 transition-colors text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TabSettingsModal;