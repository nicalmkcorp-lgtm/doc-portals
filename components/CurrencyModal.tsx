
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CurrencyConfig, TabType } from '../types';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CurrencyConfig;
  onUpdate: (config: Partial<CurrencyConfig>) => void;
  activeTabType?: TabType;
}

const RefreshCwIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>;
const UndoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-14 9 9 0 0 0-6 2.3L3 13"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1-1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1-1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;

const CURRENCIES = [
  'PHP', 'USD', 'SAR', 'KRW', 'JPY', 'SGD', 'AUD', 'AED', 'EUR', 'GBP', 'THB',
  'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AWG', 'AZN', 
  'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 
  'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY', 
  'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 
  'ERN', 'ETB', 'FJD', 'FKP', 'FOK', 'GEL', 'GGP', 'GHS', 
  'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 
  'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 
  'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KWD', 'KYD', 'KZT', 
  'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 
  'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 
  'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 
  'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 
  'SBD', 'SCR', 'SDG', 'SEK', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 
  'SSP', 'STN', 'SYP', 'SZL', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 
  'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'UYU', 'UZS', 'VES', 
  'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR', 
  'ZMW', 'ZWL'
];

const CurrencyModal: React.FC<CurrencyModalProps> = ({ isOpen, onClose, config, onUpdate, activeTabType }) => {
  const [selectedBase, setSelectedBase] = useState(config.primary || 'PHP');
  const [selectedSecondary, setSelectedSecondary] = useState(config.secondary || 'USD');

  useEffect(() => {
    if (isOpen) {
      setSelectedBase(config.primary || 'PHP');
      setSelectedSecondary(config.secondary || 'USD');
    }
  }, [isOpen, config.primary, config.secondary]);

  if (!isOpen) return null;

  const handleUpdateBase = () => {
    onUpdate({ primary: selectedBase });
    onClose();
  };

  const handleUpdateConversion = () => {
    onUpdate({ 
      primary: selectedBase, 
      secondary: selectedSecondary, 
      useSecondary: true 
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[16000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <GlobeIcon />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">Currency Option</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Config & Conversion</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-6 mb-8">
          <section className="space-y-3 p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
            <div className="flex items-center gap-2 mb-1">
              <SettingsIcon />
              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Tab Base Currency</h3>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Numbers in your Spreadsheet are assumed to be in this currency.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select 
                  className="w-full bg-white border border-slate-200 py-3.5 px-3 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none text-center shadow-sm"
                  value={selectedBase}
                  onChange={e => setSelectedBase(e.target.value)}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button 
                onClick={handleUpdateBase}
                className="px-4 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-md"
              >
                Set as Default
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View Conversion (Optional)</h3>
              {config.useSecondary && (
                <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-emerald-100 text-emerald-700 animate-pulse">
                  Live Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-2">
              <div className="py-3 px-2 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center">
                 <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Base</p>
                 <p className="text-xs font-black text-slate-900">{selectedBase}</p>
              </div>
              
              <div className="text-slate-300">
                <ChevronRightIcon />
              </div>

              <div className="space-y-1 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Display In</p>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 py-3 px-2 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none text-center"
                    value={selectedSecondary}
                    onChange={e => setSelectedSecondary(e.target.value)}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {config.useSecondary && (
              <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/50 flex justify-between items-center">
                 <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Live Rate</span>
                 <span className="text-[10px] font-black text-indigo-700">1 {config.primary} = {config.exchangeRate.toFixed(4)} {config.secondary}</span>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleUpdateConversion}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${config.useSecondary ? 'bg-indigo-600 text-white shadow-indigo-100 active:scale-95' : 'bg-slate-900 text-white active:scale-95'}`}
          >
            <RefreshCwIcon /> {config.useSecondary ? 'Update Exchange Rate' : 'Convert Display Now'}
          </button>
          
          {config.useSecondary && (
            <button 
              onClick={() => { onUpdate({ useSecondary: false }); onClose(); }}
              className="w-full py-3 bg-white border-2 border-slate-200 text-slate-400 font-black rounded-2xl active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <UndoIcon /> Revert to {config.primary} (Base)
            </button>
          )}

          <button 
            onClick={onClose}
            className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CurrencyModal;
