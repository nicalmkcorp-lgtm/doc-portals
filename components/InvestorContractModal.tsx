import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Investor } from '../types';
import { formatCurrency, generateContractPDF, generateContractPDFBase64 } from '../utils';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import PasscodeModal from './PasscodeModal';

interface InvestorContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: Investor;
  scriptUrl: string;
  currencyCode: string;
  authorizedSignature?: string;
  onDeleteSignature?: (id: string, type: 'investor') => Promise<void>;
  biometricEnabled?: boolean;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;
const PrinterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10.01 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;

const DEFAULT_TERMS = `INVESTMENT AGREEMENT

This Agreement establishes the terms and conditions under which the Investor provides capital to the Fund Holder for business operations.

1. CAPITAL & RETURN
The Investor agrees to invest the Principal Amount as stated in this agreement. In return, the Fund Holder agrees to pay monthly returns (interest or dividends) as specified in the investment particulars.

2. PAYMENT SCHEDULE
Monthly payouts shall be remitted via the bank details provided by the Investor. It is the Investor's responsibility to ensure that the provided account information is accurate and up to date.

3. TERM & WITHDRAWAL (INVESTOR)
This agreement is binding for the duration of the investment period. Any withdrawal of the Principal Amount requested by the Investor requires a formal notice period of at least thirty (30) days prior to the intended withdrawal date.

4. RIGHT OF RETURN (FUND HOLDER)
The Fund Holder reserves the right, at its sole discretion, to return the full Principal Amount to the Investor at any time. This provision may be exercised should underlying business circumstances, operational shifts, or unforeseen internal factors necessitate the termination of this investment arrangement.

5. RISK ACKNOWLEDGEMENT
The Investor acknowledges that all investments involve inherent risks. The Fund Holder commits to exercising due diligence in managing the funds to maintain stability and target the projected returns.

6. NON-DISCLOSURE
Both parties agree to maintain the strict confidentiality of all details regarding this financial arrangement and the associated business operations.

The undersigned hereby follow and agree to all terms and conditions set forth in this Agreement.`;

