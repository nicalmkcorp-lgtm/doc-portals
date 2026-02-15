import React, { useState, useEffect } from 'react';

interface AdjustQtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  initialQty: number;
  onConfirm: (newQty: number) => void;
}

const LayersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.27a2 2 0 0 0 0 3.66l9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09a2 2 0 0 0 0-3.66z"/><path d="m2.1 14.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/><path d="m2.1 19.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/></svg>;

const AdjustQtyModal: React.FC<AdjustQtyModalProps> = ({ isOpen, onClose, itemName, initialQty, onConfirm }) => {
  const [qty, setQty] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setQty(initialQty.toString());
    }
  }, [isOpen, initialQty]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(qty);
    if (!isNaN(val)) {
      onConfirm(val);
    } else {
      onConfirm(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[14000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <LayersIcon />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Adjust Stock</h3>
        <p className="text-slate-500 text-xs mb-6 text-center leading-relaxed font-black uppercase tracking-wider">
          {itemName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
            <input 
              type="number" 
              autoFocus
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center font-black text-2xl text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              Update Quantity
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustQtyModal;