import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DebtRecord, TabType, CurrencyConfig, AppSession, Investor } from '../types';
import { formatCurrency, formatPHP, formatDateDayMonth, formatDateMD, getTodayStr, openFacebook, openMessenger, openSMS } from '../utils';
import { SupplyDetailModal } from './SupplyDetailModal';

interface RecordListProps {
  records: DebtRecord[];
  activeTab: string;
  activeTabType: TabType;
  animatingDeleteId?: string | null;
  highlightedRecordId?: string | null;
  onEdit: (record: DebtRecord) => void;
  onDelete: (id: string, status?: 'finished' | 'cancelled' | 'deleted') => void;
  onRenew: (record: DebtRecord) => void;
  onKeepReuse?: (record: DebtRecord) => void;
  onExtend: (record: DebtRecord) => void;
  onExtendLocal?: (record: DebtRecord) => void;
  onUpdateRecord: (record: DebtRecord) => void;
  onBulkAdd?: (records: DebtRecord[]) => void;
  addedRecordToCopy?: { name: string, tab: string, items: DebtRecord[], type: TabType } | null;
  onDismissCopy?: () => void;
  formatCopyDetails?: (data: any) => string;
  showToast?: (message: string, type?: 'success' | 'error' | 'restricted') => void;
  cashFlowFilterOverride?: 'income' | 'expense';
  onSetCashFlowFilter?: (filter: 'income' | 'expense') => void;
  currencyConfig?: CurrencyConfig;
  scriptUrl?: string;
  allRecords?: Record<string, DebtRecord[]>;
  onAdjustQty?: (record: DebtRecord) => void;
  appPin?: string;
  isMaster?: boolean;
  biometricEnabled?: boolean;
  session?: AppSession | null;
  onLogAction?: (log: DebtRecord, action: 'update' | 'delete', tabName: string) => void;
  onOpenContract?: (record: DebtRecord) => void;
  investors?: Investor[];
  history?: DebtRecord[];
}

type SortOption = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc';
type SupplyFilter = 'all' | 'under' | 'over';