const InvestorContractModal: React.FC<InvestorContractModalProps> = ({ isOpen, onClose, investor, scriptUrl, currencyCode, authorizedSignature, onDeleteSignature, biometricEnabled }) => {
  const [step, setStep] = useState<'config' | 'link'>(investor?.signature ? 'link' : 'config');
  const [copied, setCopied] = useState(false);
  const [signingLink, setSigningLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [isSharingPDF, setIsSharingPDF] = useState(false);

  // Config fields
  const [fundHolderName, setFundHolderName] = useState(() => localStorage.getItem('contract_fund_holder') || '');
  const [termsText, setTermsText] = useState(DEFAULT_TERMS);
  
  const [principalAmount, setPrincipalAmount] = useState(() => (investor?.amount?.toString() || '0'));
  const [returnRate, setReturnRate] = useState(() => (investor?.percentPerMonth?.toString() || '0'));

  useEffect(() => {
    if (isOpen) {
      setPrincipalAmount(investor?.amount?.toString() || '0');
      setReturnRate(investor?.percentPerMonth?.toString() || '0');
      if (investor?.signature) {
        setStep('link');
      } else {
        setStep('config');
      }
    }
  }, [isOpen, investor]);

  useEffect(() => {
    localStorage.setItem('contract_fund_holder', fundHolderName);
  }, [fundHolderName]);

  if (!isOpen) return null;

  const handleGenerateLink = async () => {
    if (!scriptUrl) {
      alert("Cloud Script connection required.");
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        type: 'investor',
        id: investor.id,
        amount: principalAmount,
        rate: returnRate,
        date: investor.dateInvested,
        terms_content: termsText,
        investor_address: '', 
        name: investor.name,
        fund_holder: fundHolderName,
        bank_name: investor.bankName,
        bank_number: investor.bankNumber
      };

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveContractDraft',
          data: payload
        })
      });

      const result = await response.json();
      if (result.status === 'success' && result.draftId) {
        setSigningLink(`${scriptUrl}?mode=sign&draftId=${result.draftId}`);
        setStep('link');
      } else {
        throw new Error(result.message || "Failed to generate draft.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(signingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        title: 'Sign Investment Agreement',
        text: `Investment Agreement for ${investor.name}:`,
        url: signingLink,
        dialogTitle: 'Send link to investor',
      });
    } catch (err) {
      console.error('Error sharing link:', err);
    }
  };

  const handleSharePDF = async () => {
    setIsSharingPDF(true);
    try {
      const title = 'Investment Agreement';
      const base64Data = generateContractPDFBase64(
        title, 
        termsText, 
        investor.signature, 
        investor.name, 
        investor.signatureDate ? new Date(investor.signatureDate).toLocaleString() : undefined, 
        metaData, 
        fundHolderName, 
        authorizedSignature
      );
      
      const fileName = `Investment_Agreement_${investor.name.replace(/\s+/g, '_')}.pdf`;
      
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });
      
      await Share.share({
        title: title,
        files: [savedFile.uri],
        dialogTitle: 'Share Investment Contract'
      });
    } catch (err) {
      console.error('Error sharing PDF:', err);
      alert("Failed to share PDF.");
    } finally {
      setIsSharingPDF(false);
    }
  };

  const metaData = [
    { label: "Fund Holder", value: fundHolderName },
    { label: "Investor", value: investor.name },
    { label: "Principal", value: formatCurrency(Number(principalAmount), currencyCode) },
    { label: "Monthly Return", value: `${returnRate}%` }
  ];

  const handlePrint = () => {
    generateContractPDF('Investment Agreement', termsText, investor.signature, investor.name, investor.signatureDate ? new Date(investor.signatureDate).toLocaleString() : undefined, metaData, fundHolderName, authorizedSignature);
  };

  const handlePasscodeSuccess = async (code: string) => {
    if (onDeleteSignature) {
      await onDeleteSignature(investor.id, 'investor');
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[105000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full ${step === 'config' && !investor?.signature ? 'max-w-md' : 'max-w-sm'} bg-white rounded-[2.5rem] shadow-2xl p-6 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]`}
        onClick={e => e.stopPropagation()}
      >
        
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${investor?.signature ? 'bg-emerald-50' : 'bg-blue-50'}`}>
              {investor?.signature ? <CheckBadgeIcon /> : <PenIcon />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">{investor?.signature ? 'Active Contract' : 'Investment Contract'}</h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 ${investor?.signature ? 'text-emerald-500' : 'text-blue-500'}`}>
                {investor?.signature ? 'Signed & Verified' : 'Drafting Agreement'}
              </p>
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

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {investor?.signature ? (
            <div className="space-y-6">
              {/* High Fidelity PDF Preview */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col font-serif text-[10px] leading-tight text-slate-800 min-h-[400px]">
                 <h3 className="text-center font-bold text-xs uppercase mb-6">Investment Agreement</h3>
                 
                 <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4">
                    {metaData.map((item, i) => (
                      <div key={i} className="flex gap-1.5">
                         <span className="font-bold whitespace-nowrap">{item.label}:</span>
                         <span className="truncate">{item.value}</span>
                      </div>
                    ))}
                 </div>

                 <div className="h-px bg-slate-300 w-full mb-4" />

                 <div className="flex-1 whitespace-pre-wrap text-[9px] mb-8 text-justify opacity-80">
                    {termsText}
                 </div>

                 <div className="flex justify-between items-end gap-4 mt-auto pt-6 border-t border-slate-100">
                    <div className="flex-1 flex flex-col items-center">
                       {authorizedSignature && (
                         <img src={authorizedSignature} alt="Authorized" className="h-10 mb-[-10px] z-10 mix-blend-multiply opacity-80" />
                       )}
                       <div className="w-full border-t border-slate-900 mb-1" />
                       <span className="font-bold text-[8px] uppercase text-center">Authorized Signature</span>
                       <span className="text-[7px] font-bold mt-0.5">{fundHolderName.toUpperCase() || 'FUND HOLDER'}</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                       <img src={investor.signature} alt="Investor" className="h-10 mb-[-10px] z-10 mix-blend-multiply opacity-90" />
                       <div className="w-full border-t border-slate-900 mb-1" />
                       <span className="font-bold text-[8px] uppercase text-center">Investor Signature</span>
                       <span className="text-[7px] font-bold mt-0.5">{investor.name.toUpperCase()}</span>
                       {investor.signatureDate && <span className="text-[6px] italic opacity-60">Signed: {new Date(investor.signatureDate).toLocaleString()}</span>}
                    </div>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fund Holder Name (for PDF)</label>
                   <input type="text" value={fundHolderName} onChange={e => setFundHolderName(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 
                 <button onClick={() => setIsPasscodeOpen(true)} className="w-full py-3 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-2xl active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100">
                    <TrashIcon /> Delete Signature Record
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={handlePrint} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <PrinterIcon /> Print PDF
                </button>
                <button onClick={handleSharePDF} disabled={isSharingPDF} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                  {isSharingPDF ? 'Preparing...' : <><ShareIcon /> Share PDF</>}
                </button>
              </div>
            </div>
          ) : step === 'config' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fund Holder Name (Company)</label>
                <input type="text" value={fundHolderName} onChange={e => setFundHolderName(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Principal Amount</label>
                    <input type="number" value={principalAmount} onChange={e => setPrincipalAmount(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Return (%)</label>
                    <input type="number" value={returnRate} onChange={e => setReturnRate(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Terms & Conditions</label>
                <textarea 
                  value={termsText} 
                  onChange={e => setTermsText(e.target.value)} 
                  rows={8}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 text-[10px] leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button onClick={handleGenerateLink} disabled={isGenerating} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest mt-2 disabled:opacity-50">
                {isGenerating ? 'Generating...' : 'Generate Signing Link'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
                <p className="text-xs font-bold text-slate-700 leading-relaxed text-center">
                  Send this link to <span className="text-blue-600 font-black">{investor?.name}</span>. They can review and sign the investment agreement digitally.
                </p>
                <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-blue-100">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0"><LinkIcon /></div>
                  <input type="text" readOnly value={signingLink} className="flex-1 text-[10px] text-slate-500 font-medium bg-transparent outline-none truncate" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button onClick={handleCopyLink} className={`flex-[2] py-4 font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </button>
                  <button onClick={handleShareLink} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShareIcon /> Share
                  </button>
                </div>
                <button onClick={() => setStep('config')} className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">
                  Edit Terms
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isPasscodeOpen && (
        <PasscodeModal 
          isOpen={true} 
          onClose={() => setIsPasscodeOpen(false)} 
          onSuccess={handlePasscodeSuccess} 
          title="Confirm Deletion" 
          message="Enter master code to permanently remove this signed investment agreement." 
          biometricEnabled={biometricEnabled}
        />
      )}
    </div>,
    document.body
  );
};

export default InvestorContractModal;