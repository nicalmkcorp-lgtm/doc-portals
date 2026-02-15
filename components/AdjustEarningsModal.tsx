import React, { useState, useEffect } from 'react';

interface AdjustEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustments: { month: number; year: number };
  onSave: (newAdjustments: { month: number; year: number }) => void;
}

const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;

const AdjustEarningsModal: React.FC<AdjustEarningsModalProps> = ({ isOpen, onClose, adjustments, onSave }) => {
  // Use strings for inputs to allow clearing (empty string) and easier typing of signs (+/-)
  const [yearInput, setYearInput] = useState<string>('');

  // Sync state when adjustments prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      // If value is 0, start with empty string so placeholder '0' shows 
      // and user input replaces it instantly.
      setYearInput(adjustments.year === 0 ? '' : adjustments.year.toString());
    }
  }, [isOpen, adjustments]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse string back to number on submission, default to 0 if empty
    onSave({
      month: adjustments.month, // Preserve existing month adjustment
      year: Number(yearInput) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingUpIcon />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Adjust Earnings</h3>
        <p className="text-slate-500 text-xs mb-6 text-center leading-relaxed">
          Manually offset the annual earnings display. Use negative numbers for expenses.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Yearly Offset (+/-)</label>
            <input 
              type="number"
              inputMode="decimal"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="0"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Save Adjustments
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

export default AdjustEarningsModal;