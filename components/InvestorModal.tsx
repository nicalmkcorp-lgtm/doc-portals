
import React, { useState } from 'react';
import { Investor } from '../types';
import { formatCurrency, formatDateMD } from '../utils';
import InvestorContractModal from './InvestorContractModal';

interface InvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  investors: Investor[];
  onAddInvestor: (investor: Investor) => Promise<void>;
  currencyConfig: any;
  scriptUrl?: string;
  showToast?: (msg: string) => void;
  authorizedSignature?: string;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10.01 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

const InvestorModal: React.FC<InvestorModalProps> = ({ isOpen, onClose, investors, onAddInvestor, currencyConfig, scriptUrl, showToast, authorizedSignature }) => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [contractInvestor, setContractInvestor] = useState<Investor | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankNumber, setBankNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [dateInvested, setDateInvested] = useState('');
  const [percent, setPercent] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentCurrency = currencyConfig?.useSecondary ? currencyConfig.secondary : (currencyConfig?.primary || 'PHP');
  const rate = currencyConfig?.useSecondary ? currencyConfig.exchangeRate : 1;

  const handleCopyBank = (e: React.MouseEvent, id: string, num: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    showToast?.("Bank Number Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newInvestor: Investor = {
        id: `inv-${Date.now()}`,
        name,
        bankName,
        bankNumber,
        amount: Number(amount),
        dateInvested,
        percentPerMonth: Number(percent),
        amountPerMonth: Number(monthlyAmount)
      };
      await onAddInvestor(newInvestor);
      setView('list');
      // Reset form
      setName(''); setBankName(''); setBankNumber(''); setAmount(''); setDateInvested(''); setPercent(''); setMonthlyAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenContract = (e: React.MouseEvent, investor: Investor) => {
    e.stopPropagation();
    setContractInvestor(investor);
  };

  return (
    <>
      <div className="fixed inset-0 z-[16000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
          
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <BriefcaseIcon />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-none">Investor Hub</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Portfolio & Returns</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
            {view === 'list' ? (
              <>
                {investors.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-slate-400 text-sm font-bold italic">No investors found.</p>
                  </div>
                ) : (
                  investors.map(inv => (
                    <div key={inv.id} className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden transition-all">
                      <button 
                        onClick={() => setSelectedInvestor(selectedInvestor?.id === inv.id ? null : inv)}
                        className="w-full p-4 flex items-center justify-between text-left active:bg-slate-100"
                      >
                        <div>
                          <h3 className="text-sm font-black text-slate-900 uppercase truncate flex items-center gap-2">
                            {inv.name}
                            {inv.signature && (
                              <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-lg text-[8px] font-black flex items-center gap-1 border border-emerald-200">
                                <CheckBadgeIcon /> SIGNED
                              </span>
                            )}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatDateMD(inv.dateInvested)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-emerald-600">{formatCurrency(inv.amountPerMonth * rate, currentCurrency)}/mo</p>
                          <p className="text-[9px] font-bold text-slate-400">{inv.percentPerMonth}% Return</p>
                        </div>
                      </button>
                      
                      {/* Expanded Details */}
                      {selectedInvestor?.id === inv.id && (
                        <div className="px-4 pb-4 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-200">
                          <div className="h-px bg-slate-200 w-full" />
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Invested</p>
                              <p className="font-bold text-slate-800">{formatCurrency(inv.amount * rate, currentCurrency)}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bank Name</p>
                              <p className="font-bold text-slate-800">{inv.bankName}</p>
                            </div>
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Number</p>
                             <div className={`flex items-center gap-2 border p-2 rounded-xl transition-all ${copiedId === inv.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                                <span className={`font-mono font-bold flex-1 truncate ${copiedId === inv.id ? 'text-emerald-700' : 'text-slate-700'}`}>{inv.bankNumber}</span>
                                <button 
                                  onClick={(e) => handleCopyBank(e, inv.id, inv.bankNumber)} 
                                  className={`p-1.5 rounded-lg transition-all active:scale-95 ${copiedId === inv.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                  {copiedId === inv.id ? <CheckCircleIcon /> : <CopyIcon />}
                                </button>
                             </div>
                          </div>
                          
                          {(scriptUrl || inv.signature) && (
                            <button 
                              onClick={(e) => handleOpenContract(e, inv)}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold text-xs active:scale-95 transition-all mt-2"
                            >
                              <PenIcon />
                              {inv.signature ? 'View Signed Contract' : 'Draft Contract'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Investor Name</label>
                  <input type="text" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                    <input type="text" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" value={bankName} onChange={e => setBankName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Number</label>
                    <input type="text" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" value={bankNumber} onChange={e => setBankNumber(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Investment</label>
                  <input type="number" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Invested</label>
                  <input type="date" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-center outline-none focus:ring-2 focus:ring-slate-900" value={dateInvested} onChange={e => setDateInvested(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly %</label>
                    <input type="number" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" value={percent} onChange={e => setPercent(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount/Month</label>
                    <input type="number" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900" value={monthlyAmount} onChange={e => setMonthlyAmount(e.target.value)} />
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
            {view === 'list' ? (
              <button onClick={() => setView('add')} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <PlusIcon /> Add Investor
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  {isSubmitting ? 'Saving...' : 'Save Investor'}
                </button>
                <button onClick={() => setView('list')} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {contractInvestor && (
        <InvestorContractModal 
          isOpen={true}
          onClose={() => setContractInvestor(null)}
          investor={contractInvestor}
          scriptUrl={scriptUrl || ''}
          currencyCode={currentCurrency}
          authorizedSignature={authorizedSignature}
        />
      )}
    </>
  );
};

export default InvestorModal;
