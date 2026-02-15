import React, { useMemo } from 'react';
import { DebtRecord } from '../types';
import { formatPHP, formatDateMD } from '../utils';

interface FinalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  historyRecords: DebtRecord[];
  activeTab: string;
  showToast?: (msg: string) => void;
  scrubInfo?: { name: string; keepId: string; tab: string };
  copyBullet?: string;
  copyFooter?: string;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10.01 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2H6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>;

const FinalSummaryModal: React.FC<FinalSummaryModalProps> = ({ isOpen, onClose, name, historyRecords, activeTab, showToast, scrubInfo, copyBullet = '🌸', copyFooter = 'Thank you - Lmk' }) => {
  const sortedHistory = useMemo(() => {
    const uniqueMap = new Map();
    historyRecords.forEach(r => uniqueMap.set(r.id, r));
    return Array.from(uniqueMap.values()).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [historyRecords]);

  const total = useMemo(() => sortedHistory.reduce((sum, r) => sum + r.amount, 0), [sortedHistory]);

  if (!isOpen) return null;

  const handleCopy = () => {
    let text = `Loan Completion\nSummary.\n\nLoan Details:\n"${activeTab.toUpperCase()}"\n\n"${name}"\n\n`;
    sortedHistory.forEach(r => {
      const remarkStr = r.remarks?.trim() ? ` (${r.remarks.trim()})` : "";
      text += `${copyBullet} ${formatDateMD(r.date)} - ${formatPHP(r.amount)}${remarkStr}\n`;
    });
    text += `\nGrand Total: ${formatPHP(total)}\n\n${copyFooter}`;
    
    navigator.clipboard.writeText(text);
    if (showToast) showToast("Summary Copied!");
  };

  return (
    <div 
      className="fixed inset-0 z-[13000] flex items-center justify-center bg-black/70 backdrop-blur-md p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-hidden border border-emerald-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-50 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-inner">
              <CheckCircleIcon />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">Loan Completion</h2>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">Dues Fully Settled</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors active:scale-95"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-black text-emerald-600 leading-tight mb-2">💥ALL DUE IS PAID!💥</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">All historical amount</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid By</p>
              <p className="text-base font-black text-slate-900 border-l-4 border-emerald-500 pl-3 py-1 bg-emerald-50/50 rounded-r-lg">'{name}'</p>
            </div>

            <div className="space-y-2">
              {sortedHistory.map((r, idx) => (
                <div key={r.id || idx} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  <span className="text-pink-400 text-sm">🌸</span>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-slate-700">{formatPHP(r.amount)}</span>
                    <span className="mx-2 text-slate-400 text-[10px] font-medium">and</span>
                    <span className="text-[11px] font-black text-slate-500 uppercase">{formatDateMD(r.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3 shrink-0">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
            <span className="text-xl font-black text-emerald-700">{formatPHP(total)}</span>
          </div>
          <button 
            type="button"
            onClick={handleCopy}
            className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-[0.1em]"
          >
            <ClipboardIcon /> Copy Details
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Dismiss Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalSummaryModal;