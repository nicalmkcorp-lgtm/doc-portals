
import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { DebtRecord, TabType, CurrencyConfig, AppSession } from '../types';
import { addDays, getTodayStr, formatCurrency } from '../utils';
import { Contacts } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';
import { createPortal } from 'react-dom';

interface RecordFormProps {
  onClose: () => void;
  onSubmit: (record: any | any[], isEdit: boolean) => void;
  initialData: DebtRecord | null;
  activeTab: string;
  activeTabType: TabType;
  records?: DebtRecord[]; 
  currencyConfig: CurrencyConfig;
  appPin?: string;
  isMaster?: boolean;
  biometricEnabled?: boolean;
  session?: AppSession | null;
  showToast?: (message: string, type?: 'success' | 'error' | 'restricted') => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
const ContactIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>;
const HashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>;
const TrashIcon = ({ size = 14 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" cy="8" x2="12" y2="12"/><line x1="12" cy="16" x2="12.01" y2="16"/></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" cy="8" x2="19" y2="14"/><line x1="16" cy="11" x2="22" y2="11"/></svg>;
const SearchIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

const COUNTRY_CODES = [
  { code: '+63', flag: '🇵🇭', label: 'PH' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+82', flag: '🇰🇷', label: 'KR' },
  { code: '+81', flag: '🇯🇵', label: 'JP' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

const PRODUCT_INCOMING_SOURCES = ['production', 'delivery', 'return'] as const;
const PRODUCT_OUTGOING_SOURCES = ['giveaway', 'sales', 'disposal'] as const;

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const RecordForm = memo(({ onClose, onSubmit, initialData, activeTab, activeTabType, records = [], currencyConfig, appPin, isMaster, biometricEnabled, session, showToast }: RecordFormProps) => {
  const [name, setName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [price, setPrice] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [globalRemarks, setGlobalRemarks] = useState('');
  const [batchSummary, setBatchSummary] = useState<{ items: { name: string, amount: number, actualAmount?: number }[], type: 'income' | 'expense' | 'default', total: number } | null>(null);
  const [isItemSearchOpen, setIsItemSearchOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  
  const isRent = activeTabType === 'rent';
  const isCashflow = activeTabType === 'cashflow';
  const isSalary = activeTabType === 'salary';
  const isDebt = activeTabType === 'debt';
  const isBusiness = activeTabType === 'business';
  const isBusinessTab = activeTabType === 'business';
  const isSavings = activeTabType === 'savings';
  const isSupply = activeTabType === 'supply' || activeTabType === 'product';
  const isProduct = activeTabType === 'product';
  const isEdit = !!(initialData && initialData.id);

  const baseCurrency = currencyConfig?.primary || 'PHP';
  const currencySymbol = baseCurrency === 'PHP' ? '₱' : baseCurrency;
  const currencyPaddingClass = currencySymbol.length > 1 ? 'pl-14' : 'pl-9';
  
  const [supplyMode, setSupplyMode] = useState<'new' | 'income' | 'expense'>(() => {
    if (!isSupply) return 'new';
    if (initialData?.transactionType === 'income') return 'income';
    if (initialData?.transactionType === 'expense') return 'expense';
    return 'new';
  });

  const lastEarningIdx = [...records].reverse().findIndex(r => r.businessEntryType === 'earning');
  const currentCycleRecords = lastEarningIdx === -1 ? records : records.slice(records.length - lastEarningIdx);
  const isInCycle = currentCycleRecords.some(r => r.businessEntryType === 'capital');
  const currentCapital = currentCycleRecords.find(r => r.businessEntryType === 'capital')?.amount || 0;
  const currentExpenses = currentCycleRecords.filter(r => r.businessEntryType === 'expense').reduce((s,r) => s+r.amount, 0);

  const [businessMode, setBusinessMode] = useState<'expense' | 'earning'>('expense');
  const [cashOnHand, setCashOnHand] = useState('');

  const [dues, setDues] = useState<{ name: string, amount: string, actualAmount: string, date: string, remarks: string, endDate?: string, transactionType?: 'income' | 'expense', supplySource?: any, reference?: string }[]>(() => {
    const today = getTodayStr();
    const initialDate = activeTabType === 'debt' ? addDays(today, 7) : today;
    return [{ name: '', amount: '', actualAmount: '', date: initialDate, remarks: '', endDate: today, transactionType: 'income', supplySource: isProduct ? 'production' : 'general', reference: '' }];
  });
  
  const [contactInfo, setContactInfo] = useState({ facebookId: '', contactNumber: '' });
  const [selectedCountryCode, setSelectedCountryCode] = useState('+63');
  const [bulkCount, setBulkCount] = useState("1");
  const [bulkFrequency, setBulkFrequency] = useState<Frequency>('weekly');
  const [dividerTotal, setDividerTotal] = useState('');
  const [duplicateRefError, setDuplicateRefError] = useState<string | null>(null);

  const draftKey = initialData ? `form_edit_draft_${initialData.id}` : `form_new_draft_${activeTab}`;

  const handleRestricted = () => {
    showToast?.("Restricted by administrator", "restricted");
  };

  const canAddIncoming = useMemo(() => {
    if (isMaster || (!isCashflow && !isSavings)) return true;
    const perms = session?.tabPermissions?.[activeTab];
    if (!perms) return true;
    if (isCashflow) return perms.includes('add_incoming');
    if (isSavings) return perms.includes('add_income');
    return true;
  }, [isMaster, isCashflow, isSavings, session, activeTab]);

  const canAddOutgoing = useMemo(() => {
    if (isMaster || (!isCashflow && !isSavings)) return true;
    const perms = session?.tabPermissions?.[activeTab];
    if (!perms) return true;
    if (isCashflow) return perms.includes('add_outgoing');
    if (isSavings) return perms.includes('add_expense');
    return true;
  }, [isMaster, isCashflow, isSavings, session, activeTab]);

  const canStartCycle = useMemo(() => {
    if (isMaster || !isBusinessTab) return true;
    const perms = session?.tabPermissions?.[activeTab];
    if (!perms) return true;
    return perms.includes('start_cycle');
  }, [isMaster, isBusinessTab, session, activeTab]);

  const canAddExpenses = useMemo(() => {
    if (isMaster || !isBusinessTab) return true;
    const perms = session?.tabPermissions?.[activeTab];
    if (!perms) return true;
    return perms.includes('add_expenses');
  }, [isMaster, isBusinessTab, session, activeTab]);

  const canEndCycle = useMemo(() => {
    if (isMaster || !isBusinessTab) return true;
    const perms = session?.tabPermissions?.[activeTab];
    if (!perms) return true;
    return perms.includes('end_cycle');
  }, [isMaster, isBusinessTab, session, activeTab]);

  const isBusinessBtnDisabled = useMemo(() => {
    if (!isBusiness) return false;
    if (isEdit) return false;
    
    if (!isInCycle) return !canStartCycle;
    if (businessMode === 'expense') return !canAddExpenses;
    if (businessMode === 'earning') return !canEndCycle;
    
    return false;
  }, [isBusiness, isEdit, isInCycle, canStartCycle, businessMode, canAddExpenses, canEndCycle]);

  const canAddInventory = useMemo(() => {
    if (isMaster || !isSupply) return true;
    const perms = session?.tabPermissions?.[activeTab];
    if (!perms) return true;
    if (isProduct) return perms.includes('add_product');
    return perms.includes('register_item');
  }, [isMaster, isSupply, isProduct, session, activeTab]);

  const canReceiveInventory = useMemo(() => {
    if (isMaster || !isSupply) return true;
    const perms = session?.tabPermissions?.[activeTab];
    if (!perms) return true;
    if (isProduct) return perms.includes('receive_product');
    return perms.includes('receive_stock');
  }, [isMaster, isSupply, isProduct, session, activeTab]);

  const canIssueInventory = useMemo(() => {
    if (isMaster || !isSupply) return true;
    const perms = session?.tabPermissions?.[activeTab];
    if (!perms) return true;
    if (isProduct) return perms.includes('issue_product');
    return perms.includes('issue_stock');
  }, [isMaster, isSupply, isProduct, session, activeTab]);

  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.name) setName(parsed.name);
        if (parsed.itemCode) setItemCode(parsed.itemCode);
        if (parsed.price) setPrice(parsed.price);
        if (parsed.minAmount) setMinAmount(parsed.minAmount);
        if (parsed.maxAmount) setMaxAmount(parsed.maxAmount);
        if (parsed.globalRemarks) setGlobalRemarks(parsed.globalRemarks);
        if (parsed.dues) setDues(parsed.dues);
        if (parsed.contactInfo) setContactInfo(parsed.contactInfo);
        if (parsed.selectedCountryCode) setSelectedCountryCode(parsed.selectedCountryCode);
        return;
      } catch (e) {
        console.error("Draft restoration failed", e);
      }
    }

    if (initialData) {
      setName(initialData.name || '');
      setItemCode(initialData.itemCode || '');
      setPrice(initialData.price?.toString() || '');
      setMinAmount(initialData.minAmount?.toString() || '');
      setMaxAmount(initialData.maxAmount?.toString() || '');
      setDues([{ 
        name: initialData.name || '',
        amount: initialData.amount.toString(), 
        actualAmount: initialData.actualAmount?.toString() || initialData.amount.toString(),
        date: initialData.date, 
        remarks: initialData.remarks || '', 
        endDate: initialData.endDate || initialData.date,
        transactionType: initialData.transactionType || 'income',
        supplySource: initialData.supplySource || (isProduct ? 'production' : 'general'),
        reference: initialData.facebookId || ''
      }]);
      
      if (!isSalary && !isBusiness && !isSavings && !isSupply) {
        const fullNumber = initialData.contactNumber || '';
        const detectedCode = COUNTRY_CODES.find(c => fullNumber.startsWith(c.code));
        if (detectedCode) {
          setSelectedCountryCode(detectedCode.code);
          setContactInfo(prev => ({ 
            ...prev, 
            contactNumber: fullNumber.slice(detectedCode.code.length) 
          }));
        } else {
          setContactInfo(prev => ({ ...prev, contactNumber: fullNumber }));
        }
      }
    }
  }, [initialData, isSalary, isBusiness, isSavings, isSupply, draftKey, isProduct]);

  useEffect(() => {
    const draft = { name, itemCode, price, minAmount, maxAmount, globalRemarks, dues, contactInfo, selectedCountryCode };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [name, itemCode, price, minAmount, maxAmount, globalRemarks, dues, contactInfo, selectedCountryCode, draftKey]);

  useEffect(() => {
    if (!isCashflow) return;
    const refs = dues.map(d => d.reference?.trim()).filter(Boolean);
    if (refs.length === 0) {
      setDuplicateRefError(null);
      return;
    }
    const existingRef = records.find(r => r.facebookId && refs.includes(r.facebookId.trim()) && r.id !== initialData?.id);
    if (existingRef) {
      setDuplicateRefError(`Reference "${existingRef.facebookId}" already exists in ${activeTab}.`);
    } else {
      setDuplicateRefError(null);
    }
  }, [dues, records, isCashflow, activeTab, initialData]);

  const clearDraft = () => { localStorage.removeItem(draftKey); };

  const handlePickContact = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const permission = await Contacts.requestPermissions();
        if (permission.contacts !== 'granted') {
           showToast?.("Contact permission required.", "error");
           return;
        }
        const result = await Contacts.pickContact({ projection: { name: true, phones: true } });
        if (result && result.contact) {
           const c = result.contact;
           if (!name && c.displayName) setName(c.displayName);
           if (c.phones && c.phones.length > 0) processContactNumber(c.phones[0].number || '');
        }
      } catch (e) { console.error("Native pick error:", e); }
      return;
    }
    
    // Web Fallback: Try Navigator Contacts API if available, else alert
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: false };
        const contacts = await (navigator as any).contacts.select(props, opts);
        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          if (!name && contact.name && contact.name.length > 0) setName(contact.name[0]);
          if (contact.tel && contact.tel.length > 0) processContactNumber(contact.tel[0]);
        }
      } catch (err) { console.error("Web Contact Picker Error:", err); }
    } else {
      // Simulate/Mock for dev or just inform user
      showToast?.("Contact picker only available on mobile device.", "error");
    }
  };

  const processContactNumber = (rawPhone: string) => {
      let clean = rawPhone.trim();
      const foundCode = COUNTRY_CODES.find(c => clean.startsWith(c.code));
      if (foundCode) {
        setSelectedCountryCode(foundCode.code);
        setContactInfo(prev => ({ ...prev, contactNumber: clean.slice(foundCode.code.length).replace(/\D/g, '') }));
      } else {
        if (clean.startsWith('0')) {
          setSelectedCountryCode('+63');
          setContactInfo(prev => ({ ...prev, contactNumber: clean.slice(1).replace(/\D/g, '') }));
        } else {
          setContactInfo(prev => ({ ...prev, contactNumber: clean.replace(/\D/g, '') }));
        }
      }
  };

  const calculateNextDate = (currentDateStr: string, frequency: Frequency): string => {
    const [year, month, day] = currentDateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    switch (frequency) {
      case 'daily': date.setDate(date.getDate() + 1); break;
      case 'weekly': date.setDate(date.getDate() + 7); break;
      case 'monthly': date.setMonth(date.getMonth() + 1); break;
      case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
    }
    const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleAddDues = () => {
    const targetCount = parseInt(bulkCount) || 1;
    if (targetCount <= dues.length) return;
    const countToAdd = targetCount - dues.length;
    let newDues = [...dues];
    let lastDateStr = newDues[newDues.length - 1].date;
    const lastAmount = newDues[newDues.length - 1].amount;
    for (let i = 0; i < countToAdd; i++) {
      const nextDate = calculateNextDate(lastDateStr, bulkFrequency);
      newDues.push({ name: '', amount: lastAmount, actualAmount: lastAmount, date: nextDate, remarks: '', endDate: nextDate, reference: '', supplySource: isProduct ? 'production' : 'general' });
      lastDateStr = nextDate;
    }
    if (newDues.length > 1) { 
      newDues = newDues.map((due, i) => { 
        if (isSavings) return { ...due, remarks: globalRemarks };
        const indicator = `${i + 1}${getOrdinal(i + 1)} due`; 
        return { ...due, remarks: globalRemarks ? `${globalRemarks} (${indicator})` : indicator }; 
      }); 
    }
    setDues(newDues);
  };

  const handleAddSavingsBatch = () => {
    const lastDue = dues[dues.length - 1];
    setDues([...dues, { name: '', amount: '', actualAmount: '', date: lastDue.date, remarks: '', endDate: lastDue.date, transactionType: lastDue.transactionType || 'income', reference: '', supplySource: isProduct ? 'production' : 'general' }]);
  };

  const handleRemoveSavingsBatch = (idx: number) => {
    if (dues.length <= 1) return;
    setDues(dues.filter((_, i) => i !== idx));
  };

  const handleDivideTotal = () => {
    const total = parseFloat(dividerTotal); 
    const count = parseInt(bulkCount);
    if (isNaN(total) || isNaN(count) || count < 1) return;
    const baseAmount = Math.floor(total / count);
    const remainder = total - (baseAmount * count);
    const newDues: typeof dues = []; 
    let currentDate = dues[0].date;
    for (let i = 0; i < count; i++) {
      let amountVal = baseAmount;
      if (i === count - 1) amountVal += remainder;
      const amountStr = Number.isInteger(amountVal) ? amountVal.toString() : parseFloat(amountVal.toFixed(2)).toString();
      const indicator = (count > 1 && !isSavings) ? ` (${i + 1}${getOrdinal(i + 1)} due)` : "";
      newDues.push({ name: '', amount: amountStr, actualAmount: amountStr, date: currentDate, remarks: globalRemarks ? `${globalRemarks}${indicator}`.trim() : indicator, endDate: currentDate, reference: "", supplySource: isProduct ? 'production' : 'general' });
      currentDate = calculateNextDate(currentDate, bulkFrequency);
    }
    setDues(newDues); 
    setDividerTotal('');
  };

  const handleSubmitInternal = (type?: 'income' | 'expense' | 'default') => {
    if (duplicateRefError) return;
    const firstDue = dues[0]; if (!firstDue.amount && !isBusiness && !isSavings) return;
    if (isBusiness && businessMode === 'earning' && !cashOnHand) return;
    if (isSavings && dues.length > 1 && !batchSummary && type) {
      const items = dues.map(d => ({ name: d.name || d.remarks || name || "Unnamed Fund", amount: Number(d.amount) || 0, actualAmount: type === 'expense' ? (Number(d.actualAmount) || Number(d.amount) || 0) : undefined }));
      const total = items.reduce((s, i) => s + i.amount, 0);
      setBatchSummary({ items, type, total });
      return;
    }
    let finalRecords: any[] = [];
    if (isBusiness) {
      if (!isInCycle) finalRecords = [{ name: "Initial Capital", amount: Number(firstDue.amount), date: getTodayStr(), remarks: firstDue.remarks || "Cycle started", businessEntryType: 'capital' }];
      else { if (businessMode === 'expense') finalRecords = [{ name: "Business Expense", amount: Number(firstDue.amount), date: getTodayStr(), remarks: firstDue.remarks || "Operating expense", businessEntryType: 'expense' }]; else { const net = Number(cashOnHand) - (currentCapital + currentExpenses); finalRecords = [{ name: "Finalized Earning", amount: net, date: getTodayStr(), remarks: `Cycle finalized. Total Cash: ${formatCurrency(Number(cashOnHand), baseCurrency)}. Net: ${formatCurrency(net, baseCurrency)}`, businessEntryType: 'earning' }]; } }
    } else {
      const finalTransactionType = type === 'default' ? undefined : (type || firstDue.transactionType);
      const finalContactNumber = (!isSalary && !isBusiness && !isSavings && !isSupply) && contactInfo.contactNumber ? `${selectedCountryCode}${contactInfo.contactNumber}` : '';
      
      // Captured signature metadata to preserve during edit
      const signatureMetadata = isEdit ? {
        signature: initialData?.signature,
        signatureDate: initialData?.signatureDate,
        signerAddress: initialData?.signerAddress,
        signerName: initialData?.signerName
      } : {};

      finalRecords = dues.map(due => {
        let finalName = name;
        if (isSavings) finalName = due.name || due.remarks || name || "Fund Item";
        else if (isSupply && supplyMode !== 'new') finalName = due.name || name;
        else if (isSupply) finalName = name || due.name;
        else if (isCashflow) finalName = due.reference || due.remarks || "Transaction";
        else if (isSalary) finalName = "Salary Payment";
        
        return { 
          ...signatureMetadata,
          name: finalName || "Unnamed Entry", 
          amount: Number(due.amount), 
          price: isSupply ? (Number(price) || undefined) : undefined, 
          itemCode: isSupply ? itemCode : undefined, 
          minAmount: (isSupply && minAmount) ? Number(minAmount) : undefined, 
          maxAmount: (isSupply && maxAmount) ? Number(maxAmount) : undefined, 
          actualAmount: finalTransactionType === 'expense' && isSavings ? (Number(due.actualAmount) || Number(due.amount)) : undefined, 
          date: due.date, 
          endDate: due.endDate || due.date, 
          remarks: due.remarks || "", 
          facebookId: isCashflow ? (due.reference || "") : (contactInfo.facebookId || ""), 
          contactNumber: finalContactNumber, 
          transactionType: finalTransactionType, 
          supplySource: due.supplySource || (isProduct ? 'production' : 'general'), 
          id: isEdit ? initialData?.id : '', 
          status: isEdit ? initialData?.status : 'active', 
          isSupplyTransaction: isSupply && supplyMode !== 'new' 
        };
      });
    }
    clearDraft(); onSubmit(finalRecords.length > 1 ? finalRecords : finalRecords[0], isEdit);
    setBatchSummary(null);
  };

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!isCashflow && !isSavings && !isSupply) {
      if (!isEdit && !isBusinessTab && isSalary && activeTabType === 'salary') { handleSubmitInternal(); return; }
      if (isBusiness && !isEdit) {
        if (!isInCycle && !canStartCycle) { handleRestricted(); return; }
        if (isInCycle && businessMode === 'expense' && !canAddExpenses) { handleRestricted(); return; }
        if (isInCycle && businessMode === 'earning' && !canEndCycle) { handleRestricted(); return; }
      }
      handleSubmitInternal(); 
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget; target.style.height = 'auto'; target.style.height = `${Math.max(44, target.scrollHeight)}px`;
  };

  const supplyUniqueItems = useMemo(() => {
    if (!isSupply) return [];
    const items: { name: string, code?: string, qty: number }[] = [];
    const names = new Set<string>();
    records.forEach(r => { 
      if (r.name && !names.has(r.name.toLowerCase().trim())) { 
        names.add(r.name.toLowerCase().trim());
        items.push({ name: r.name, code: r.itemCode, qty: r.amount });
      } 
    });
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [records, isSupply]);

  const filteredSearchItems = useMemo(() => {
    const q = itemSearchQuery.toLowerCase().trim();
    if (!q) return supplyUniqueItems;
    return supplyUniqueItems.filter(item => 
      item.name.toLowerCase().includes(q) || (item.code && item.code.toLowerCase().includes(q))
    );
  }, [supplyUniqueItems, itemSearchQuery]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4 safe-bottom animate-in fade-in duration-200`}>
      <div className={`w-full max-w-[500px] bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto no-scrollbar`}>
        <div className={`sticky top-0 bg-white/95 px-6 py-4 flex justify-between items-center border-b border-slate-50 z-10`}>
          <div>
            <h2 className={`text-lg font-black text-slate-900 leading-tight`}>
              {initialData?.id ? 'Edit Entry' : isBusiness ? (isInCycle ? 'Track Business' : 'Start new cycle') : `New ${isRent ? 'Rental' : isCashflow ? 'Flow' : isSalary ? 'Salary' : isSavings ? 'Savings Item' : isSupply ? (supplyMode === 'income' ? (activeTabType === 'product' ? 'Product Received' : 'Stock Received') : supplyMode === 'expense' ? (activeTabType === 'product' ? 'Product Issued' : 'Stock Issued') : (activeTabType === 'product' ? 'Product Item' : 'Supply Item')) : 'Debt'}`}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Section: {activeTab}</p>
          </div>
          <button onClick={onClose} className={`p-2 bg-slate-100 text-slate-400 rounded-full active:scale-90 transition-transform`}><CloseIcon /></button>
        </div>

        {isSupply && !isEdit && (
          <div className="px-5 pt-4">
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
              <button onClick={() => { setSupplyMode('new'); const nd = [...dues]; nd[0].supplySource = isProduct ? 'production' : 'general'; setDues(nd); }} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${supplyMode === 'new' ? `bg-white shadow-sm text-blue-600` : 'text-slate-400'}`}>New {activeTabType === 'product' ? 'Product' : 'Item'}</button>
              <button onClick={() => { setSupplyMode('income'); const nd = [...dues]; nd[0].supplySource = isProduct ? 'production' : 'general'; setDues(nd); }} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${supplyMode === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Incoming</button>
              <button onClick={() => { setSupplyMode('expense'); const nd = [...dues]; nd[0].supplySource = isProduct ? 'sales' : 'general'; setDues(nd); }} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${supplyMode === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>Outgoing</button>
            </div>
          </div>
        )}

        {isBusiness && isInCycle && !isEdit && (
          <div className="px-5 pt-4">
             <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                <button type="button" onClick={() => setBusinessMode('expense')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${businessMode === 'expense' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400'}`}>Add Expense</button>
                <button type="button" onClick={() => setBusinessMode('earning')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${businessMode === 'earning' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>End Cycle</button>
             </div>
             <div className="mt-2 px-1 text-center"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{businessMode === 'expense' ? 'Record operational costs' : 'Calculate net profit from current cycle'}</p></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`p-5 space-y-4`}>
          {isSavings && (
             <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-1">Entry Month</label>
                <div className="relative">
                  <select className="w-full py-4 px-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 text-sm outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 shadow-inner appearance-none" value={new Date(dues[0].date).getMonth()} onChange={e => { const nd = dues.map(d => { const dObj = new Date(d.date); dObj.setMonth(parseInt(e.target.value)); return { ...d, date: dObj.toISOString().split('T')[0], endDate: dObj.toISOString().split('T')[0] }; }); setDues(nd); }}>{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></div>
                </div>
             </div>
          )}

          {!isCashflow && !isSalary && !isBusiness && !isSavings && (supplyMode === 'new' || isEdit) && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1`}>{isSupply ? (activeTabType === 'product' ? 'Product Name' : 'Item Name') : 'Account Name'}</label>
                <input type="text" required placeholder={isSupply ? (activeTabType === 'product' ? "Product Name" : "Item Name") : "Name"} className={`w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner`} value={name} onChange={e => setName(e.target.value)} />
              </div>
              {isSupply && (
                <>
                  {activeTabType === 'product' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className={`block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1`}>Product Code</label>
                        <input type="text" placeholder="e.g. SK-001" className={`w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner`} value={itemCode} onChange={e => setItemCode(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`block text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1`}>Price per Item ({baseCurrency})</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">{currencySymbol}</span>
                          <input type="number" placeholder="0.00" className={`w-full p-3.5 ${currencyPaddingClass} text-sm bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner`} value={price} onChange={e => setPrice(e.target.value)} onFocus={(e) => e.target.select()} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Qty</label>
                      <input type="number" placeholder="Min" className={`w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner`} value={minAmount} onChange={e => setMinAmount(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Qty</label>
                      <input type="number" placeholder="Max" className={`w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner`} value={maxAmount} onChange={e => setMaxAmount(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            {dues.map((due, idx) => (
              <div key={idx} className={`p-4 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-3 relative group shadow-sm`}>
                {isSavings && idx > 0 && (
                   <button type="button" onClick={() => handleRemoveSavingsBatch(idx)} className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"><TrashIcon size={12} /></button>
                )}
                {isBusiness && isInCycle && businessMode === 'earning' ? (
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                       <div className="flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Initial Capital</span><span className="font-bold text-slate-900 text-sm">{formatCurrency(currentCapital, baseCurrency)}</span></div>
                       <div className="flex justify-between items-center"><span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Total Expenses</span><span className="font-bold text-rose-600 text-sm">{formatCurrency(currentExpenses, baseCurrency)}</span></div>
                       <div className="h-px bg-slate-100 my-1"></div>
                       <div className="flex justify-between items-center"><span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">Breakeven Target</span><span className="font-black text-slate-900 text-base">{formatCurrency(currentCapital + currentExpenses, baseCurrency)}</span></div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Cash on Hand ({baseCurrency})</label>
                       <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-lg">{currencySymbol}</span>
                         <input type="number" required placeholder={`e.g. 15000`} className={`w-full ${currencyPaddingClass} pr-4 py-5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl font-black text-slate-900 text-xl outline-none shadow-inner focus:ring-4 focus:ring-emerald-500/10 transition-all`} value={cashOnHand} onChange={e => setCashOnHand(e.target.value)} onFocus={(e) => e.target.select()} autoFocus />
                       </div>
                    </div>
                  </div>
                ) : isSalary ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-amber-500 uppercase tracking-widest ml-1">Amount ({baseCurrency})</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-sm">{currencySymbol}</span>
                        <input type="number" required placeholder="Salary Amount" className={`w-full ${currencyPaddingClass} pr-4 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`} value={due.amount} onChange={e => { const nd = [...dues]; nd[idx].amount = e.target.value; setDues(nd); }} onFocus={(e) => e.target.select()} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label><input type="date" required className="w-full py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" value={due.date} onChange={e => { const nd = [...dues]; nd[idx].date = e.target.value; setDues(nd); }} /></div>
                      <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label><input type="date" required className="w-full py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" value={due.endDate} onChange={e => { const nd = [...dues]; nd[idx].endDate = e.target.value; setDues(nd); }} /></div>
                    </div>
                  </div>
                ) : isSavings ? (
                   <div className="space-y-3">
                      <div className="grid grid-cols-[1fr_100px] gap-2">
                         <div className="space-y-1">
                            <label className="text-[8px] font-black text-blue-500 uppercase tracking-widest ml-1">Details</label>
                            <input type="text" placeholder="e.g. Grocery" className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 text-sm outline-none shadow-sm" value={due.name} onChange={e => { const nd = [...dues]; nd[idx].name = e.target.value; setDues(nd); }} />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ({baseCurrency})</label>
                            <div className="relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{currencySymbol}</span>
                               <input type="number" placeholder="0" className={`w-full ${currencyPaddingClass} pr-2 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm outline-none shadow-sm`} value={due.amount} onChange={e => { const nd = [...dues]; nd[idx].amount = e.target.value; nd[idx].actualAmount = e.target.value; setDues(nd); }} onFocus={(e) => e.target.select()} />
                            </div>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                         <textarea placeholder="Additional notes..." rows={1} className="w-full bg-white border border-slate-200 rounded-2xl font-semibold text-slate-700 outline-none p-3.5 text-sm min-h-[44px] overflow-hidden resize-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" value={due.remarks} onInput={handleTextareaInput} onChange={e => { const nd = [...dues]; nd[idx].remarks = e.target.value; setDues(nd); }} />
                      </div>
                   </div>
                ) : (
                  <div className="space-y-3">
                    {isBusiness && !isInCycle && (
                      <div className="space-y-1.5"><label className="text-[9px] font-black text-violet-500 uppercase tracking-widest ml-1">Cycle Description</label><input type="text" required placeholder="e.g. New Batch Order" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-[11px] outline-none shadow-sm" value={due.remarks} onChange={e => { const nd = [...dues]; nd[idx].remarks = e.target.value; setDues(nd); }} /></div>
                    )}
                    <div className="space-y-3">
                      {isSupply && !isEdit && supplyMode !== 'new' && (
                        <div className="space-y-1.5">
                          <label className={`text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1`}>Select {activeTabType === 'product' ? 'Product' : 'Item'}</label>
                          <div className="flex gap-2">
                             <select className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none shadow-sm" value={due.name} onChange={e => { const nd = [...dues]; nd[idx].name = e.target.value; setDues(nd); }}>
                               <option value="">-- Choose {activeTabType === 'product' ? 'Product' : 'Stock'} Item --</option>
                               {supplyUniqueItems.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
                             </select>
                             <button type="button" onClick={() => setIsItemSearchOpen(true)} className="p-3.5 bg-blue-600 text-white rounded-xl shadow-lg active:scale-90 transition-all flex items-center justify-center shrink-0">
                               <SearchIcon />
                             </button>
                          </div>
                        </div>
                      )}

                      {isSupply && !isEdit && supplyMode !== 'new' && (
                        <div className="space-y-1.5">
                           <label className={`text-[9px] font-black ${supplyMode === 'income' ? 'text-emerald-500' : 'text-rose-500'} uppercase tracking-widest ml-1`}>
                             {supplyMode === 'income' ? 'Incoming Source' : 'Outgoing Reason'}
                           </label>
                           {activeTabType === 'product' ? (
                             <div className="flex flex-wrap gap-1.5 px-1">
                               {(supplyMode === 'income' ? PRODUCT_INCOMING_SOURCES : PRODUCT_OUTGOING_SOURCES).map(source => (
                                 <button key={source} type="button" onClick={() => { const nd = [...dues]; nd[idx].supplySource = source; setDues(nd); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border ${due.supplySource === source ? (supplyMode === 'income' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500') + ' shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>{source}</button>
                               ))}
                             </div>
                           ) : (
                             <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 text-center">
                               {supplyMode === 'income' ? 'Stock Entry' : 'Stock Usage'}
                             </div>
                           )}
                        </div>
                      )}

                      <div className={`grid ${isRent ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                        <div className="space-y-1.5">
                          <label className={`text-[9px] font-black ${isBusiness ? 'text-violet-500' : isProduct ? 'text-blue-500' : isSupply ? 'text-cyan-500' : 'text-blue-500'} uppercase tracking-widest ml-1`}>{isSupply ? 'Quantity' : `Amount (${baseCurrency})`}</label>
                          <div className="relative">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isBusiness ? 'text-violet-600' : isProduct ? 'text-blue-600' : isSupply ? 'text-cyan-600' : 'text-blue-600'} font-bold text-sm`}>{isSupply ? '#' : currencySymbol}</span>
                            <input type="number" required placeholder="0" className={`w-full ${currencyPaddingClass} pr-2 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`} value={due.amount} onChange={e => { const nd = [...dues]; nd[idx].amount = e.target.value; setDues(nd); }} onFocus={(e) => e.target.select()} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRent ? 'Start' : 'Date'}</label>
                          <input type="date" required className={`w-full py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center ${isRent ? 'text-[11px]' : 'text-xs'} outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`} value={due.date} onChange={e => { const nd = [...dues]; nd[idx].date = e.target.value; setDues(nd); }} />
                        </div>
                        {isRent && (<div className="space-y-1.5"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">End</label><input type="date" required className="w-full py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-center text-[11px] outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={due.endDate} onChange={e => { const nd = [...dues]; nd[idx].endDate = e.target.value; setDues(nd); }} /></div>)}
                      </div>
                      
                      {isCashflow && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">Reference Number / Code</label>
                          <div className="relative">
                            <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${duplicateRefError ? 'text-rose-500' : 'text-slate-400'}`}><HashIcon /></span>
                            <input type="text" placeholder="e.g. 50370584..." className={`w-full pl-10 pr-4 py-3.5 bg-white border ${duplicateRefError ? 'border-rose-500 bg-rose-50' : 'border-slate-200'} rounded-xl font-bold text-slate-800 text-sm outline-none shadow-sm focus:ring-2 ${duplicateRefError ? 'focus:ring-rose-500' : 'focus:ring-blue-500'}`} value={due.reference} onChange={e => { const nd = [...dues]; nd[idx].reference = e.target.value; setDues(nd); }} />
                          </div>
                          {duplicateRefError && <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 px-1 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircleIcon /> {duplicateRefError}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {(!isBusiness || (isBusiness && isInCycle && businessMode === 'expense')) && !isSavings && (
                  <textarea placeholder={isSalary ? "Salary details..." : isBusiness ? "Details..." : isCashflow ? "Notes (Optional)" : isSupply ? "Remarks / Notes" : "Remarks"} rows={1} className="w-full bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none p-3.5 text-sm min-h-[44px] overflow-hidden resize-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" value={due.remarks} onInput={handleTextareaInput} onChange={e => { const nd = [...dues]; nd[idx].remarks = e.target.value; setDues(nd); }} />
                )}
              </div>
            ))}
          </div>

          {isSavings && !isEdit && (<div className="px-1 pt-1"><button type="button" onClick={handleAddSavingsBatch} className="w-full py-4 bg-white border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm hover:border-blue-300 hover:text-blue-500"><PlusIcon /> Add another batch</button></div>)}
          {isDebt && !initialData && (
            <div className="space-y-3 bg-blue-50/50 border border-blue-100 rounded-[2rem] p-4 shadow-inner">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Installment Plan</span>
                <div className="flex items-center gap-2">
                  <input type="number" className="w-10 p-2 text-center text-sm font-black text-blue-700 bg-white border border-blue-200 rounded-xl outline-none shadow-sm" value={bulkCount} onChange={e => setBulkCount(e.target.value)} min="1" onFocus={(e) => e.target.select()} />
                  <select className="p-2 bg-white border border-blue-200 text-xs font-black text-blue-700 rounded-xl outline-none uppercase tracking-tighter shadow-sm" value={bulkFrequency} onChange={e => setBulkFrequency(e.target.value as Frequency)}><option value="weekly">weeks</option><option value="daily">days</option><option value="monthly">months</option></select>
                  <button type="button" onClick={handleAddDues} className="p-2 bg-blue-600 text-white rounded-xl active:scale-95 shadow-md flex items-center justify-center"><PlusIcon /></button>
                </div>
              </div>
              <div className="pt-3 border-t border-blue-100 flex items-center gap-2.5">
                <div className="relative flex-1"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 font-black text-[11px]">{currencySymbol}</span><input type="number" placeholder={`Total ${baseCurrency} to divide...`} className={`w-full ${currencyPaddingClass} pr-3 py-2.5 bg-white border border-blue-200 rounded-xl text-[12px] font-bold text-slate-800 outline-none shadow-sm focus:ring-2 focus:ring-blue-500`} value={dividerTotal} onChange={e => setDividerTotal(e.target.value)} onFocus={(e) => e.target.select()} /></div>
                <button type="button" onClick={handleDivideTotal} className="px-3 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"><CalculatorIcon /> Divide</button>
              </div>
            </div>
          )}
          {(isDebt || isRent) && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-1"><div className="h-px flex-1 bg-slate-100" /><span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5"><ContactIconSmall /> Contact Details</span><div className="h-px flex-1 bg-slate-100" /></div>
              <div className="space-y-2">
                <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"><FacebookIcon /></span><input type="text" placeholder="FB ID / Link" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs outline-none" value={contactInfo.facebookId} onChange={e => setContactInfo({ ...contactInfo, facebookId: e.target.value })} /></div>
                <div className="flex gap-2">
                  <select className="bg-slate-50 border border-slate-200 rounded-2xl px-2.5 font-bold text-slate-800 text-[10px] outline-none" value={selectedCountryCode} onChange={e => setSelectedCountryCode(e.target.value)}>{COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select>
                  <div className="flex-1 relative">
                    <input type="tel" placeholder="Phone Number" className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs outline-none" value={contactInfo.contactNumber} onChange={e => setContactInfo({ ...contactInfo, contactNumber: e.target.value.replace(/\D/g, '') })} />
                    <button type="button" onClick={handlePickContact} title="Import from phone contacts" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 bg-white border border-blue-100 rounded-xl shadow-sm active:scale-90 transition-transform"><UserPlusIcon /></button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {(isCashflow || isSavings || isSupply) ? (
            isEdit ? (<button type="button" disabled={!!duplicateRefError} onClick={() => handleSubmitInternal()} className={`w-full py-4.5 ${isSavings ? 'bg-amber-600' : isProduct ? 'bg-blue-600' : isSupply ? 'bg-cyan-600' : 'bg-blue-600'} ${duplicateRefError ? 'opacity-50 cursor-not-allowed bg-slate-400' : ''} text-white font-black rounded-[2rem] shadow-xl active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] min-h-[60px]`}>Update Entry</button>) : (
              <div className="flex flex-col gap-4 pt-1">
                {isSupply && supplyMode === 'new' && (<button type="button" onClick={() => canAddInventory ? handleSubmitInternal('default') : handleRestricted()} className={`w-full py-6 bg-gradient-to-r ${isProduct ? 'from-blue-600 to-indigo-600' : 'from-cyan-600 to-blue-600'} text-white font-black rounded-[2.5rem] shadow-[0_12px_30px_rgba(37,99,235,0.3)] active:scale-95 transition-all text-sm uppercase tracking-[0.2em] min-h-[70px] ${!canAddInventory ? 'opacity-50 grayscale' : ''}`}>Register New {activeTabType === 'product' ? 'Product' : 'Stock Item'}</button>)}
                {isSupply && supplyMode === 'income' && (<button type="button" disabled={!dues[0].name} onClick={() => (!canReceiveInventory && dues[0].name) ? handleRestricted() : handleSubmitInternal('income')} className={`w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-[2.5rem] shadow-[0_12px_30px_rgba(5,150,105,0.3)] active:scale-95 transition-all text-sm uppercase tracking-[0.2em] min-h-[70px] ${(!dues[0].name || !canReceiveInventory) ? 'opacity-50 grayscale' : ''} ${!dues[0].name ? 'cursor-not-allowed' : ''}`}>Receive Incoming {activeTabType === 'product' ? 'Product' : 'Stock'}</button>)}
                {isSupply && supplyMode === 'expense' && (<button type="button" disabled={!dues[0].name} onClick={() => (!canIssueInventory && dues[0].name) ? handleRestricted() : handleSubmitInternal('expense')} className={`w-full py-6 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black rounded-[2.5rem] shadow-[0_12px_30px_rgba(225,29,72,0.3)] active:scale-95 transition-all text-sm uppercase tracking-[0.2em] min-h-[70px] ${(!dues[0].name || !canIssueInventory) ? 'opacity-50 grayscale' : ''} ${!dues[0].name ? 'cursor-not-allowed' : ''}`}>Issue {activeTabType === 'product' ? 'Product' : 'Stock'} Quantity</button>)}
                {!isSupply && (
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => (!canAddIncoming) ? handleRestricted() : handleSubmitInternal('income')} disabled={!!duplicateRefError} className={`py-4 bg-emerald-600 ${duplicateRefError || !canAddIncoming ? 'opacity-50' : ''} ${!canAddIncoming ? 'grayscale' : ''} text-white font-black rounded-[2rem] shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest`}>{isSavings ? 'Income' : 'Incoming'}</button>
                    <button type="button" onClick={() => (!canAddOutgoing) ? handleRestricted() : handleSubmitInternal('expense')} disabled={!!duplicateRefError} className={`py-4 bg-rose-600 ${duplicateRefError || !canAddOutgoing ? 'opacity-50' : ''} ${!canAddOutgoing ? 'grayscale' : ''} text-white font-black rounded-[2rem] shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest`}>{isSavings ? 'Planned Expenses' : 'Outgoing'}</button>
                  </div>
                )}
              </div>
            )
          ) : (<button type="submit" className={`w-full py-4.5 ${isSalary ? 'bg-amber-600' : isBusiness ? (businessMode === 'earning' ? 'bg-emerald-600' : (!isInCycle ? 'bg-indigo-600' : 'bg-violet-600')) : 'bg-blue-600'} ${isBusinessBtnDisabled ? 'opacity-50 grayscale' : ''} text-white font-black rounded-[2rem] shadow-xl active:scale-95 transition-all text-[11px] uppercase tracking-[0.2em] min-h-[60px]`}>{isBusiness ? (businessMode === 'earning' ? 'Finalize Operations' : (!isInCycle ? 'Start Business Cycle' : 'Save Entry')) : 'Save Record Entry'}</button>)}
        </form>
      </div>

      {isItemSearchOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-[70vh] overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 leading-none">Item Finder</h3>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Select from Database</p>
                 </div>
                 <button onClick={() => setIsItemSearchOpen(false)} className="p-2 bg-slate-100 text-slate-400 rounded-full"><CloseIcon /></button>
              </div>
              <div className="px-5 pt-4 shrink-0">
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><SearchIcon size={14} /></div>
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="Search items by name or code..." 
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner"
                      value={itemSearchQuery}
                      onChange={e => setItemSearchQuery(e.target.value)}
                    />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-2">
                 {filteredSearchItems.length === 0 ? (
                    <div className="py-20 text-center space-y-2">
                       <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No matched items</p>
                       <p className="text-slate-400 text-xs italic">Try a different keyword</p>
                    </div>
                 ) : (
                    filteredSearchItems.map(item => (
                       <button 
                         key={item.name}
                         type="button"
                         onClick={() => {
                            const nd = [...dues];
                            nd[0].name = item.name;
                            setDues(nd);
                            setIsItemSearchOpen(false);
                            setItemSearchQuery('');
                         }}
                         className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm active:bg-blue-50 active:scale-[0.98] transition-all group"
                       >
                          <div className="text-left min-w-0 flex-1 pr-2">
                             <p className="text-sm font-black text-slate-800 uppercase truncate group-active:text-blue-700">{item.name}</p>
                             {item.code && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.code}</p>}
                          </div>
                          <div className="shrink-0 text-right">
                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mb-0.5">Stock</p>
                             <p className="text-sm font-black text-slate-700">{item.qty}</p>
                          </div>
                       </button>
                    ))
                 )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                 <button onClick={() => setIsItemSearchOpen(false)} className="w-full py-3 bg-slate-200 text-slate-600 font-black rounded-xl text-[10px] uppercase tracking-widest">Close Finder</button>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
});

export default RecordForm;
