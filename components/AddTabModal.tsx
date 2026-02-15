import React, { useState, useEffect, useRef } from 'react';
import { TabType } from '../types';

interface AddTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, type: TabType) => void;
  existingTabs?: string[];
}

const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
    <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
  </svg>
);

const WalletIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const CarIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>;
const TrendingUpIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const BriefcaseIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const PiggyBankIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1 .5-1.5 1-2 0-2.5-1.5-4.5-4-4Z"/><path d="M7 14h.01"/><path d="M9 18v-2h6v2"/></svg>;
const PackageIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const LayersIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.27a2 2 0 0 0 0 3.66l9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09a2 2 0 0 0 0-3.66z"/><path d="m2.1 14.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/><path d="m2.1 19.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" cy="8" x2="12" y2="12"/><line x1="12" cy="16" x2="12.01" y2="16"/></svg>;

const AddTabModal: React.FC<AddTabModalProps> = ({ isOpen, onClose, onConfirm, existingTabs = [] }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TabType>('debt');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setType('debt');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { 
        setError("Section name is required"); 
        return; 
    }
    
    if (existingTabs.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
        setError("Section name already exists");
        return;
    }

    onConfirm(trimmed, type);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-[500px] bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"><PlusCircleIcon /></div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">New Section</h3>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 text-center leading-relaxed">Choose Tracking Format</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Section Name</label>
            <input ref={inputRef} type="text" placeholder="e.g. Daily Sales" className={`w-full p-4 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-2xl text-center font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner`} value={name} onChange={(e) => { setName(e.target.value); if(error) setError(null); }} />
            {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 px-1 justify-center animate-in fade-in slide-in-from-top-1"><AlertCircleIcon /> {error}</p>}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Inventory & Financial Formats</label>
              <div className="grid grid-cols-4 gap-1.5">
                <button type="button" onClick={() => setType('debt')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${type === 'debt' ? 'border-blue-600 bg-blue-50' : 'border-slate-50 bg-white opacity-60'}`}>
                  <div className={`p-1.5 rounded-lg ${type === 'debt' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}><WalletIcon size={12} /></div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full">Debt</span>
                </button>
                <button type="button" onClick={() => setType('rent')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${type === 'rent' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 bg-white opacity-60'}`}>
                  <div className={`p-1.5 rounded-lg ${type === 'rent' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}><CarIcon size={12} /></div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full">Rent</span>
                </button>
                <button type="button" onClick={() => setType('cashflow')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${type === 'cashflow' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-50 bg-white opacity-60'}`}>
                  <div className={`p-1.5 rounded-lg ${type === 'cashflow' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}><TrendingUpIcon size={12} /></div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full">Flow</span>
                </button>
                <button type="button" onClick={() => setType('salary')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${type === 'salary' ? 'border-amber-600 bg-amber-50' : 'border-slate-50 bg-white opacity-60'}`}>
                  <div className={`p-1.5 rounded-lg ${type === 'salary' ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-400'}`}><BriefcaseIcon size={12} /></div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full">Salary</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Other Formats</label>
              <div className="grid grid-cols-4 gap-1.5">
                <button type="button" onClick={() => setType('supply')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${type === 'supply' ? 'border-cyan-600 bg-cyan-50' : 'border-slate-50 bg-white opacity-60'}`}>
                  <div className={`p-1.5 rounded-lg ${type === 'supply' ? 'bg-cyan-600 text-white' : 'bg-slate-50 text-slate-400'}`}><PackageIcon size={12} /></div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full">Supply</span>
                </button>
                <button type="button" onClick={() => setType('product')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${type === 'product' ? 'border-blue-600 bg-blue-50' : 'border-slate-50 bg-white opacity-60'}`}>
                  <div className={`p-1.5 rounded-lg ${type === 'product' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}><LayersIcon size={12} /></div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full">Product</span>
                </button>
                <button type="button" onClick={() => setType('business')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${type === 'business' ? 'border-violet-600 bg-violet-50' : 'border-slate-50 bg-white opacity-60'}`}>
                  <div className={`p-1.5 rounded-lg ${type === 'business' ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-400'}`}><BriefcaseIcon size={12} /></div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full">Biz Cycle</span>
                </button>
                <button type="button" onClick={() => setType('savings')} className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${type === 'savings' ? 'border-orange-500 bg-orange-50' : 'border-slate-50 bg-white opacity-60'}`}>
                  <div className={`p-1.5 rounded-lg ${type === 'savings' ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400'}`}><PiggyBankIcon size={12} /></div>
                  <span className="text-[7px] font-black uppercase text-center truncate w-full">Savings</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Create Section</button>
            <button type="button" onClick={onClose} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTabModal;