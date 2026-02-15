import React, { useState, useEffect } from 'react';

interface AdjustBankBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBalance: number;
  onSave: (newBalance: number) => void;
  mode: 'overwrite' | 'adjust';
}

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
  </svg>
);

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>;

const AdjustBankBalanceModal: React.FC<AdjustBankBalanceModalProps> = ({ isOpen, onClose, initialBalance, onSave, mode }) => {
  const [balanceInput, setBalanceInput] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // For overwrite mode, show existing balance. For adjust mode, start fresh.
      setBalanceInput(mode === 'overwrite' ? (initialBalance === 0 ? '' : initialBalance.toString()) : '');
    }
  }, [isOpen, initialBalance, mode]);

  if (!isOpen) return null;

  const handleSaveOverwrite = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Number(balanceInput) || 0);
    onClose();
  };

  const handleAdjust = (type: 'add' | 'subtract') => {
    const amount = Number(balanceInput) || 0;
    const finalVal = type === 'add' ? initialBalance + amount : initialBalance - amount;
    onSave(finalVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WalletIcon />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
          {mode === 'overwrite' ? 'Edit Bank Balance' : 'Adjust Bank Balance'}
        </h3>
        <p className="text-slate-500 text-xs mb-6 text-center leading-relaxed font-semibold">
          {mode === 'overwrite' 
            ? 'Update your "Initial Bank Balance" directly.' 
            : 'Enter an amount to add to or subtract from your balance.'}
        </p>

        <form onSubmit={mode === 'overwrite' ? handleSaveOverwrite : (e) => e.preventDefault()} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              {mode === 'overwrite' ? 'Starting Balance' : 'Amount'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₱</span>
              <input 
                type="number"
                inputMode="decimal"
                className="w-full p-4 pl-8 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-800 outline-none transition-all shadow-inner"
                placeholder="0"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                autoFocus
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {mode === 'overwrite' ? (
              <button 
                type="submit"
                className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                Update Balance
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => handleAdjust('add')}
                  className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <PlusIcon /> Add
                </button>
                <button 
                  type="button"
                  onClick={() => handleAdjust('subtract')}
                  className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <MinusIcon /> Subtract
                </button>
              </div>
            )}
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

export default AdjustBankBalanceModal;