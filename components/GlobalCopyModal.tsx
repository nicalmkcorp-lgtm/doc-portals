
import React from 'react';

interface GlobalCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyGlobal: (type: string) => void;
  onCopyAlerts: () => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;

const GlobalCopyModal: React.FC<GlobalCopyModalProps> = ({ isOpen, onClose, onCopyGlobal, onCopyAlerts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[14000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-none">Global Copy</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Export Summaries</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-3">
          <button onClick={() => { onCopyGlobal('debt'); onClose(); }} className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-4 transition-all group active:scale-[0.98]">
             <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shadow-sm"><CopyIcon /></div>
             <div className="text-left">
                <p className="text-sm font-black text-slate-800 uppercase">Copy Debt</p>
                <p className="text-[10px] font-bold text-slate-400">All debt records across tabs</p>
             </div>
          </button>

          <button onClick={() => { onCopyAlerts(); onClose(); }} className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-4 transition-all group active:scale-[0.98]">
             <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm"><BellIcon /></div>
             <div className="text-left">
                <p className="text-sm font-black text-slate-800 uppercase">Today/Tomorrow Dues</p>
                <p className="text-[10px] font-bold text-slate-400">Urgent collection alerts</p>
             </div>
          </button>

          <button onClick={() => { onCopyGlobal('rent'); onClose(); }} className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-4 transition-all group active:scale-[0.98]">
             <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm"><CopyIcon /></div>
             <div className="text-left">
                <p className="text-sm font-black text-slate-800 uppercase">Copy Rent</p>
                <p className="text-[10px] font-bold text-slate-400">Rental summaries</p>
             </div>
          </button>

          <button onClick={() => { onCopyGlobal('cashflow'); onClose(); }} className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-4 transition-all group active:scale-[0.98]">
             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm"><CopyIcon /></div>
             <div className="text-left">
                <p className="text-sm font-black text-slate-800 uppercase">Copy Flow</p>
                <p className="text-[10px] font-bold text-slate-400">Cash flow transactions</p>
             </div>
          </button>

          <button onClick={() => { onCopyGlobal('product'); onClose(); }} className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-4 transition-all group active:scale-[0.98]">
             <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center shadow-sm"><CopyIcon /></div>
             <div className="text-left">
                <p className="text-sm font-black text-slate-800 uppercase">Copy Prods</p>
                <p className="text-[10px] font-bold text-slate-400">Product inventory list</p>
             </div>
          </button>
        </div>
        
        <button onClick={onClose} className="w-full mt-6 py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
      </div>
    </div>
  );
};

export default GlobalCopyModal;