const TrashIcon = ({ size = 16, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const CalendarIcon = ({ size = 12 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const EditIcon = ({ size = 16, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
const Plus7Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14v4"/><path d="M10 16h4"/></svg>;
const SortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-3 3-3-3"/><path d="m15 6-3-3-3 3"/><path d="M12 3v18"/></svg>;
const ContactIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const MessengerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L22 2l-2.1 5.4Z"/><path d="m7.7 12.5 3-2.5 2.3 2.5 3.5-3" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L22 2l-2.1 5.4Z"/></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10.01 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const PiggyBankIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1 .5-1.5 1-2 0-2.5-1.5-4.5-4-4Z"/><path d="M7 14h.01"/><path d="M9 18v-2h6v2"/></svg>;
const XCircleIcon = ({ size = 16, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
const FileTextIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const ClipboardCopyIcon = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2H6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>;
const ArrowUpRightIcon = ({ size = 14 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>;
const ArrowDownRightIcon = ({ size = 14 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>;
const TrendingUpIcon = ({ size = 16, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const CopyIcon = ({ size = 12 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const AlertCircleIcon = ({ size = 12, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" cy="8" x2="12" y2="12"/><line x1="12" cy="16" x2="12.01" y2="16"/></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10.01 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const VerifiedBadgeIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm4.467 4.237a.75.75 0 0 0-1.14-.094l-3.75 5.25a.75.75 0 0 0 1.14.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const RecordList: React.FC<RecordListProps> = ({ 
  records, activeTab, activeTabType, onEdit, onDelete, onRenew, onKeepReuse, onExtend, onUpdateRecord, onBulkAdd,
  animatingDeleteId, highlightedRecordId, addedRecordToCopy, onDismissCopy, formatCopyDetails, showToast,
  cashFlowFilterOverride, onSetCashFlowFilter, currencyConfig, scriptUrl, allRecords, onAdjustQty,
  appPin, isMaster, biometricEnabled, session, onLogAction, onOpenContract, investors = [], history = []
}) => {
  const isRent = activeTabType === 'rent';
  const isCashFlow = activeTabType === 'cashflow';
  const isSalary = activeTabType === 'salary';
  const isBusiness = activeTabType === 'business';
  const isSavings = activeTabType === 'savings';
  const isSupply = activeTabType === 'supply' || activeTabType === 'product';
  const isDebt = activeTabType === 'debt';
  const todayStr = getTodayStr();
  
  const [sortBy, setSortBy] = useState<SortOption>(() => { 
    if (isCashFlow || isSavings || isSupply) return 'date-desc'; 
    return 'date-asc'; 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [supplyFilter, setSupplyFilter] = useState<SupplyFilter>('all');
  const [openActionRecord, setOpenActionRecord] = useState<DebtRecord | null>(null);
  const [supplyDetailRecord, setSupplyDetailRecord] = useState<DebtRecord | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [openContactRecord, setOpenContactRecord] = useState<DebtRecord | null>(null);
  const [remarkRecord, setRemarkRecord] = useState<DebtRecord | null>(null);
  const [loanDetailsPerson, setLoanDetailsPerson] = useState<string | null>(null);
  const [tempRemark, setTempRemark] = useState('');
  const [copyMonthSource, setCopyMonthSource] = useState<{ label: string, month: number, year: number, count: number, income: number, expenses: number } | null>(null);
  const [copyTargetMonth, setCopyTargetMonth] = useState(new Date().getMonth());
  const [copyTargetYear, setCopyTargetYear] = useState(new Date().getFullYear());
  const [showCopyPill, setShowCopyPill] = useState(false);

  const [payingRecord, setPayingRecord] = useState<DebtRecord | null>(null);
  const [actualExpenseInput, setActualExpenseInput] = useState<string>('');

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentCashFlowFilter = cashFlowFilterOverride || 'income';

  const rate = currencyConfig?.useSecondary ? currencyConfig.exchangeRate : 1;
  const currentCurrency = currencyConfig?.useSecondary ? currencyConfig.secondary : (currencyConfig?.primary || 'PHP');

  const verifiedNames = useMemo(() => {
    const names = new Set<string>();
    if (allRecords) {
      Object.values(allRecords).forEach(tabRecords => {
        if (Array.isArray(tabRecords)) {
          tabRecords.forEach(r => {
            if (r.signature && r.name) {
              names.add(r.name.toLowerCase().trim());
            }
          });
        }
      });
    }
    investors.forEach(inv => {
      if (inv.signature && inv.name) {
        names.add(inv.name.toLowerCase().trim());
      }
    });
    history.forEach(h => {
      if (h.signature && h.name) {
        names.add(h.name.toLowerCase().trim());
      }
    });
    return names;
  }, [allRecords, investors, history]);

  const getSafeDate = (dateStr: string) => {
    try {
      if (!dateStr) return new Date();
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  };

  const getSafeMonthYear = (dateStr: string) => {
    try {
      const d = getSafeDate(dateStr);
      return d.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
      return "Unknown Date";
    }
  };

  const smoothScrollTo = (element: HTMLElement, duration: number) => {
    const parent = element.closest('.overflow-y-auto');
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const start = parent.scrollTop;
    const end = start + (elementRect.top - parentRect.top) - (parentRect.height / 2) + (elementRect.height / 2);
    const distance = end - start;
    const startTime = performance.now();
    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easing = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      parent.scrollTop = start + distance * easing;
      if (progress < 1) requestAnimationFrame(scroll);
    };
    requestAnimationFrame(scroll);
  };

  useEffect(() => { 
    if (highlightedRecordId) { 
      const attemptScroll = () => {
        const el = document.getElementById(`record-${highlightedRecordId}`);
        if (el) { 
          smoothScrollTo(el, 1000); 
          return true; 
        }
        return false;
      };
      const scrollRAF = requestAnimationFrame(() => { 
        requestAnimationFrame(() => {
          if (!attemptScroll()) setTimeout(attemptScroll, 200); 
        });
      });
      return () => cancelAnimationFrame(scrollRAF);
    }
  }, [highlightedRecordId]);

  useEffect(() => {
    if (addedRecordToCopy && (addedRecordToCopy.type === 'debt' || addedRecordToCopy.type === 'rent') && addedRecordToCopy.tab === activeTab) {
      setShowCopyPill(true);
    } else {
      setShowCopyPill(false);
    }
  }, [addedRecordToCopy, activeTab]);

  useEffect(() => {
    if (showCopyPill && onDismissCopy) {
      const timer = setTimeout(() => {
        setShowCopyPill(false);
        onDismissCopy();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showCopyPill, onDismissCopy]);

  const personEntryCounts = useMemo(() => { const counts: Record<string, number> = {}; records.forEach(r => { const key = r.name.toLowerCase().trim(); counts[key] = (counts[key] || 0) + 1; }); return counts; }, [records]);
  const getStatusLabel = (dateStr: string) => { if (isRent || isCashFlow || isSalary || isBusiness || isSavings || isSupply) return null; const [y, m, d] = dateStr.split('-').map(Number); const target = new Date(y, m - 1, d); target.setHours(0, 0, 0, 0); const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); if (target.getTime() === today.getTime()) return { text: "due today", classes: "bg-red-600 text-white border-red-700 shadow-sm" }; const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1); if (target.getTime() === tomorrow.getTime()) return { text: "due tomorrow", classes: "bg-amber-100 text-amber-700 border-amber-200" }; if (target.getTime() < today.getTime()) { const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)); return { text: `Overdue ${diffDays}'d`, classes: "bg-red-600 text-white border-red-700 shadow-sm" }; } return null; };
  
  const monthTotals = useMemo(() => {
    const totals: Record<string, { income: number, expenses: number, markedExpenses: number }> = {};
    if (isSalary || isSavings || isSupply) {
      records.forEach(r => {
        const monthYear = getSafeMonthYear(r.date);
        if (!totals[monthYear]) totals[monthYear] = { income: 0, expenses: 0, markedExpenses: 0 };
        if (isSalary) { totals[monthYear].income += r.amount; } 
        else if (isSavings || isSupply) {
          if (r.transactionType === 'income') totals[monthYear].income += r.amount;
          else if (r.transactionType === 'expense') {
            totals[monthYear].expenses += r.amount;
            if (r.status === 'finished') totals[monthYear].markedExpenses += (r.actualAmount ?? r.amount);
          }
        }
      });
    }
    return totals;
  }, [records, isSalary, isSavings, isSupply]);

  const filteredAndSortedRecords = useMemo(() => { 
    const term = searchTerm.toLowerCase().trim(); 
    let indexed = records.map((r, i) => ({ record: r, index: i }));
    if (isCashFlow) indexed = indexed.filter(x => x.record.transactionType === currentCashFlowFilter);
    if (isSupply) {
      if (supplyFilter === 'under') indexed = indexed.filter(x => x.record.minAmount !== undefined && x.record.amount < x.record.minAmount);
      else if (supplyFilter === 'over') indexed = indexed.filter(x => x.record.maxAmount !== undefined && x.record.amount > x.record.maxAmount);
    }
    if (term) { 
      const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]; 
      const shortMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]; 
      indexed = indexed.filter(x => { 
        const r = x.record;
        if (r.name.toLowerCase().includes(term)) return true; 
        if (r.remarks && r.remarks.toLowerCase().includes(term)) return true; 
        if (r.date.includes(term)) return true; 
        if (r.facebookId && r.facebookId.toLowerCase().includes(term)) return true; 
        const monthIndex = months.findIndex(m => m.includes(term)); 
        const shortMonthIndex = shortMonths.findIndex(m => m.includes(term)); 
        const targetMonth = (monthIndex !== -1 ? monthIndex : shortMonthIndex) + 1; 
        if (targetMonth > 0) { const recordMonth = parseInt(r.date.split('-')[1]); if (recordMonth === targetMonth) return true; } 
        return false; 
      }); 
    } 
    indexed.sort((a, b) => { 
      const ra = a.record;
      const rb = b.record;
      if (isSavings || isSupply) {
        const da = getSafeDate(ra.date);
        const db = getSafeDate(rb.date);
        if (da.getFullYear() !== db.getFullYear()) return db.getFullYear() - da.getFullYear();
        if (da.getMonth() !== db.getMonth()) return db.getMonth() - da.getMonth();
        if (ra.transactionType !== rb.transactionType && !isRent) {
           if (ra.transactionType === 'income') return -1;
           if (rb.transactionType === 'income') return 1;
        }
        return ra.date.localeCompare(rb.date);
      }
      if (sortBy === 'date-asc') { const c = ra.date.localeCompare(rb.date); return c !== 0 ? c : a.index - b.index; }
      if (sortBy === 'date-desc') { const c = rb.date.localeCompare(ra.date); return c !== 0 ? c : b.index - a.index; }
      if (sortBy === 'name-asc') { const c = ra.name.localeCompare(rb.name); return c !== 0 ? c : a.index - b.index; }
      if (sortBy === 'name-desc') { const c = ra.name.localeCompare(rb.name); return c !== 0 ? c : b.index - a.index; }
      return 0; 
    });
    return indexed.map(x => x.record);
  }, [records, sortBy, searchTerm, isCashFlow, isSavings, isSupply, currentCashFlowFilter, supplyFilter, isRent]);

  const toggleNameSort = () => setSortBy(prev => prev === 'name-asc' ? 'name-desc' : 'name-asc');
  const toggleDateSort = () => setSortBy(prev => prev === 'date-asc' ? 'date-desc' : 'date-asc');
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, record: DebtRecord) => { if (isSupply) { setSupplyDetailRecord(record); return; } const top = Math.min(window.innerHeight - 340, e.clientY - 40); const left = Math.min(window.innerWidth - 200, Math.max(10, e.clientX - 90)); setMenuPosition({ top, left }); setOpenActionRecord(record); };
  const handleTogglePaid = (e: React.MouseEvent, record: DebtRecord) => { e.stopPropagation(); e.preventDefault(); if (isSavings && record.transactionType === 'expense' && record.status !== 'finished') { setPayingRecord(record); setActualExpenseInput(record.actualAmount?.toString() || record.amount.toString()); return; } const newStatus = record.status === 'finished' ? 'active' : 'finished'; onUpdateRecord({ ...record, status: newStatus }); if (showToast) showToast(newStatus === 'finished' ? 'Marked as Finished' : 'Marked as Active'); };
  const confirmPayment = () => { if (!payingRecord) return; const trimmed = actualExpenseInput.trim(); let finalActual = (payingRecord.actualAmount ?? payingRecord.amount); if (trimmed !== "") { const parsed = Number(trimmed); if (!isNaN(parsed)) finalActual = parsed; } onUpdateRecord({ ...payingRecord, actualAmount: finalActual, status: 'finished' }); if (showToast) showToast(`Marked Paid: ${payingRecord.name}`); setPayingRecord(null); };
  const handleUpdateSupplyQty = (e: React.PointerEvent | React.MouseEvent, record: DebtRecord) => { e.preventDefault(); e.stopPropagation(); if (onAdjustQty) onAdjustQty(record); };
  const handleSaveRemark = () => { if (!remarkRecord) return; onUpdateRecord({ ...remarkRecord, remarks: tempRemark }); setRemarkRecord(null); };
  
  const categorizedLoanSummary = useMemo(() => {
    if (!loanDetailsPerson) return null;
    const personName = loanDetailsPerson.toLowerCase().trim();
    const allItems = records.filter(r => r.name.toLowerCase().trim() === personName).sort((a, b) => a.date.localeCompare(b.date));
    const dueItems = allItems.filter(r => r.date <= todayStr);
    const otherItems = allItems.filter(r => r.date > todayStr);
    const total = allItems.reduce((s, r) => s + r.amount, 0);
    const dueTotal = dueItems.reduce((s, r) => s + r.amount, 0);
    return { dueItems, otherItems, total, dueTotal };
  }, [loanDetailsPerson, records, todayStr]);

  const cleanNumberForIntent = (num: string) => { if (!num) return ''; return num.toString().replace(/\D/g, ''); };
  const handleInitiateMonthCopy = (monthLabel: string) => { const d = new Date(monthLabel); const sourceRecs = records.filter(r => { const rd = new Date(r.date); return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear(); }); const count = sourceRecs.length; const income = sourceRecs.filter(r => r.transactionType === 'income').reduce((s, r) => s + r.amount, 0); const expenses = sourceRecs.filter(r => r.transactionType === 'expense').reduce((s, r) => s + r.amount, 0); setCopyMonthSource({ label: monthLabel, month: d.getMonth(), year: d.getFullYear(), count, income, expenses }); let tm = d.getMonth() + 1; let ty = d.getFullYear(); if (tm > 11) { tm = 0; ty++; } setCopyTargetMonth(tm); setCopyTargetYear(ty); };
  const handleExecuteMonthCopy = () => { if (!copyMonthSource || !onBulkAdd) return; const sourceRecs = records.filter(r => { const d = new Date(r.date); return d.getMonth() === copyMonthSource.month && d.getFullYear() === copyMonthSource.year; }); if (sourceRecs.length === 0) return; const newRecords = sourceRecs.map(r => { const d = new Date(r.date); d.setMonth(copyTargetMonth); d.setFullYear(copyTargetYear); if (d.getMonth() !== copyTargetMonth) d.setDate(0); return { ...r, id: '', date: d.toISOString().split('T')[0], endDate: d.toISOString().split('T')[0], status: 'active' as const, actualAmount: undefined }; }); onBulkAdd(newRecords); setCopyMonthSource(null); if (showToast) showToast(`Duplicated ${newRecords.length} entries to ${MONTHS[copyTargetMonth]} ${copyTargetYear}`); };
  const handleCopyLoanDetails = () => { if (!loanDetailsPerson || !categorizedLoanSummary) return; const { dueItems, otherItems, total } = categorizedLoanSummary; let text = `Loan Details:\n"${activeTab.toUpperCase()}"\n\n"${loanDetailsPerson}"\n\n`; [...dueItems, ...otherItems].forEach(r => { const remarkStr = r.remarks && r.remarks.trim() ? ` (${r.remarks.trim()})` : ''; const amt = formatCurrency(r.amount * rate, currentCurrency); text += `🌸 ${formatDateMD(r.date)} - ${amt}${remarkStr}\n`; }); text += `\nTotal: ${formatCurrency(total * rate, currentCurrency)}\n\n`; text += `Thank you - Lmk`; navigator.clipboard.writeText(text); if (showToast) showToast("Loan details copied!"); };

  const renderRemarks = (record: DebtRecord) => {
    if (!record.remarks) return null;
    return (
      <div className="px-1 pb-1 pt-0.5 mt-1 animate-in fade-in duration-300">
        <div className={`px-2 py-1 rounded-lg max-w-[98%] ${isDebt ? 'bg-gradient-to-r from-yellow-100 via-yellow-50/50 to-transparent shadow-sm border-l-2 border-yellow-300' : 'bg-slate-50 border-l-2 border-slate-200'}`}>
          <p className={`text-[10px] leading-relaxed break-words ${isDebt ? 'text-yellow-900 font-bold italic' : 'text-slate-500 font-medium italic'}`}>
            {!isDebt && <span className="opacity-40 font-bold not-italic mr-1 uppercase text-[8px]">Note:</span>}
            {record.remarks}
          </p>
        </div>
      </div>
    );
  };

  let lastMarkerValue = "";
  let lastTypeInMonth = "";
  const canShowContract = (isDebt || isRent) && scriptUrl && (isMaster || session?.role === 'user');

  return (
    <div className="space-y-4">
      <div className="relative group"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors"><SearchIcon /></div><input type="text" placeholder="Search entries..." className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-slate-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>{searchTerm && <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors"><CloseIcon /></button>}</div>
      
      {isCashFlow && (
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] gap-1 shadow-inner">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSetCashFlowFilter?.('income'); }} className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center justify-center gap-2 ${currentCashFlowFilter === 'income' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-50'}`}><ArrowUpRightIcon size={12} /> Incoming</button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSetCashFlowFilter?.('expense'); }} className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center justify-center gap-2 ${currentCashFlowFilter === 'expense' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-50'}`}><ArrowDownRightIcon size={12} /> Outgoing</button>
        </div>
      )}

      {isSupply && (
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] gap-1 shadow-inner">
          <button onClick={() => setSupplyFilter('all')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${supplyFilter === 'all' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}>All Items</button>
          <button onClick={() => setSupplyFilter('under')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center justify-center gap-2 ${supplyFilter === 'under' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}><AlertCircleIcon size={10} /> Under Stock</button>
          <button onClick={() => setSupplyFilter('over')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all flex items-center justify-center gap-2 ${supplyFilter === 'over' ? 'bg-amber-400 text-black shadow-lg' : 'text-slate-400'}`}><TrendingUpIcon size={10} /> Over Stock</button>
        </div>
      )}

      {!isSavings && !isSupply && (
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1.5">{isCashFlow ? `${currentCashFlowFilter === 'income' ? 'Incoming' : 'Outgoing'} Ledger (${filteredAndSortedRecords.length})` : searchTerm ? `Found ${filteredAndSortedRecords.length} Results` : `${activeTabType.charAt(0).toUpperCase() + activeTabType.slice(1)} Records (${records.length})`}</h3>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={toggleDateSort} className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-all flex items-center gap-1 ${sortBy.includes('date') ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><CalendarIcon /> Date {sortBy === 'date-desc' ? '↓' : '↑'}</button>
            <button onClick={toggleNameSort} className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-all flex items-center gap-1 ${sortBy.includes('name') ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><SortIcon /> Name {sortBy === 'name-desc' ? 'Z-A' : 'A-Z'}</button>
          </div>
        </div>
      )}
      <div className="space-y-2 pb-10">
        {filteredAndSortedRecords.length === 0 ? <div className="py-20 flex flex-col items-center text-center px-6"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 animate-in zoom-in-95 duration-300"><SearchIcon /></div><p className="text-slate-500 font-bold text-sm leading-relaxed italic">{searchTerm ? `No records match "${searchTerm}"` : isCashFlow ? `No ${currentCashFlowFilter} entries yet.` : isSupply ? (supplyFilter === 'under' ? 'No items are currently under stock.' : supplyFilter === 'over' ? 'No items are currently over stock.' : 'Your inventory is empty.') : 'Your list is currently empty.'}</p></div> : (() => {
          return filteredAndSortedRecords.map((record, index) => {
            const isAnimatingDelete = animatingDeleteId === record.id; 
            const isHighlighted = highlightedRecordId === record.id; 
            const isFinalizedEarning = isBusiness && record.businessEntryType === 'earning';
            const isInitialCapital = isBusiness && record.businessEntryType === 'capital';
            const cardBg = isFinalizedEarning ? 'bg-yellow-50 border-yellow-100' : isInitialCapital ? 'bg-[#e6e6e6] border-slate-300' : (isSalary || isBusiness) ? 'bg-white border-slate-100' : (record.date < todayStr && !isRent && !isCashFlow && !isSavings && !isSupply) ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'; 
            const hasContact = !isCashFlow && !isSalary && !isBusiness && !isSavings && !isSupply && (record.facebookId || record.contactNumber); 
            let showMarker = false; let markerLabel = ""; const monthYear = getSafeMonthYear(record.date); 
            if (!isSupply && (isSavings || isSalary || isRent || isDebt || sortBy.includes('date'))) { 
              if (isBusiness) { if (record.businessEntryType === 'capital') { showMarker = true; markerLabel = record.remarks || "Business Cycle"; } } 
              else if (isDebt) { if (record.date !== lastMarkerValue) { showMarker = true; markerLabel = formatDateMD(record.date).toUpperCase(); lastMarkerValue = record.date; } }
              else if (isSalary || isSavings || isRent) { if (monthYear !== lastMarkerValue) { showMarker = true; markerLabel = monthYear; lastMarkerValue = monthYear; lastTypeInMonth = ""; } } 
              else { if (record.date !== lastMarkerValue) { showMarker = true; markerLabel = formatDateDayMonth(record.date).toUpperCase(); lastMarkerValue = record.date; } } 
            } else if (!isSupply && sortBy.includes('name')) { const firstLetter = record.name.charAt(0).toUpperCase(); if (firstLetter !== lastMarkerValue) { showMarker = true; markerLabel = firstLetter; lastMarkerValue = firstLetter; } }
            let showInternalHeader = false; let internalHeaderLabel = ""; const currentType = record.transactionType || "default";
            if (!isSupply && (isSavings || isSupply) && currentType !== lastTypeInMonth) {
              showInternalHeader = true;
              if (record.transactionType === 'income') internalHeaderLabel = isSupply ? "Stock/Funds Received" : "Incoming Funds";
              else if (record.transactionType === 'expense') internalHeaderLabel = isSupply ? "Stock/Funds Used" : "Planned Expenses";
              else internalHeaderLabel = isSupply ? "Registered Items" : "General Entries";
              lastTypeInMonth = currentType;
            }
            const nextRecord = filteredAndSortedRecords[index + 1]; const nextMonthYear = nextRecord ? getSafeMonthYear(nextRecord.date) : null; const isLastOfMonth = !isSupply && (isSavings) && (!nextRecord || nextMonthYear !== monthYear); const isLowStock = isSupply && record.minAmount !== undefined && record.amount < record.minAmount;
            const isVerified = verifiedNames.has(record.name.toLowerCase().trim());
            return (
              <React.Fragment key={record.id}>
                {showMarker && (
                  <div className={`pt-6 pb-2 flex flex-col items-center gap-2 ${isSalary || isSavings || isSupply ? 'animate-in fade-in slide-in-from-top-2 duration-500' : ''}`}>
                    {isSalary || isSavings ? (
                      <div className="w-full flex flex-col items-center gap-3">
                        <div className="w-full flex items-center gap-3"><div className={`h-0.5 flex-1 rounded-full ${isSavings ? 'bg-amber-400' : 'bg-amber-600/30'}`}></div><span className={`text-sm font-black uppercase tracking-[0.4em] leading-none ${isSavings ? 'text-amber-800' : 'text-amber-700'}`}>{markerLabel}</span><div className={`h-0.5 flex-1 rounded-full ${isSavings ? 'bg-amber-400' : 'bg-amber-600/30'}`}></div></div>
                        <div className="flex flex-col items-center gap-1.5">{(isSalary || isSavings) && (<div className={`${isSupply ? 'bg-cyan-600 border-cyan-700 ring-cyan-50' : 'bg-amber-600 border-amber-700 ring-amber-50'} border px-6 py-3 rounded-2xl shadow-xl flex flex-col items-center gap-1 ring-4 relative group`}>{(isSavings) && (<button onClick={() => handleInitiateMonthCopy(markerLabel)} className="absolute -right-3 -top-3 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform opacity-0 group-hover:opacity-100" title="Copy this month's entries to another month"><CopyIcon size={16} /></button>)}<div className="flex items-center gap-3"><span className="text-[10px] font-black text-white uppercase tracking-widest opacity-80 leading-none pt-0.5">{isSavings ? 'Actual Month Savings' : 'Month Total'}</span><span className="text-lg font-black text-white leading-none">{formatCurrency((isSavings ? ((monthTotals[markerLabel]?.income || 0) - (monthTotals[markerLabel]?.markedExpenses || 0)) : (monthTotals[markerLabel]?.income || 0)) * rate, currentCurrency)}</span></div></div>)}</div>
                      </div>
                    ) : (
                      <div className="w-full flex items-center gap-3 px-1"><div className="h-px flex-1 bg-slate-200"></div><span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isBusiness ? 'text-violet-600' : isRent ? 'text-indigo-400' : isDebt ? 'text-blue-500' : 'text-slate-400'}`}>{markerLabel}</span><div className="h-px flex-1 bg-slate-200"></div></div>
                    )}
                  </div>
                )}
                {showInternalHeader && (
                  <div className="flex items-center gap-4 px-2 py-3 mb-1 mt-2 opacity-60"><div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-200 rounded-full"></div><div className="bg-amber-50/30 px-3 py-1.5 rounded-xl border border-amber-100/50 flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${record.transactionType === 'income' ? 'bg-emerald-400' : record.transactionType === 'expense' ? 'bg-rose-400' : 'bg-blue-400'}`}></div><span className="text-[8px] font-black uppercase tracking-[0.1em] text-amber-500/80">{internalHeaderLabel}</span></div><div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-200 rounded-full"></div></div>
                )}
                {(isCashFlow || isSavings || isSupply) ? (
                  <div ref={el => cardRefs.current[record.id] = el} id={`record-${record.id}`} onClick={(e) => handleCardClick(e, record)} className={`bg-white border border-slate-100 p-3 rounded-xl shadow-sm flex flex-col transition-all active:bg-slate-50 relative z-10 ${isAnimatingDelete ? 'animate-trash' : isHighlighted ? 'animate-highlight' : 'animate-in fade-in slide-in-from-right-2 duration-200'} active:scale-[0.98]`}>
                    <div className="flex w-full items-center">
                      {isSavings ? (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                           <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2"><div className={`text-sm font-black tracking-tight leading-none truncate overflow-hidden ${record.status === 'finished' ? 'text-slate-400' : 'text-slate-900'}`}>{record.name || '---'}</div><div className="flex items-center gap-1.5"><span className="bg-slate-50 text-slate-400 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap border border-slate-200/50">{formatDateMD(record.date)}</span>{record.transactionType === 'income' ? (<span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Inflow</span>) : (<span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Expense Plan</span>)}</div></div>
                           <div className="flex items-center gap-3 shrink-0">
                              {record.transactionType === 'income' ? (<div className="flex flex-col items-end"><span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Amount</span><div className={`text-base font-black tracking-tighter text-emerald-600`}>+{formatCurrency(record.amount * rate, currentCurrency)}</div></div>) : (<div className="flex items-center gap-3"><div className="flex flex-col items-end"><span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Planned</span><span className="text-xs font-black text-slate-500 tracking-tight">{formatCurrency(record.amount * rate, currentCurrency)}</span></div><button onClick={(e) => handleTogglePaid(e, record)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${record.status === 'finished' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 shadow-inner'}`}>{record.status === 'finished' ? 'Paid' : 'Pay'}</button>{record.status === 'finished' && (<div className="flex flex-col items-end min-w-[65px] animate-in slide-in-from-right-2 duration-300"><span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Actual</span><span className="text-base font-black text-emerald-600 tracking-tighter">{formatCurrency((record.actualAmount ?? record.amount) * rate, currentCurrency)}</span></div>)}</div>)}
                           </div>
                        </div>
                      ) : isSupply ? (
                        <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
                           <div className="flex flex-col gap-1.5 min-w-0">
                             <div className="flex items-center gap-2 min-w-0"><h3 className="text-sm font-black text-slate-800 truncate uppercase leading-none">{record.name}</h3>{activeTabType === 'product' && record.itemCode && <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">{record.itemCode}</span>}</div>
                             {(record.minAmount != null || record.maxAmount != null) && (<div className="flex items-center gap-2"><span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Min: <span className="text-slate-700">{record.minAmount ?? '---'}</span></span><span className="text-slate-200">/</span><span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Max: <span className="text-slate-700">{record.maxAmount || '∞'}</span></span></div>)}
                             <div className="flex items-center gap-1.5 shrink-0">{isLowStock && (<div className="bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse shadow-sm shadow-rose-50"><AlertCircleIcon size={8} /><span className="text-[7px] font-black uppercase tracking-widest">Low Stock</span></div>)}</div>
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                             {record.price !== undefined && (<div className="flex flex-col items-center justify-center px-3 py-2 bg-emerald-50 border-2 border-emerald-100 rounded-xl"><span className="text-[8px] font-black text-emerald-600 uppercase leading-none mb-1">Price</span><span className="text-sm font-black text-emerald-700 tracking-tighter">{formatCurrency(record.price * rate, currentCurrency)}</span></div>)}
                             <button onClick={(e) => handleUpdateSupplyQty(e, record)} className={`flex flex-col items-center justify-center min-w-[75px] px-3 py-2 rounded-xl border-2 transition-all active:scale-95 shadow-sm ${isLowStock ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}><span className={`text-[8px] font-black uppercase leading-none mb-1 ${isLowStock ? 'text-rose-500' : 'text-slate-500'}`}>Qty Adjust</span><span className={`text-lg font-black leading-none tracking-tighter ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>{record.amount}</span></button>
                           </div>
                        </div>
                      ) : (
                        <><div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 ${record.transactionType === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><ArrowUpRightIcon size={14} /></div><div className="flex-1 grid grid-cols-[1.2fr_0.8fr_2.5fr] items-center gap-2 min-w-0"><div className={`text-base font-black tracking-tighter ${record.transactionType === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{record.transactionType === 'income' ? '+' : '-'}{formatCurrency(record.amount * rate, currentCurrency)}</div><div className="flex justify-start"><span className="bg-slate-100 text-slate-600 text-xs font-black px-2 py-1 rounded-md uppercase tracking-wider whitespace-nowrap border border-slate-200/50">{formatDateMD(record.date)}</span></div><div className={`text-sm font-black tracking-tight leading-none truncate overflow-hidden text-blue-600`}>{record.facebookId || record.remarks || 'No Ref'}</div></div></>
                      )}
                    </div>
                    {renderRemarks(record)}
                  </div>
                ) : (
                  <div ref={el => cardRefs.current[record.id] = el} id={`record-${record.id}`} onClick={(e) => handleCardClick(e, record)} className={`${cardBg} p-2 rounded-xl border shadow-sm flex flex-col transition-all active:scale-[0.98] active:bg-slate-50 relative z-10 ${isAnimatingDelete ? 'animate-trash' : isHighlighted ? 'animate-highlight' : 'animate-in fade-in slide-in-from-right-2 duration-200'}`}>
                    <div className="flex items-center gap-3 px-1 w-full">
                      <div className="flex-1 min-w-0">
                        {isBusiness ? (
                          <div className="flex items-center gap-3 py-1"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-black text-slate-900 text-sm uppercase leading-none">{record.name}</h3><span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${record.businessEntryType === 'capital' ? 'bg-violet-600 text-white' : record.businessEntryType === 'earning' ? (record.amount < 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white') : 'bg-rose-100 text-rose-600'}`}>{record.businessEntryType}</span></div><div className="flex items-center gap-1 text-slate-400 text-xs font-bold"><CalendarIcon size={10} /> {formatDateMD(record.date)}</div></div><div className="text-right shrink-0"><p className={`text-base font-black tracking-tighter ${record.businessEntryType === 'earning' ? (record.amount < 0 ? 'text-rose-600' : 'text-emerald-600') : record.businessEntryType === 'expense' ? 'text-rose-600' : 'text-violet-600'}`}>{formatCurrency(record.amount * rate, currentCurrency)}</p></div></div>
                        ) : isSalary ? (
                          <div className="flex items-center gap-3 py-1"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-black text-slate-900 text-sm uppercase leading-none">Salary Payment</h3></div><div className="flex items-center gap-1 text-amber-600 text-xs font-bold"><CalendarIcon size={10} /> {formatDateMD(record.date)} to {formatDateMD(record.endDate || record.date)}</div></div><div className="text-right shrink-0"><p className="text-base font-black tracking-tighter text-amber-600">{formatCurrency(record.amount * rate, currentCurrency)}</p></div></div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1"><h3 className="font-black text-slate-900 text-sm truncate uppercase leading-none flex items-center gap-1">{record.name}{isVerified && <span title="Verified Client (Signed Contract on file)" className="text-blue-500"><VerifiedBadgeIcon /></span>}</h3>{(isDebt || isRent) && (record.signature ? (<span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-lg text-[8px] font-black border border-emerald-100 flex items-center gap-1 shadow-sm"><CheckBadgeIcon /> SIGNED</span>) : (<span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-lg text-[8px] font-black border border-slate-200 flex items-center gap-1 opacity-70"><FileTextIcon size={10} /> UNSIGNED</span>))}{getStatusLabel(record.date) && <span className={`px-1.5 py-1 rounded-lg text-[8px] font-black uppercase border leading-none ${getStatusLabel(record.date)!.text === 'due today' || getStatusLabel(record.date)!.text.includes('Overdue') ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{getStatusLabel(record.date)!.text}</span>}</div>
                              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold"><CalendarIcon size={10} /> {isRent ? <span className="text-indigo-600 font-black">{formatDateDayMonth(record.date)} to {formatDateDayMonth(record.endDate || record.date) || formatDateDayMonth(record.date)}</span> : <>{formatDateDayMonth(record.date)} {personEntryCounts[record.name.toLowerCase().trim()] > 1 && <span className="ml-1 text-blue-600 font-black lowercase italic">({personEntryCounts[record.name.toLowerCase().trim()] || 0} dues)</span>}</>}</div>
                            </div>
                            <div className="text-right shrink-0"><p className={`text-base font-black tracking-tighter text-slate-900`}>{formatCurrency(record.amount * rate, currentCurrency)}</p></div>
                            {hasContact && <button onClick={(e) => { e.stopPropagation(); setOpenContactRecord(record); }} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg border border-slate-200 active:bg-blue-600 active:text-white transition-colors"><ContactIcon /></button>}
                          </div>
                        )}
                      </div>
                    </div>
                    {renderRemarks(record)}
                  </div>
                )}
                
                {showCopyPill && isHighlighted && addedRecordToCopy && addedRecordToCopy.tab === activeTab && (
                  <div key={`pill-${addedRecordToCopy.items.length}-${addedRecordToCopy.items[0]?.id || 'new'}`} className="py-1 animate-in slide-in-from-top-2 duration-300 z-[100]">
                    <div className="bg-white p-4 rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200 flex items-center justify-between gap-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100"><div className="h-full bg-blue-600 animate-progress-7s origin-left"></div></div>
                        <div className="flex items-center gap-3 min-w-0 pt-0.5">
                           <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><ClipboardCopyIcon size={20} /></div>
                           <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 leading-none mb-1.5">Receipt Ready</p>
                              <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{addedRecordToCopy.name}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                           <button onClick={() => { if (formatCopyDetails) { const text = formatCopyDetails(addedRecordToCopy); navigator.clipboard.writeText(text); showToast?.("Receipt Copied!"); } onDismissCopy?.(); setShowCopyPill(false); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-blue-100">Copy Details</button>
                           <button onClick={() => { onDismissCopy?.(); setShowCopyPill(false); }} className="p-2 text-slate-300 hover:text-slate-500 active:scale-90 transition-all"><CloseIcon /></button>
                        </div>
                    </div>
                  </div>
                )}

                {isLastOfMonth && isSavings && (
                  <div className="mt-4 mb-10 px-2 animate-in fade-in slide-in-from-top-1 duration-700">
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 blur-3xl rounded-full"></div>
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="flex flex-col text-center"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total<br/>Income</span><span className="text-sm font-black text-emerald-600 tracking-tight">{formatCurrency((monthTotals[monthYear]?.income || 0) * rate, currentCurrency)}</span></div>
                        <div className="flex flex-col text-center border-x border-slate-100"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total planned<br/>Expenses</span><span className="text-sm font-black text-slate-700 tracking-tight">{formatCurrency((monthTotals[monthYear]?.expenses || 0) * rate, currentCurrency)}</span></div>
                        <div className="flex flex-col text-center"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">total actual<br/>Expenses</span><span className="text-sm font-black text-rose-600 tracking-tight">{formatCurrency((monthTotals[monthYear]?.markedExpenses || 0) * rate, currentCurrency)}</span></div>
                      </div>
                      <div className="bg-blue-50/40 rounded-2xl p-4 border border-blue-100/50 flex justify-between items-center"><span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total savings in actual</span><span className="text-xl font-black text-blue-800 tracking-tighter">{formatCurrency(((monthTotals[monthYear]?.income || 0) - (monthTotals[monthYear]?.markedExpenses || 0)) * rate, currentCurrency)}</span></div>
                      <div className="mt-4 text-center"><p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">{monthYear} Summary Output</p></div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          });
        })()}
      </div>

      {supplyDetailRecord && createPortal(
        <SupplyDetailModal record={records.find(r => r.id === supplyDetailRecord.id) || supplyDetailRecord} scriptUrl={scriptUrl} allRecords={allRecords} onClose={() => setSupplyDetailRecord(null)} onEdit={(r) => { onEdit(r); setSupplyDetailRecord(null); }} onDelete={(id) => { onDelete(id); setSupplyDetailRecord(null); }} onUpdateRecord={onUpdateRecord} currencyConfig={currencyConfig} activeTabType={activeTabType} activeTabName={activeTab} appPin={appPin} isMaster={isMaster} biometricEnabled={biometricEnabled} session={session} onLogAction={onLogAction} />, document.body
      )}
      {openContactRecord && createPortal(
        <div className="fixed inset-0 z-[3400] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200" onClick={() => setOpenContactRecord(null)}><div className="w-full max-w-xs bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center" onClick={e => e.stopPropagation()}><div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><ContactIcon /></div><h3 className="text-xl font-black text-slate-900 mb-1 truncate">{openContactRecord.name}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Quick Contact Actions</p><div className="space-y-3"><button onClick={() => { openFacebook(openContactRecord.facebookId || ''); setOpenContactRecord(null); }} disabled={!openContactRecord.facebookId} className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${openContactRecord.facebookId ? 'bg-blue-600 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><FacebookIcon /> Facebook Profile</button><button onClick={() => { openMessenger(openContactRecord.facebookId || ''); setOpenContactRecord(null); }} disabled={!openContactRecord.facebookId} className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${openContactRecord.facebookId ? 'bg-sky-500 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><MessengerIcon /> Send Messenger</button><div className="grid grid-cols-3 gap-2"><button onClick={() => { window.open(`tel:${cleanNumberForIntent(openContactRecord.contactNumber || '')}`, '_system'); setOpenContactRecord(null); }} disabled={!openContactRecord.contactNumber} className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${openContactRecord.contactNumber ? 'bg-slate-800 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><PhoneIcon /> Call</button><button onClick={() => { openSMS(openContactRecord.contactNumber || ''); setOpenContactRecord(null); }} disabled={!openContactRecord.contactNumber} className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${openContactRecord.contactNumber ? 'bg-slate-600 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><MessageSquareIcon /> SMS</button><button onClick={() => { window.open(`https://wa.me/${cleanNumberForIntent(openContactRecord.contactNumber || '')}`, '_system'); setOpenContactRecord(null); }} disabled={!openContactRecord.contactNumber} className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${openContactRecord.contactNumber ? 'bg-green-600 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><WhatsAppIcon /> WA</button></div></div><button onClick={() => setOpenContactRecord(null)} className="w-full mt-6 py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Dismiss</button></div></div>, document.body
      )}

      {openActionRecord && createPortal(
        <div className="fixed inset-0 z-[5000] bg-black/5" onClick={() => setOpenActionRecord(null)}>
          <div className="absolute z-[5001] bg-white rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.2)] border border-slate-100 py-2 w-48 overflow-hidden animate-in zoom-in-95 duration-200" style={{ top: menuPosition.top, left: menuPosition.left }} onClick={e => e.stopPropagation()}>
             <div className="px-4 py-2 border-b border-slate-50 mb-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{openActionRecord.name}</p></div>
             {canShowContract && (
                <button onClick={() => { onOpenContract?.(openActionRecord); setOpenActionRecord(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-blue-600 transition-colors text-xs font-bold">
                   <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-lg"><PenIcon /></div> Digital Contract
                </button>
             )}
             {isDebt && personEntryCounts[openActionRecord.name.toLowerCase().trim()] > 0 && (<button onClick={() => { setLoanDetailsPerson(openActionRecord.name); setOpenActionRecord(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-indigo-600 transition-colors text-xs font-bold"><div className="w-6 h-6 flex items-center justify-center bg-indigo-100 rounded-lg"><FileTextIcon size={16} /></div>All Loan Details</button>)}
             {isDebt && (<button onClick={() => { onExtend(openActionRecord); setOpenActionRecord(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-amber-600 transition-colors text-xs font-bold"><div className="w-6 h-6 flex items-center justify-center bg-amber-100 rounded-lg"><Plus7Icon /></div>Extend +7 Days</button>)}
             <button onClick={() => { setRemarkRecord(openActionRecord); setTempRemark(openActionRecord.remarks); setOpenActionRecord(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-600 transition-colors text-xs font-bold"><div className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg"><FileTextIcon size={16} /></div>Edit Remarks</button>
             <button onClick={() => { onEdit(openActionRecord); setOpenActionRecord(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-blue-600 transition-colors text-xs font-bold"><div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-lg"><EditIcon size={14} /></div>Edit Record</button>
             {isRent ? (<><div className="h-px bg-slate-50 my-1" /><button onClick={() => { onDelete(openActionRecord.id, 'cancelled'); setOpenActionRecord(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-rose-600 transition-colors text-xs font-bold"><div className="w-6 h-6 flex items-center justify-center bg-rose-100 rounded-lg"><XCircleIcon size={14} /></div>Cancel Booking</button><button onClick={() => { onDelete(openActionRecord.id, 'finished'); setOpenActionRecord(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-emerald-600 transition-colors text-xs font-bold"><div className="w-6 h-6 flex items-center justify-center bg-emerald-100 rounded-lg"><CheckCircleIcon /></div>Finished Booking</button></>) : (<><div className="h-px bg-slate-50 my-1" /><button onClick={() => { onDelete(openActionRecord.id); setOpenActionRecord(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors text-xs font-bold"><div className="w-6 h-6 flex items-center justify-center bg-red-100 rounded-lg"><TrashIcon size={14} /></div>Delete Record</button></>)}
          </div>
        </div>, document.body
      )}

      {remarkRecord && createPortal(
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setRemarkRecord(null)}><div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}><h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2"><FileTextIcon size={16} /> Update Remark</h3><textarea rows={4} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20" value={tempRemark} onChange={e => setTempRemark(e.target.value)} autoFocus /><div className="flex gap-2 mt-4"><button onClick={handleSaveRemark} className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest active:scale-95 shadow-md shadow-blue-100">Save</button><button onClick={() => setRemarkRecord(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest">Cancel</button></div></div></div>, document.body
      )}

      {loanDetailsPerson && categorizedLoanSummary && createPortal(
        <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setLoanDetailsPerson(null)}>
          <div className="w-full max-sm bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[88vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-50 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-none">{loanDetailsPerson}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">ACTIVE LOAN SUMMARY</p>
              </div>
              <button onClick={() => setLoanDetailsPerson(null)} className="p-2 bg-slate-100 text-slate-400 rounded-full active:scale-90 transition-all"><CloseIcon /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              {/* Due and Already Due Section */}
              {categorizedLoanSummary.dueItems.length > 0 && (
                <div className="bg-rose-50/50 rounded-[2rem] p-5 space-y-3 border border-rose-100/50">
                   <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.15em] text-center mb-1 flex items-center justify-center gap-2">
                     <span className="opacity-40">✨</span> DUE AND ALREADY DUE <span className="opacity-40">✨</span>
                   </p>
                   <div className="space-y-2">
                     {categorizedLoanSummary.dueItems.map((r) => (
                       <div key={r.id} className="bg-white rounded-2xl p-3 flex justify-between items-center shadow-sm border border-rose-100/30">
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-400 uppercase leading-none mb-1">🌸 {formatDateMD(r.date)}</span>
                            <span className="text-sm font-black text-slate-900">{formatCurrency(r.amount * rate, currentCurrency)}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <button onClick={() => { onEdit(r); setLoanDetailsPerson(null); }} className="p-2.5 bg-slate-50 text-rose-400 rounded-xl border border-rose-100/40 active:scale-90 transition-transform"><EditIcon size={14} /></button>
                            <button onClick={() => { onDelete(r.id); setLoanDetailsPerson(null); }} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200/40 active:scale-90 transition-transform"><TrashIcon size={14} /></button>
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="pt-2 flex justify-between items-center px-1">
                      <span className="text-[11px] font-black text-rose-900">Due Total:</span>
                      <span className="text-sm font-black text-rose-900">{formatCurrency(categorizedLoanSummary.dueTotal * rate, currentCurrency)}</span>
                   </div>
                </div>
              )}

              {/* Other Due Entry Section */}
              {categorizedLoanSummary.otherItems.length > 0 && (
                <div className="bg-blue-50/50 rounded-[2rem] p-5 space-y-3 border border-blue-100/50">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] text-center mb-1 flex items-center justify-center gap-2">
                     <span className="opacity-40">✨</span> OTHER DUE ENTRY <span className="opacity-40">✨</span>
                   </p>
                   <div className="space-y-2">
                     {categorizedLoanSummary.otherItems.map((r) => (
                       <div key={r.id} className="bg-white rounded-2xl p-3 flex justify-between items-center shadow-sm border border-blue-100/30">
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-400 uppercase leading-none mb-1">🌸 {formatDateMD(r.date)}</span>
                            <span className="text-sm font-black text-slate-900">{formatCurrency(r.amount * rate, currentCurrency)}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <button onClick={() => { onEdit(r); setLoanDetailsPerson(null); }} className="p-2.5 bg-slate-50 text-blue-400 rounded-xl border border-blue-100/40 active:scale-90 transition-transform"><EditIcon size={14} /></button>
                            <button onClick={() => { onDelete(r.id); setLoanDetailsPerson(null); }} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200/40 active:scale-90 transition-transform"><TrashIcon size={14} /></button>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-white shrink-0 space-y-6">
              <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">OVERALL BALANCE</span>
                <span className="text-2xl font-black text-slate-900">{formatCurrency(categorizedLoanSummary.total * rate, currentCurrency)}</span>
              </div>
              <button 
                onClick={handleCopyLoanDetails}
                className="w-full py-5 bg-[#5244e6] text-white font-black rounded-2xl shadow-[0_12px_24px_rgba(82,68,230,0.25)] active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
              >
                COPY DETAILS
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {payingRecord && createPortal(
         <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setPayingRecord(null)}><div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center" onClick={e => e.stopPropagation()}><div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6"><PiggyBankIcon /></div><h3 className="text-xl font-black text-slate-900 mb-2">Final Payment</h3><p className="text-slate-500 text-xs mb-6 font-semibold leading-relaxed">Enter the actual amount paid for:<br/><span className="text-blue-600 uppercase">"{payingRecord.name}"</span></p><div className="relative mb-6"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₱</span><input type="number" className="w-full p-4 pl-8 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 text-center text-xl outline-none focus:border-amber-50 transition-all shadow-inner" value={actualExpenseInput} onChange={e => setActualExpenseInput(e.target.value)} onFocus={e => e.target.select()} autoFocus /></div><div className="flex flex-col gap-2"><button onClick={confirmPayment} className="w-full py-4 bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-amber-100 active:scale-95 transition-all text-xs uppercase tracking-widest">Confirm Payment</button><button onClick={() => setPayingRecord(null)} className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest">Cancel</button></div></div></div>, document.body
      )}

      {copyMonthSource && createPortal(
         <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/70 backdrop-blur-md p-6" onClick={() => setCopyMonthSource(null)}><div className="w-full max-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}><div className="text-center mb-6"><h3 className="text-xl font-black text-slate-900">Duplicate Month</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Template from {copyMonthSource.label}</p></div><div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 space-y-2"><div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Entries to Copy</span><span className="text-xs font-black text-slate-900">{copyMonthSource.count} items</span></div><div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Total Value</span><span className="text-xs font-black text-emerald-600">{formatPHP(copyMonthSource.income)}</span></div></div><div className="space-y-4"><div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Month</label><div className="grid grid-cols-2 gap-2"><select className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-blue-500" value={copyTargetMonth} onChange={e => setCopyTargetMonth(parseInt(e.target.value))}>{MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}</select><input type="number" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-blue-500" value={copyTargetYear} onChange={e => setCopyTargetYear(parseInt(e.target.value))} /></div></div><button onClick={handleExecuteMonthCopy} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Execute Duplicate</button><button onClick={() => setCopyMonthSource(null)} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cancel</button></div></div></div>, document.body
      )}

    </div>
  );
};

export default RecordList;