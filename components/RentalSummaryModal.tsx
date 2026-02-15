import React from 'react';
import { DebtRecord } from '../types';
import { formatPHP, formatDateMD } from '../utils';

interface RentalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DebtRecord[];
  tab: string;
  totalYearEarnings: number;
  showToast?: (msg: string) => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2H6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>;

const RentalSummaryModal: React.FC<RentalSummaryModalProps> = ({ isOpen, onClose, records, tab, totalYearEarnings, showToast }) => {
  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  const handleCopy = () => {
    // Sort oldest to newest (ascending)
    const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
    
    let text = "Finished booking Summary\n\n";
    text += `✨${tab.toUpperCase()}✨\n\n`;
    text += "Added earnings:\n\n";
    
    sortedRecords.forEach(r => {
      text += `🌸 ${r.name}: \n`;
      text += `      (${formatDateMD(r.date)} to ${formatDateMD(r.endDate || r.date)})\n`;
      if (r.remarks && r.remarks.trim()) {
        text += `      ${r.remarks.trim()}\n`;
      }
    });
    
    text += "\nTotal year earnings:\n\n";
    text += `        ${formatPHP(totalYearEarnings)}\n\n`;
    text += "Thank you - Lmk";
    
    navigator.clipboard.writeText(text);
    if (showToast) showToast("Rental Summary Copied!");
  };

  return (
    <div className="fixed inset-0 z-[13000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-400 flex flex-col max-h-[85vh] overflow-hidden border border-indigo-100">
        <div className="p-6 border-b border-slate-50 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
              <TrendingUpIcon />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">Booking Finished</h2>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1.5">Earnings Updated</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-black text-indigo-600 leading-tight mb-2">Added to total year earnings:</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rental History {currentYear}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              {records.map((r, idx) => (
                <div key={idx} className="flex flex-col gap-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-900">{r.name}</span>
                    <span className="text-sm font-black text-indigo-600">{formatPHP(r.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pink-400 text-xs">🌸</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {formatDateMD(r.date)} - {formatDateMD(r.endDate || r.date)}
                    </span>
                  </div>
                  {r.remarks && (
                    <p className="text-[10px] text-slate-500 italic mt-1 border-t border-slate-100 pt-1">
                      {r.remarks}
                    </p>
                  )}
                </div>
              ))}
              {records.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-xs font-medium italic">No other finished bookings for this year.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3 shrink-0">
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Yearly Earnings</span>
              <span className="text-[10px] font-bold text-indigo-500">{currentYear} Total</span>
            </div>
            <span className="text-xl font-black text-indigo-700">{formatPHP(totalYearEarnings)}</span>
          </div>
          
          <button 
            onClick={handleCopy}
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-[0.1em]"
          >
            <ClipboardIcon /> Copy Details
          </button>
          
          <div className="flex flex-col items-center gap-3">
             <button 
               onClick={onClose}
               className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
             >
               Dismiss
             </button>
             <div className="text-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Developer</p>
                <p className="text-[10px] font-black text-slate-500 tracking-tight">Marjun Peji</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalSummaryModal;