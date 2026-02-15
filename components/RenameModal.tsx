import React, { useState, useEffect } from 'react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
}

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;

const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, onConfirm, currentName }) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) setName(currentName);
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== currentName) {
      onConfirm(name.trim());
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <EditIcon />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Rename Tab</h3>
        <p className="text-slate-500 text-sm mb-6 text-center leading-relaxed">
          Enter a new name for this sheet in your Google Spreadsheet.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text"
            autoFocus
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              Update Name
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-3 text-slate-400 font-semibold hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameModal;