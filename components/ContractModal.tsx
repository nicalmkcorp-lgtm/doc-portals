
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DebtRecord, TabType } from '../types';
import { formatCurrency, formatDateMD, formatPHP, generateContractPDF, generateContractPDFBase64 } from '../utils';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import PasscodeModal from './PasscodeModal';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DebtRecord;
  tabType: TabType;
  scriptUrl: string;
  currencySymbol: string;
  authorizedSignature?: string;
  onDeleteSignature?: (id: string, type: 'record', tabName: string) => Promise<void>;
  biometricEnabled?: boolean;
  publicUrl?: string;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" cy="2" x2="12" y2="15"/></svg>;
const PrinterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10.01 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const SteeringWheelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><path d="m4.93 4.93 14.14 14.14"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;

const DEFAULT_DEBT_TERMS = `Lender's Terms and Conditions:

On every due date, a percentage will be added to the amount depending on the terms stated above.

In case of delayed payment, a penalty will be applied. 
The calculation will be as follows:
If the terms are weekly, the interest amount will be divided by 7 days to determine your daily penalty. 
This calculation will be adjusted accordingly for other installment terms.

The total penalty amount will be added to the interest on your next due date.

For those wishing to renew their loans:
Priority will be given to clients who have completed their installments without delays.

For those who have neglected to pay on time:
It is possible that future loan renewals will not be granted.

Personal problems, dramas, or external circumstances will not be accepted as valid reasons for late payments.

This loan operation is a partnership-based business; any delays affect the stability of the entire system.

We may accept personal property as payment (collateral) only if:
1. The item belongs to an easily profitable or liquidatable category (e.g., gold, etc.).
2. The value of the item equals or exceeds the total loan amount plus interest.
3. Both parties agree to the proposal.

Legal action may be pursued in cases of non-compliance.

The undersigned hereby follows and agrees to all terms and conditions.`;

const DEFAULT_RENT_TERMS = `AGREEMENT FOR CAR RENTAL

- If the renter chooses to self-drive, they must possess a valid driver's license and present it to the operator.
- Any fines, penalties, or legal apprehensions resulting from the driver's actions during the rental period shall be the sole responsibility and expense of the renter.
- We can provide a driver if the renter is unable to drive or prefers to have someone else drive for them.
- An additional charge for the driver will apply, depending on the duration and distance of travel.
- The rental payment must be settled at least seven (7) days prior to the start of the rental period.
- The renter is responsible for paying for any damage incurred to the vehicle during the rental period.
- Fuel costs shall be shouldered by the renter. The fuel gauge must be at the same level upon return as it was at the start of the rental.
- Subletting or hiring the vehicle to any third party is strictly prohibited.
- The vehicle must not be operated with more passengers than the maximum limit allowed by law.
- No parts of the vehicle may be replaced without the express knowledge and approval of the operator.
- If the vehicle is returned requiring deep cleaning (due to excessive spoilage, pet hair, smoke odor, etc.), a cleaning fee of Php 50.00 will be charged to the renter.
- In the event of a breach of this agreement, the owner may demand the immediate return of the vehicle. Legal proceedings may be instituted in the City of Cavite at the owner’s discretion. The renter shall defray all court costs, attorney's fees, and legal interest. The owner shall charge 5% monthly interest on accounts overdue by more than 30 days, plus all other applicable costs.
- There is a distance limit of 300km per day. The total limit is calculated by multiplying this daily limit by the number of rental days. An excess charge of 25 Pesos per km will be applied for any distance beyond this limit.

The undersigned hereby follows and agrees to all terms and conditions.`;

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, record, tabType, scriptUrl, currencySymbol, authorizedSignature, onDeleteSignature, biometricEnabled, publicUrl }) => {
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'config' | 'link'>(record.signature ? 'link' : 'config');
  const [signingLink, setSigningLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [isSharingPDF, setIsSharingPDF] = useState(false);
  
  const isRent = tabType === 'rent';
  const isDebt = tabType === 'debt';

  const [amount, setAmount] = useState(record.amount.toString());
  
  const [term, setTerm] = useState(() => localStorage.getItem(`contract_term_${record.id}`) || 'Weekly');
  const [termPeriod, setTermPeriod] = useState(() => localStorage.getItem(`contract_period_${record.id}`) || '');
  const [amountPerDue, setAmountPerDue] = useState(() => localStorage.getItem(`contract_per_due_${record.id}`) || '');

  const [termsText, setTermsText] = useState(isRent ? DEFAULT_RENT_TERMS : DEFAULT_DEBT_TERMS);
  const [clientAddress, setClientAddress] = useState(record.signerAddress || '');
  
  const [startDate, setStartDate] = useState(record.date);
  const [endDate, setEndDate] = useState(record.endDate || record.date);
  const [distanceLimit, setDistanceLimit] = useState('300');
  
  const [operatorName, setOperatorName] = useState(() => {
    if (tabType === 'rent') return localStorage.getItem('contract_rent_operator') || '';
    if (tabType === 'debt') return localStorage.getItem('contract_debt_lender') || 'Nica.Lmk.Corp';
    return '';
  });

  const [operatorAddress, setOperatorAddress] = useState(() => {
    return localStorage.getItem('contract_rent_address') || 'Cavite City';
  });

  const [carModel, setCarModel] = useState(() => {
    return record.carModel || record.remarks || localStorage.getItem('contract_rent_model') || '';
  });

  const [plateNumber, setPlateNumber] = useState(() => {
    return record.plateNumber || localStorage.getItem('contract_rent_plate') || '';
  });

  const [driverOption, setDriverOption] = useState<'self' | 'with_driver'>(() => {
    if (record.driverOption === 'with_driver' || record.driverOption === 'self') return record.driverOption;
    return 'self';
  });

  useEffect(() => {
    if (tabType === 'rent') {
      localStorage.setItem('contract_rent_operator', operatorName);
      localStorage.setItem('contract_rent_address', operatorAddress);
      localStorage.setItem('contract_rent_model', carModel);
      localStorage.setItem('contract_rent_plate', plateNumber);
    } else if (tabType === 'debt') {
      localStorage.setItem('contract_debt_lender', operatorName);
      localStorage.setItem(`contract_term_${record.id}`, term);
      localStorage.setItem(`contract_period_${record.id}`, termPeriod);
      localStorage.setItem(`contract_per_due_${record.id}`, amountPerDue);
    }
  }, [operatorName, operatorAddress, carModel, plateNumber, tabType, term, termPeriod, amountPerDue, record.id]);

  const getDays = (s: string, e: string) => {
    const start = new Date(s);
    const end = new Date(e);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 0 ? diffDays : 1;
  };
  const rentalDays = getDays(startDate, endDate);
  const driverFee = driverOption === 'with_driver' ? 1000 : 0;
  const rentingPrice = Number(amount) || record.amount;
  const totalAmount = rentingPrice + driverFee;

  const displayName = record.signerName || record.name;

  useEffect(() => {
    if (record.signature) {
      setStep('link');
    }
  }, [record.signature]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(signingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        title: isRent ? 'Sign Rental Agreement' : 'Sign Loan Agreement',
        text: `Nica Lmk Corp Official Agreement:`,
        url: signingLink,
        dialogTitle: 'Send link to client',
      });
    } catch (err) {
      console.error('Error sharing link:', err);
    }
  };

  const handleSharePDF = async () => {
    setIsSharingPDF(true);
    try {
      const title = isRent ? 'Rental Agreement' : 'Loan Acknowledgement Form';
      const base64Data = generateContractPDFBase64(
        title, 
        termsText, 
        record.signature, 
        displayName, 
        record.signatureDate ? new Date(record.signatureDate).toLocaleString() : undefined, 
        metaData, 
        operatorName, 
        authorizedSignature
      );
      
      const fileName = `${title.replace(/\s+/g, '_')}_${displayName.replace(/\s+/g, '_')}.pdf`;
      
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });
      
      await Share.share({
        title: title,
        files: [savedFile.uri],
        dialogTitle: 'Share PDF Agreement'
      });
    } catch (err) {
      console.error('Error sharing PDF:', err);
      alert("Failed to share PDF. Make sure you have given storage permissions.");
    } finally {
      setIsSharingPDF(false);
    }
  };

  const metaData = isRent ? [
    { label: "Operator Name", value: operatorName },
    { label: "Renter Name", value: displayName },
    { label: "Renter Address", value: clientAddress },
    { label: "Car Model", value: `${carModel} (${plateNumber})` },
    { label: "Dates", value: `${formatDateMD(startDate)} to ${formatDateMD(endDate)}` },
    { label: "Driver Option", value: driverOption === 'with_driver' ? "With Driver" : "Self Drive" },
    { label: "Total Cost", value: `${currencySymbol} ${formatCurrency(totalAmount)}` }
  ] : [
    { label: "Lender Name", value: operatorName },
    { label: "Borrower Name", value: displayName },
    { label: "Borrower Address", value: clientAddress },
    { label: "Loan Amount", value: `${currencySymbol} ${formatCurrency(Number(amount))}` },
    { label: "Term", value: term === 'One payment' ? termPeriod : term.toUpperCase() },
    ...(term !== 'One payment' ? [{ label: "Term Period", value: termPeriod || 'N/A' }] : []),
    ...(term !== 'One payment' ? [{ label: "Amount per due", value: `${currencySymbol} ${formatCurrency(Number(amountPerDue))}` }] : [])
  ];

  const handlePrint = () => {
    const title = isRent ? 'Rental Agreement' : 'Loan Acknowledgement Form';
    generateContractPDF(title, termsText, record.signature, displayName, record.signatureDate ? new Date(record.signatureDate).toLocaleString() : undefined, metaData, operatorName, authorizedSignature);
  };

  const handlePasscodeSuccess = async (code: string) => {
    if (onDeleteSignature) {
      await onDeleteSignature(record.id, 'record', record.tab || tabType);
      onClose();
    }
  };

  const handleGenerate = async () => {
    if (!scriptUrl) {
       alert("Short link generation requires a Cloud Script connection.");
       return;
    }

    setIsGenerating(true);
    try {
        const payload: any = {
            id: record.id,
            amount: amount,
            date: isRent ? startDate : record.date,
            type: tabType,
            terms_content: termsText,
            client_address: clientAddress
        };

        if (isDebt) {
            payload.lender_name = operatorName;
            payload.term = term;
            payload.period = termPeriod;
            payload.amount_per_due = amountPerDue;
            payload.name = record.name; 
        } else if (isRent) {
            payload.name = record.name; 
            payload.end_date = endDate;
            payload.distance_limit = distanceLimit;
            payload.operator = operatorName;
            payload.operator_address = operatorAddress;
            payload.car_model = carModel;
            payload.plate_number = plateNumber;
            payload.rental_days = rentalDays.toString();
            payload.driver_option = driverOption;
        }

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
            let base = scriptUrl;
            
            // Check if publicUrl is valid and not empty
            if (publicUrl && publicUrl.trim().length > 10) {
               base = publicUrl.replace(/\/$/, '');
            }

            const queryChar = base.includes('?') ? '&' : '?';
            let finalLink = `${base}${queryChar}mode=sign&draftId=${result.draftId}`;
            
            // Only append endpoint if we are using the external host
            if (base !== scriptUrl) {
                finalLink += `&endpoint=${encodeURIComponent(scriptUrl)}`;
            }

            setSigningLink(finalLink);
            setStep('link');
        } else {
            throw new Error(result.message || "Failed to generate link");
        }
    } catch (e: any) {
        alert("Error generating link: " + e.message);
    } finally {
        setIsGenerating(false);
    }
  };

  const configFormContent = (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRent ? 'Renting Price Amount' : 'Loan Amount'} ({currencySymbol})</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      
      {isRent && (
        <>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Operator Name</label>
            <input type="text" value={operatorName} onChange={e => setOperatorName(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Operator Address</label>
            <input type="text" value={operatorAddress} onChange={e => setOperatorAddress(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Car Model</label>
              <input type="text" placeholder="e.g. Vios 2023" value={carModel} onChange={e => setCarModel(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Plate Number</label>
              <input type="text" placeholder="ABC 1234" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-center text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-center text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
            </div>
          </div>
          
          <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Optional Driver</label>
              <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button onClick={() => setDriverOption('self')} className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${driverOption === 'self' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Self Drive</button>
                <button onClick={() => setDriverOption('with_driver')} className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-1 ${driverOption === 'with_driver' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}><SteeringWheelIcon /> With Driver</button>
              </div>
              {driverOption === 'with_driver' && <p className="text-[9px] font-bold text-indigo-600 ml-1 text-center bg-indigo-50 py-1 rounded-lg border border-indigo-100">+ ₱1,000 (12hour only)</p>}
          </div>

          <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Distance Limit (km/day)</label>
              <input type="number" value={distanceLimit} onChange={e => setDistanceLimit(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </>
      )}

      {isDebt && (
        <>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lender Name</label>
            <input type="text" value={operatorName} onChange={e => setOperatorName(e.target.value)} placeholder="(Empty by default)" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Term Type</label>
              <select value={term} onChange={e => setTerm(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                <option value="One payment">One payment</option>
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{term === 'One payment' ? 'Payment Date' : 'Period'}</label>
              <input type="text" placeholder={term === 'One payment' ? "e.g. Dec 25" : "e.g. 3 Months"} value={termPeriod} onChange={e => setTermPeriod(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {term !== 'One payment' && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount Per Due</label>
              <input type="number" value={amountPerDue} onChange={e => setAmountPerDue(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
        </>
      )}

      <div className="space-y-1.5">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Terms & Conditions</label>
        <textarea 
          value={termsText} 
          onChange={e => setTermsText(e.target.value)} 
          rows={8}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 text-[10px] leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-[105000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className={`w-full ${step === 'config' && !record.signature ? 'max-w-md' : 'max-w-sm'} bg-white rounded-[2.5rem] shadow-2xl p-6 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]`}
          onClick={e => e.stopPropagation()}
        >
          
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${record.signature ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                {record.signature ? <CheckBadgeIcon /> : <PenIcon />}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-none">{record.signature ? 'Signed Contract' : 'Digital Agreement'}</h2>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 ${record.signature ? 'text-emerald-500' : 'text-blue-500'}`}>
                  {record.signature ? 'Legally Binding' : (step === 'config' ? 'Setup Terms' : 'Pending Signature')}
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
            {record.signature ? (
              <div className="space-y-6">
                {/* High Fidelity PDF Preview */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col font-serif text-[10px] leading-tight text-slate-800 min-h-[400px]">
                   <h3 className="text-center font-bold text-xs uppercase mb-6">{isRent ? 'Rental Agreement' : 'Loan Acknowledgement Form'}</h3>
                   
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
                         <span className="font-bold text-[8px] uppercase">Authorized Signature</span>
                         <span className="text-[7px] font-bold mt-0.5">{operatorName.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                         <img src={record.signature} alt="Client" className="h-10 mb-[-10px] z-10 mix-blend-multiply opacity-90" />
                         <div className="w-full border-t border-slate-900 mb-1" />
                         <span className="font-bold text-[8px] uppercase">Client Signature</span>
                         <span className="text-[7px] font-bold mt-0.5">{displayName.toUpperCase()}</span>
                         {record.signatureDate && <span className="text-[6px] italic opacity-60">Signed: {new Date(record.signatureDate).toLocaleString()}</span>}
                      </div>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShowEditDetails(!showEditDetails)} className="py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50">
                    <EditIcon /> Details
                  </button>
                  <button onClick={() => setIsPasscodeOpen(true)} className="py-3 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-2xl active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100">
                    <TrashIcon /> Delete Contract
                  </button>
                </div>

                {showEditDetails && configFormContent}

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
              <>
                {configFormContent}
                <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest mt-6 disabled:opacity-50">
                  {isGenerating ? 'Saving Draft...' : 'Generate Link'}
                </button>
              </>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-bold text-slate-700 leading-relaxed text-center">
                    Send this link to <span className="text-blue-600 font-black">{record.name}</span>. They can sign the agreement directly on their phone.
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
                  {!record.signature && (
                    <button onClick={() => setStep('config')} className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">
                      Edit Terms
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isPasscodeOpen && (
        <PasscodeModal 
          isOpen={true} 
          onClose={() => setIsPasscodeOpen(false)} 
          onSuccess={handlePasscodeSuccess} 
          title="Confirm Deletion" 
          message="Enter master code to permanently remove this signed contract from records." 
          biometricEnabled={biometricEnabled}
        />
      )}
    </>,
    document.body
  );
};

export default ContractModal;
