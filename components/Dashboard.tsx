import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DashboardStats, DebtRecord, TabType, CurrencyConfig, AppSession } from '../types';
import { formatCurrency, formatPHP, getTodayStr, addDays, formatDateMD } from '../utils';
import CalendarView from './CalendarView';
import PrintLayout from './PrintLayout';

interface DashboardProps {
  stats: DashboardStats;
  activeTab: string;
  activeTabType: TabType;
  spreadsheetUrl: string;
  records: DebtRecord[];
  onCopyOverdue: () => void;
  onCopyTomorrow: () => void;
  onCopyAll: () => void;
  onCopyUnderStock?: () => void;
  onCopyOverStock?: () => void;
  onCopyIncoming?: () => void;
  onCopyOutgoing?: () => void;
  onCopyAlerts?: () => void;
  onAdjustEarnings?: () => void;
  onAdjustBankBalance?: (mode: 'overwrite' | 'adjust') => void;
  onClearTab?: (tabName: string) => void;
  onOpenTips?: () => void;
  currencyConfig?: CurrencyConfig;
  onOpenCurrencyModal?: () => void;
  session?: AppSession;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const CalendarClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.25V14"/><circle cx="16" cy="16" r="6"/></svg>;
const ClipboardCopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2H6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
const CalendarIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const TrendingUpIcon = ({ size = 16, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const BankIcon = ({ size = 10, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/>
  </svg>
);
const PackageIcon = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;

const ArrowUpRightIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>;
const ArrowDownRightIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>;

const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const BriefcaseIcon = ({ size = 16 }: { size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const PiggyBankIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1 .5-1.5 1-2 0-2.5-1.5-4.5-4-4Z"/><path d="M7 14h.01"/><path d="M9 18v-2h6v2"/></svg>;
const CheckCircleIcon = ({ size = 12, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10.01 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const XCircleIcon = ({ size = 12, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const WalletIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const RefreshCwIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" cy="8" x2="12" y2="12"/><line x1="12" cy="16" x2="12.01" y2="16"/></svg>;
const LayersIcon = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.27a2 2 0 0 0 0 3.66l9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09a2 2 0 0 0 0-3.66z"/><path d="m2.1 14.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/><path d="m2.1 19.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/></svg>;
const PrinterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2H6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>;

const Dashboard: React.FC<DashboardProps> = ({ stats, activeTab, activeTabType, records, onCopyOverdue, onCopyTomorrow, onCopyAll, onCopyUnderStock, onCopyOverStock, onCopyIncoming, onCopyOutgoing, onAdjustEarnings, onAdjustBankBalance, onClearTab, onOpenTips, currencyConfig, onOpenCurrencyModal, session }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth());
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [savingsMonth, setSavingsMonth] = useState(new Date().getMonth());
  const [savingsYear, setSavingsYear] = useState(new Date().getFullYear());
  const [rentCopySuccess, setRentCopySuccess] = useState(false);
  const [rentYearCopySuccess, setRentYearCopySuccess] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  
  const [isPrinting, setIsPrinting] = useState(false);

  const checkPerm = useCallback((actionId: string) => {
    if (session?.role === 'master') return true;
    const perms = session?.tabPermissions?.[activeTab];
    if (!perms) return true;
    return perms.includes(actionId);
  }, [session, activeTab]);

  const [showBalances, setShowBalances] = useState(() => {
    const saved = localStorage.getItem('cashflow_show_balances');
    return saved === null ? true : saved === 'true';
  });

  const isRent = activeTabType === 'rent';
  const isCashFlow = activeTabType === 'cashflow';
  const isSalary = activeTabType === 'salary';
  const isBusiness = activeTabType === 'business';
  const isSavings = activeTabType === 'savings';
  const isSupply = activeTabType === 'supply' || activeTabType === 'product';
  const isProduct = activeTabType === 'product';
  const isInventory = isSupply || isProduct;
  const isDebt = activeTabType === 'debt';
  const isZeroBalance = !isRent && !isCashFlow && !isSalary && !isBusiness && !isSavings && !isInventory && stats.totalDueAmount === 0;

  const currentCurrency = currencyConfig?.useSecondary ? currencyConfig.secondary : (currencyConfig?.primary || 'PHP');
  const rate = currencyConfig?.useSecondary ? currencyConfig.exchangeRate : 1;

  useEffect(() => {
    setShouldAnimate(true);
    const timer = setTimeout(() => setShouldAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [stats]);

  const handlePrint = () => {
    setIsPrinting(true);
  };

  const getPrintData = () => {
    const title = `${activeTab.toUpperCase()} REPORT`;
    const subtitle = `Generated Report`;
    let columns: any[] = [];
    let data = [...records].sort((a, b) => a.date.localeCompare(b.date));
    let summary: any[] = [];

    const fmt = (v: number) => formatCurrency(v * rate, currentCurrency);

    if (isDebt) {
      columns = [
        { header: 'Date', accessor: (r: any) => formatDateMD(r.date), width: '15%' },
        { header: 'Name', accessor: (r: any) => r.name, width: '40%' },
        { header: 'Remarks', accessor: (r: any) => r.remarks, width: '25%' },
        { header: 'Amount', accessor: (r: any) => fmt(r.amount), align: 'right', width: '20%' },
      ];
      summary = [{ label: 'Total Due', value: fmt(stats.totalDueAmount) }];
    } else if (isRent) {
      columns = [
        { header: 'Name', accessor: (r: any) => r.name, width: '30%' },
        { header: 'Start', accessor: (r: any) => formatDateMD(r.date), width: '15%' },
        { header: 'End', accessor: (r: any) => formatDateMD(r.endDate || r.date), width: '15%' },
        { header: 'Remarks', accessor: (r: any) => r.remarks, width: '20%' },
        { header: 'Amount', accessor: (r: any) => fmt(r.amount), align: 'right', width: '20%' },
      ];
      summary = [{ label: 'Yearly Earnings', value: fmt(stats.rentalYearAmount || 0) }];
    } else if (isCashFlow) {
      columns = [
        { header: 'Date', accessor: (r: any) => formatDateMD(r.date), width: '15%' },
        { header: 'Type', accessor: (r: any) => r.transactionType?.toUpperCase(), width: '10%' },
        { header: 'Reference/Name', accessor: (r: any) => r.name || r.facebookId, width: '40%' },
        { header: 'Amount', accessor: (r: any) => fmt(r.amount), align: 'right', width: '20%' },
      ];
      summary = [
        { label: 'Total Incoming', value: fmt(stats.cashflowIncoming || 0) },
        { label: 'Total Outgoing', value: fmt(stats.cashflowOutgoing || 0) },
        { label: 'Net Balance', value: fmt(stats.cashflowNetBalance || 0) },
      ];
    } else if (isSupply) {
      columns = [
        { header: 'Item Name', accessor: (r: any) => r.name, width: '35%' },
        { header: 'Code', accessor: (r: any) => r.itemCode || '-', width: '15%' },
        { header: 'Min', accessor: (r: any) => r.minAmount || '-', align: 'center', width: '10%' },
        { header: 'Max', accessor: (r: any) => r.maxAmount || '-', align: 'center', width: '10%' },
        { header: 'Price', accessor: (r: any) => fmt(r.price || 0), align: 'right', width: '15%' },
        { header: 'Qty', accessor: (r: any) => r.amount, align: 'right', width: '15%' },
      ];
      summary = [
        { label: 'Total Items', value: records.length.toString() },
        { label: 'Total Value', value: fmt(stats.productTotalValue || stats.supplyTotalValue || 0) }
      ];
    } else if (isSalary) {
      columns = [
        { header: 'Period', accessor: (r: any) => `${formatDateMD(r.date)} - ${formatDateMD(r.endDate || r.date)}`, width: '40%' },
        { header: 'Remarks', accessor: (r: any) => r.remarks, width: '30%' },
        { header: 'Amount', accessor: (r: any) => fmt(r.amount), align: 'right', width: '30%' },
      ];
      summary = [{ label: 'Yearly Total', value: fmt(stats.salaryYearlyTotal || 0) }];
    } else if (isBusiness) {
        columns = [
            { header: 'Date', accessor: (r: any) => formatDateMD(r.date), width: '15%' },
            { header: 'Type', accessor: (r: any) => r.businessEntryType?.toUpperCase(), width: '15%' },
            { header: 'Description', accessor: (r: any) => r.remarks || r.name, width: '45%' },
            { header: 'Amount', accessor: (r: any) => fmt(r.amount), align: 'right', width: '25%' },
        ];
        summary = [{ label: 'Net Earnings', value: fmt(stats.businessNetEarning || 0) }];
    } else if (isSavings) {
        columns = [
            { header: 'Date', accessor: (r: any) => formatDateMD(r.date), width: '15%' },
            { header: 'Type', accessor: (r: any) => r.transactionType?.toUpperCase(), width: '15%' },
            { header: 'Name', accessor: (r: any) => r.name, width: '35%' },
            { header: 'Status', accessor: (r: any) => r.status === 'finished' ? 'PAID' : 'PENDING', width: '15%' },
            { header: 'Amount', accessor: (r: any) => fmt(r.amount), align: 'right', width: '20%' },
        ];
        summary = [{ label: 'Current Savings', value: fmt(stats.savingsCurrent || 0) }];
    }

    return { title, subtitle, columns, data, summary };
  };

  const totalLoanAmount = useMemo(() => {
    if (activeTabType !== 'debt') return 0;
    return records.reduce((sum, r) => sum + r.amount, 0);
  }, [records, activeTabType]);

  const debtBreakdown = useMemo(() => {
    if (activeTabType !== 'debt') return null;
    const todayStr = getTodayStr();
    const tomorrowStr = addDays(todayStr, 1);
    
    let overdue = 0;
    let today = 0;
    let tomorrow = 0;
    let total = 0;

    records.forEach(r => {
      const val = r.amount;
      total += val;
      if (r.date < todayStr) overdue += val;
      else if (r.date === todayStr) today += val;
      else if (r.date === tomorrowStr) tomorrow += val;
    });

    const noneDue = Math.max(0, total - overdue - today - tomorrow);
    return { total, overdue, today, tomorrow, noneDue };
  }, [records, activeTabType]);

  const rentBreakdown = useMemo(() => {
    if (activeTabType !== 'rent') return null;
    const active = stats.rentalYearCount || 0;
    const finished = stats.rentalYearFinishedCount || 0;
    const cancelled = stats.rentalYearCancelledCount || 0;
    const total = active + finished + cancelled;
    
    return { active, finished, cancelled, total };
  }, [stats, activeTabType]);

  const rentViewStats = useMemo(() => {
    if (!isRent) return { count: 0 };
    const m = currentViewDate.getMonth() + 1; // 1-indexed for record comparison
    const y = currentViewDate.getFullYear();

    const viewMonthRecords = records.filter(r => {
        const parts = r.date.split('-');
        return parseInt(parts[1]) === m && parseInt(parts[0]) === y;
    });

    return {
        count: viewMonthRecords.length,
    };
  }, [records, isRent, currentViewDate]);

  const handleRentCopy = () => {
    const currentMonthIdx = currentViewDate.getMonth(); // 0-indexed
    const currentYear = currentViewDate.getFullYear();
    
    // Filter based on the currently viewed calendar month
    const filtered = records.filter(r => {
       const parts = r.date.split('-');
       const rYear = parseInt(parts[0]);
       const rMonth = parseInt(parts[1]) - 1;
       return rYear === currentYear && rMonth === currentMonthIdx;
    });

    if (filtered.length === 0) {
       alert(`No rentals found for ${MONTHS[currentMonthIdx]}.`);
       return;
    }

    filtered.sort((a, b) => a.date.localeCompare(b.date));

    let text = `Rental for ${MONTHS[currentMonthIdx]}\n\n✨${activeTab.toUpperCase()}✨\n\n`;
    filtered.forEach(r => {
      text += `🌸 ${r.name}: \n`;
      text += `      (${formatDateMD(r.date)} to ${formatDateMD(r.endDate || r.date)})\n`;
      if (r.remarks && r.remarks.trim()) {
         text += `      (${r.remarks.trim()})\n`;
      }
    });
    text += `\nThank you - Lmk`;

    navigator.clipboard.writeText(text);
    setRentCopySuccess(true);
    setTimeout(() => setRentCopySuccess(false), 2000);
  };

  const handleRentYearCopy = () => {
    // Determine target year. If viewing a specific year in the calendar, use that.
    // Otherwise use current system year.
    const targetYear = currentViewDate.getFullYear();
    
    // Filter records for the target year
    const yearRecords = records.filter(r => {
        const parts = r.date.split('-');
        return parseInt(parts[0]) === targetYear;
    });

    if (yearRecords.length === 0) {
        alert(`No rentals found for ${targetYear}.`);
        return;
    }

    let text = `Rental for ${targetYear}\nYearly schedule summary\n\n✨${activeTab.toUpperCase()}✨\n\n`;

    // Group by month index (0-11)
    const groupedByMonth: Record<number, typeof records> = {};
    
    yearRecords.forEach(r => {
        // Requirements: overlap month -> use start date month.
        const monthIndex = parseInt(r.date.split('-')[1]) - 1;
        if (!groupedByMonth[monthIndex]) groupedByMonth[monthIndex] = [];
        groupedByMonth[monthIndex].push(r);
    });

    // Get sorted month indices
    const sortedMonths = Object.keys(groupedByMonth).map(Number).sort((a, b) => a - b);

    sortedMonths.forEach(monthIdx => {
        const monthName = MONTHS[monthIdx];
        text += `Month of ${monthName}\n\n`;
        
        // Sort records within the month by date
        const monthRecs = groupedByMonth[monthIdx].sort((a, b) => a.date.localeCompare(b.date));
        
        monthRecs.forEach(r => {
            text += `🌸 ${r.name}: \n`;
            text += `      (${formatDateMD(r.date)} to ${formatDateMD(r.endDate || r.date)})\n`;
            if (r.remarks && r.remarks.trim()) {
                text += `      (${r.remarks.trim()})\n`;
            }
        });
        text += `\n`;
    });

    text += `Thank you - Lmk`;

    navigator.clipboard.writeText(text);
    setRentYearCopySuccess(true);
    setTimeout(() => setRentYearCopySuccess(false), 2000);
  };

  const toggleBalances = () => {
    const newVal = !showBalances;
    setShowBalances(nextVal => !nextVal);
    localStorage.setItem('cashflow_show_balances', String(newVal));
  };

  const currentSalaryTotal = useMemo(() => {
    if (!isSalary) return 0;
    return records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === salaryMonth && d.getFullYear() === salaryYear;
    }).reduce((s, r) => s + r.amount, 0);
  }, [records, isSalary, salaryMonth, salaryYear]);

  const savingsMonthlyStats = useMemo(() => {
    if (!isSavings && !isInventory) return { income: 0, targetSavings: 0, actualSavings: 0, plannedExpenses: 0, actualExpenses: 0, expensesSummary: 0, yearlySavings: 0 };
    
    const monthRecs = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === savingsMonth && d.getFullYear() === savingsYear;
    });

    const income = monthRecs.filter(r => r.transactionType === 'income').reduce((s, r) => s + r.amount, 0);
    const plannedExpenses = monthRecs.filter(r => r.transactionType === 'expense').reduce((s, r) => s + r.amount, 0);
    const actualExpenses = monthRecs.filter(r => r.transactionType === 'expense' && r.status === 'finished').reduce((s, r) => s + (r.actualAmount ?? r.amount), 0);
    
    const targetSavings = income - plannedExpenses;
    const actualSavings = income - actualExpenses;
    const expensesSummary = plannedExpenses - actualExpenses;

    const yearRecs = records.filter(r => new Date(r.date).getFullYear() === savingsYear);
    const yearIncome = yearRecs.filter(r => r.transactionType === 'income').reduce((s, r) => s + r.amount, 0);
    const yearActualExp = yearRecs.filter(r => r.transactionType === 'expense' && r.status === 'finished').reduce((s, r) => s + (r.actualAmount ?? r.amount), 0);
    const yearlySavings = yearIncome - yearActualExp;

    return { income, targetSavings, actualSavings, plannedExpenses, actualExpenses, expensesSummary, yearlySavings };
  }, [records, isSavings, isInventory, savingsMonth, savingsYear]);

  const changeSalaryMonth = (dir: number) => {
    let nextMonth = salaryMonth + dir;
    let nextYear = salaryYear;
    if (nextMonth > 11) { nextMonth = 0; nextYear++; }
    if (nextMonth < 0) { nextMonth = 11; nextYear--; }
    setSalaryMonth(nextMonth);
    setSalaryYear(nextYear);
  };

  const changeSavingsMonth = (dir: number) => {
    let nextMonth = savingsMonth + dir;
    let nextYear = salaryYear;
    if (nextMonth > 11) { nextMonth = 0; nextYear++; }
    if (nextMonth < 0) { nextMonth = 11; nextYear--; }
    setSavingsMonth(nextMonth);
    setSavingsYear(nextYear);
  };

  const salaryMonthLabel = new Date(salaryYear, salaryMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
  const savingsMonthLabel = new Date(savingsYear, savingsMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  // BUSINESS CHART LOGIC
  const businessChartData = useMemo(() => {
    if (!isBusiness) return null;
    const earnings = records
      .filter(r => r.businessEntryType === 'earning')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10); // Last 10 cycles
      
    if (earnings.length === 0) return null;
    
    const vals = earnings.map(r => r.amount);
    const maxVal = Math.max(...vals);
    const minVal = Math.min(...vals);
    const absMax = Math.max(Math.abs(maxVal), Math.abs(minVal)) || 1;
    
    return { items: earnings, absMax, hasNegative: minVal < 0 };
  }, [records, isBusiness]);

  // BUSINESS REDUCED INSIGHT
  const businessReducedInsight = useMemo(() => {
    if (!isBusiness) return "";
    const earnings = records.filter(r => r.businessEntryType === 'earning');
    if (earnings.length === 0) return "No Data";
    
    const totalNet = earnings.reduce((s, r) => s + r.amount, 0);
    const formattedTotal = formatCurrency(Math.abs(totalNet) * rate, currentCurrency);
    return totalNet >= 0 ? `Profit: ${formattedTotal}` : `Loss: ${formattedTotal}`;
  }, [records, isBusiness, rate, currentCurrency]);

  // SAVINGS CHART LOGIC
  const savingsChartData = useMemo(() => {
    if (!isSavings) return null;
    const yearRecs = records.filter(r => new Date(r.date).getFullYear() === savingsYear);
    const data = Array(12).fill(0);
    
    yearRecs.forEach(r => {
      const m = new Date(r.date).getMonth();
      if (r.transactionType === 'income') data[m] += r.amount;
      else if (r.transactionType === 'expense' && r.status === 'finished') data[m] -= (r.actualAmount ?? r.amount);
    });
    
    const maxVal = Math.max(...data.map(Math.abs)) || 1;
    return { data, maxVal };
  }, [records, isSavings, savingsYear]);

  // SAVINGS REDUCED INSIGHT
  const savingsReducedInsight = useMemo(() => {
    if (!isSavings) return "";
    const income = savingsMonthlyStats.income;
    const actual = savingsMonthlyStats.actualSavings;
    
    if (income <= 0) return "No Income";
    
    const ratio = (actual / income) * 100;
    return `Saving Rate: ${Math.round(ratio)}%`;
  }, [isSavings, savingsMonthlyStats]);

  // CASH FLOW CHART & INSIGHT LOGIC
  const cashflowData = useMemo(() => {
    if (!isCashFlow) return null;
    // Get last 25 transactions sorted by date ascending
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date)).slice(-25);
    
    if (sorted.length < 2) return null;

    let running = 0;
    const points = sorted.map(r => {
      const val = r.transactionType === 'income' ? r.amount : -r.amount;
      running += val;
      return running;
    });

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    // Normalize to 0-100 for height, but keep the relative shape
    const normalizedPoints = points.map(p => ((p - min) / range) * 60 + 20); // 20-80 range padding
    
    // Create SVG path
    const width = 100;
    const step = width / (normalizedPoints.length - 1);
    const pathD = normalizedPoints.map((val, i) => 
      `${i === 0 ? 'M' : 'L'} ${i * step} ${100 - val}`
    ).join(' ');

    return { pathD, points, isPositive: (points[points.length-1] - points[0]) >= 0 };
  }, [records, isCashFlow]);

  const cashflowReducedInsight = useMemo(() => {
    if (!isCashFlow) return "";
    const incoming = stats.cashflowIncoming || 0;
    const outgoing = stats.cashflowOutgoing || 0;
    const net = stats.cashflowNetBalance || 0;

    if (incoming === 0 && outgoing === 0) return "No Data";
    
    const flowRatio = incoming > 0 ? (net / incoming) * 100 : 0;
    const isPositive = net >= 0;
    
    return isPositive 
      ? `Surplus: +${Math.round(flowRatio)}%` 
      : `Deficit Flow`;
  }, [stats.cashflowIncoming, stats.cashflowOutgoing, stats.cashflowNetBalance, isCashFlow]);

  // SALARY CHART LOGIC
  const salaryChartData = useMemo(() => {
    if (!isSalary) return null;
    const yearRecs = records.filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === salaryYear;
    });
    
    const data = Array(12).fill(0);
    yearRecs.forEach(r => {
      const m = new Date(r.date).getMonth();
      data[m] += r.amount;
    });
    
    const maxVal = Math.max(...data) || 1;
    return { data, maxVal };
  }, [records, isSalary, salaryYear]);

  // SALARY REDUCED INSIGHT
  const salaryReducedInsight = useMemo(() => {
    if (!isSalary) return "";
    const current = currentSalaryTotal;
    
    if (current === 0) return "No Data";
    
    // Calculate average of non-zero months
    const nonZeroMonths = salaryChartData?.data.filter(v => v > 0) || [];
    if (nonZeroMonths.length === 0) return "First Entry";
    
    const avg = nonZeroMonths.reduce((a, b) => a + b, 0) / nonZeroMonths.length;
    const diff = current - avg;
    const pct = avg > 0 ? (diff / avg) * 100 : 0;
    
    if (Math.abs(pct) < 5) return "Steady";
    return pct > 0 ? `+${Math.round(pct)}% vs Avg` : `${Math.round(pct)}% vs Avg`;
  }, [isSalary, currentSalaryTotal, salaryChartData]);

  // STOCK INSIGHT ENGINE (SUPPLY ONLY)
  const stockInsights = useMemo(() => {
    if (!isSupply) return null;
    const totalItems = records.length;
    const underCount = records.filter(r => r.minAmount !== undefined && r.amount < r.minAmount).length;
    // Calculate overCount locally to ensure availability within the memo
    const overCount = records.filter(r => r.maxAmount !== undefined && r.amount > r.maxAmount).length;
    
    const healthScore = totalItems > 0 ? Math.round(((totalItems - underCount) / totalItems) * 100) : 100;
    
    const lowStockRatio = totalItems > 0 ? underCount / totalItems : 0;
    
    // Reduced Insights & Green/Red Logic
    let velocityMsg = "Optimal";
    let statusLabel = "HEALTHY";
    let themeColor = "bg-gradient-to-br from-emerald-500 to-teal-700"; // Green

    if (lowStockRatio > 0) { // Any low stock triggers check
        if (lowStockRatio > 0.3) {
             velocityMsg = "Critical";
             statusLabel = "CRITICAL";
             themeColor = "bg-gradient-to-br from-red-600 to-rose-900"; // Red
        } else {
             velocityMsg = "Restock";
             statusLabel = "ATTENTION";
             themeColor = "bg-gradient-to-br from-red-600 to-rose-900"; // Red (as requested: "gradient red if not good")
        }
    }

    const criticalItem = records
      .filter(r => r.minAmount !== undefined && r.amount < r.minAmount)
      .sort((a, b) => {
        const gapA = (a.minAmount || 0) - a.amount;
        const gapB = (b.minAmount || 0) - b.amount;
        return gapB - gapA;
      })[0];

    return { healthScore, velocityMsg, statusLabel, themeColor, criticalItem, underCount, overCount, totalItems };
  }, [records, isSupply]);

  // PRODUCT FLOW INSIGHTS
  const productFlowInsights = useMemo(() => {
    if (!isProduct) return null;
    
    // We summarize movement based on items categorized by stock level status
    const inFlowItems = records.filter(r => r.amount >= (r.minAmount || 0));
    const outFlowItems = records.filter(r => r.minAmount !== undefined && r.amount < r.minAmount);
    
    const inFlowValue = inFlowItems.reduce((s, r) => s + (r.amount * (r.price || 0)), 0);
    const outFlowRisk = outFlowItems.reduce((s, r) => s + (r.amount * (r.price || 0)), 0);
    
    return {
      inFlowCount: inFlowItems.length,
      outFlowCount: outFlowItems.length,
      inFlowValue,
      outFlowRisk
    };
  }, [records, isProduct]);

  // DEBT PERFORMANCE INSIGHT
  const debtInsight = useMemo(() => {
    if (!isDebt) return null;
    const total = stats.totalDueAmount || 0;
    const today = getTodayStr();
    
    const overdueRecords = records.filter(r => r.date < today);
    const overdueSum = overdueRecords.reduce((s, r) => s + r.amount, 0);
    
    if (total === 0) return "No Debt";
    
    const healthRatio = total > 0 ? (1 - (overdueSum / total)) * 100 : 100;
    let message = "";
    
    if (overdueSum === 0) {
      message = "Perfect Health";
    } else if (healthRatio > 85) {
      message = "Strong Collection";
    } else if (healthRatio > 60) {
      message = "Manageable";
    } else if (healthRatio > 30) {
      message = "High Overdue";
    } else {
      message = "Critical";
    }
    
    return message;
  }, [records, stats.totalDueAmount, isDebt]);

  // RENTAL REDUCED INSIGHT
  const rentalReducedInsight = useMemo(() => {
    if (!isRent) return "";
    const finished = stats.rentalYearFinishedCount || 0;
    const cancelled = stats.rentalYearCancelledCount || 0;
    const active = stats.rentalYearCount || 0;
    const total = finished + cancelled + active;

    if (total === 0) return "No Data";
    
    // Logic for concise insight
    if (cancelled === 0 && finished > 0) return "100% Success";
    if (cancelled > 0) {
        const finishRate = Math.round((finished / total) * 100);
        return `Success Rate: ${finishRate}%`;
    }
    if (active > 0) return `${active} Active`;
    
    return "Normal";
  }, [stats, isRent]);

  // PRODUCT VIEW
  if (isProduct && productFlowInsights) {
    const totalInventoryValue = stats.productTotalValue || 0;
    const underCount = stats.productUnderStockCount || 0;
    const overCount = stats.productOverStockCount || 0;

    return (
      <div className="space-y-4 text-center">
        <div className={`relative bg-gradient-to-br from-blue-700 to-indigo-900 shadow-xl p-6 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[180px] overflow-hidden transition-all duration-300 ${shouldAnimate ? 'ring-4 ring-blue-400/20' : ''}`}>
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 text-white"><LayersIcon size={140} /></div>
          <div className="relative z-10 w-full flex flex-col items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-1">
              <span className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">Total Portfolio Valuation</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-1">
              {formatCurrency(totalInventoryValue * rate, currentCurrency)}
            </h2>
            <p className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest leading-none mb-6">Market Asset Value</p>
            <div className="w-full flex items-center justify-between gap-2 bg-black/20 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
               <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-emerald-500/20 rounded-lg"><ArrowUpRightIcon size={12} className="text-emerald-400" /></div>
                    <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Incoming Assets</span>
                  </div>
                  <span className="text-sm font-black text-white ml-0.5">{formatCurrency(productFlowInsights.inFlowValue * rate, currentCurrency)}</span>
               </div>
               <div className="w-px h-8 bg-white/10"></div>
               <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest">Outgoing Risk</span>
                    <div className="p-1 bg-rose-500/20 rounded-lg"><ArrowDownRightIcon size={12} className="text-rose-400" /></div>
                  </div>
                  <span className="text-sm font-black text-white mr-0.5">{formatCurrency(productFlowInsights.outFlowRisk * rate, currentCurrency)}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Low Stock items</p>
            <p className={`text-xl font-black ${underCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{underCount}</p>
          </div>
          <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Overstock count</p>
            <p className={`text-xl font-black ${overCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{overCount}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5">
          <button onClick={onCopyAll} className="py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
            <ClipboardCopyIcon /> All Products
          </button>
          <button onClick={onCopyUnderStock} className="py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
             <AlertCircleIcon /> Out of Stock
          </button>
          <button onClick={onCopyOverStock} className="py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
             <TrendingUpIcon size={18} /> Surplus
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button onClick={onOpenCurrencyModal} className="flex-1 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-3 border-2 bg-white text-blue-600 border-blue-100 active:scale-95">
            <RefreshCwIcon /> {currencyConfig?.useSecondary ? `Converted to ${currencyConfig.secondary}` : 'Currency Option'}
          </button>
          <button onClick={handlePrint} className="p-4 bg-white border-2 border-slate-200 text-slate-500 rounded-3xl active:scale-95 shadow-sm" title="Print Report">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          </button>
          <button onClick={onOpenTips} className="p-4 bg-white border-2 border-blue-500 text-blue-600 rounded-3xl active:scale-95 shadow-sm">
            <InfoIcon />
          </button>
        </div>
        {isPrinting && <PrintLayout title={`${activeTab.toUpperCase()} REPORT`} data={getPrintData().data} columns={getPrintData().columns} summary={getPrintData().summary} onClose={() => setIsPrinting(false)} />}
      </div>
    );
  }

  // SUPPLY VIEW
  if (isSupply && stockInsights) {
    const totalInventoryValue = stats.supplyTotalValue || 0;
    const themeBg = stockInsights.themeColor;
    const total = stockInsights.totalItems;
    const under = stockInsights.underCount;
    const over = stockInsights.overCount;
    const good = Math.max(0, total - under - over);
    const pctGood = total > 0 ? (good / total) * 100 : 0;
    const pctUnder = total > 0 ? (under / total) * 100 : 0;
    const pctOver = total > 0 ? (over / total) * 100 : 0;

    return (
      <div className="space-y-4 text-center">
        <div className={`relative ${themeBg} shadow-xl p-5 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[180px] overflow-hidden transition-all duration-300 ${shouldAnimate ? 'ring-4 ring-white/10' : ''}`}>
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12"><PackageIcon size={120} /></div>
          <div className="relative z-10 w-full flex flex-col items-center gap-2">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 mb-1">
              <span className="text-white text-[9px] font-black uppercase tracking-[0.2em]">{stockInsights.statusLabel}</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter translation-all duration-500 leading-none mb-1">{stockInsights.healthScore}%</h2>
            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest leading-none mb-2">Health Index</p>
            <div className="w-full max-w-[200px] flex flex-col items-center gap-2 mt-2">
                <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-black/20 shadow-inner">
                    {good > 0 && <div style={{ width: `${pctGood}%` }} className="h-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>}
                    {under > 0 && <div style={{ width: `${pctUnder}%` }} className="h-full bg-rose-500"></div>}
                    {over > 0 && <div style={{ width: `${pctOver}%` }} className="h-full bg-amber-400"></div>}
                </div>
                <div className="flex gap-3 text-[7px] font-black text-white/80 uppercase tracking-widest">
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-white"></div>Good</span>
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>Low</span>
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>Over</span>
                </div>
            </div>
            <p className="text-white text-[10px] font-bold italic opacity-90 mt-2">{stockInsights.velocityMsg}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Estimated value ({currentCurrency})</p>
            <p className="text-lg font-black text-slate-900">{formatCurrency(totalInventoryValue * rate, currentCurrency)}</p>
          </div>
          {stockInsights.criticalItem ? (
            <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
              <p className="text-rose-500 text-[9px] font-black uppercase tracking-wider">Critical Refill</p>
              <p className="text-sm font-black text-rose-800 truncate w-full px-2">{stockInsights.criticalItem.name}</p>
              <p className="text-[8px] font-black text-rose-400 uppercase leading-none mt-0.5">Needs {stockInsights.criticalItem.minAmount! - stockInsights.criticalItem.amount} more</p>
            </div>
          ) : (
            <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
              <p className="text-emerald-500 text-[9px] font-black uppercase tracking-wider">Replenishment</p>
              <p className="text-sm font-black text-emerald-800">All Levels OK</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border-2 border-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-tight">Active units</p>
            <p className="text-sm font-black text-slate-900">{records.length}</p>
          </div>
          <div className="bg-white border-2 border-rose-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
            <p className="text-rose-500 text-[8px] font-black uppercase tracking-tight leading-none">Under Stock</p>
            <p className="text-sm font-black text-rose-600">{stockInsights.underCount}</p>
          </div>
          <div className="bg-white border-2 border-amber-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
            <p className="text-amber-500 text-[8px] font-black uppercase tracking-tight leading-none">Overstock</p>
            <p className="text-sm font-black text-amber-600">{over}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5">
          <button onClick={onCopyAll} className="py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
            <ClipboardCopyIcon /> All Items
          </button>
          <button onClick={onCopyUnderStock} className="py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
             <AlertCircleIcon /> Under Stock
          </button>
          <button onClick={onCopyOverStock} className="py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
             <TrendingUpIcon size={18} /> Over Stock
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button onClick={onOpenCurrencyModal} title="Currency" className={`flex-1 min-w-[70px] py-3 rounded-2xl font-black text-[8px] uppercase tracking-tighter transition-all shadow-sm flex flex-col items-center justify-center gap-1 border-2 ${currencyConfig?.useSecondary ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-indigo-600 border-indigo-100 active:scale-95'}`}>
            <RefreshCwIcon /> {currencyConfig?.useSecondary ? currencyConfig.secondary : 'Currency Option'}
          </button>
          <button onClick={handlePrint} className="flex-1 min-w-[50px] bg-white border-2 border-slate-200 text-slate-500 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm" title="Print">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> Print
          </button>
          <button onClick={onOpenTips} title="Tips" className="flex-1 min-w-[70px] bg-white border-2 border-cyan-500 text-cyan-600 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
            <InfoIcon /> Tips
          </button>
        </div>
        {isPrinting && <PrintLayout title={`${activeTab.toUpperCase()} REPORT`} data={getPrintData().data} columns={getPrintData().columns} summary={getPrintData().summary} onClose={() => setIsPrinting(false)} />}
      </div>
    );
  }

  // SAVINGS VIEW
  if (isSavings) {
    return (
      <div className="space-y-4 text-center">
        <div className={`relative bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl p-5 rounded-[2.5rem] flex flex-col min-h-[180px] overflow-hidden transition-all duration-300 ${shouldAnimate ? 'ring-4 ring-white/10' : ''}`}>
           <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 text-white"><PiggyBankIcon size={120} /></div>
           
           <div className="relative z-10 w-full mb-1 text-left px-2">
             <p className="text-amber-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Current Savings ({currentCurrency})</p>
             <p className="text-4xl font-black text-white tracking-tighter mb-4">{formatCurrency(savingsMonthlyStats.actualSavings * rate, currentCurrency)}</p>
           </div>

           <div className="relative z-10 flex-1 flex items-end w-full px-2 mb-1">
              {savingsChartData ? (
                 <div className="w-full h-12 flex items-end justify-between gap-1">
                    {savingsChartData.data.map((val, idx) => {
                       const heightPct = (Math.abs(val) / savingsChartData.maxVal) * 80;
                       const isActiveMonth = idx === savingsMonth;
                       const isPositive = val >= 0;
                       return (
                         <div key={idx} className="flex-1 h-full flex flex-col justify-end relative group">
                            <div className={`w-full rounded-[1px] transition-all duration-500 ${isActiveMonth ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : (isPositive ? 'bg-emerald-300/60' : 'bg-rose-300/60')}`} style={{ height: `${Math.max(10, heightPct)}%` }} />
                         </div>
                       );
                    })}
                 </div>
              ) : (
                <div className="w-full h-12 flex items-center justify-center border border-white/10 rounded-xl bg-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">No Data</span></div>
              )}
           </div>

           <div className="relative z-10 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center justify-between w-full mt-1">
              <p className="text-white text-[9px] font-bold italic truncate flex-1 text-left leading-tight opacity-90">{savingsReducedInsight}</p>
           </div>
        </div>

        <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-2xl shadow-sm">
           <button onClick={() => changeSavingsMonth(-1)} className="p-2 bg-slate-50 text-slate-400 rounded-xl active:scale-90 transition-transform"><ChevronLeftIcon /></button>
           <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savings For</span>
             <span className="text-sm font-black text-slate-800">{savingsMonthLabel}</span>
           </div>
           <button onClick={() => changeSavingsMonth(1)} className="p-2 bg-slate-50 text-slate-400 rounded-xl active:scale-90 transition-transform"><ChevronRightIcon /></button>
        </div>

        <div className="grid grid-cols-2 gap-2">
           <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
             <p className="text-emerald-600 text-[9px] font-black uppercase tracking-wider">Total Income</p>
             <p className="text-sm font-black text-emerald-800">{formatCurrency(savingsMonthlyStats.income * rate, currentCurrency)}</p>
           </div>
           <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
             <p className="text-rose-600 text-[9px] font-black uppercase tracking-wider">Total Expenses</p>
             <p className="text-sm font-black text-emerald-800">{formatCurrency(savingsMonthlyStats.plannedExpenses * rate, currentCurrency)}</p>
           </div>
        </div>
        
        <div className="bg-white border-2 border-amber-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
           <div className="flex flex-col items-start">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Yearly Accumulated</span>
              <span className="text-xs font-bold text-slate-500">Net Savings (Actual)</span>
           </div>
           <span className="text-lg font-black text-amber-600">{formatCurrency(savingsMonthlyStats.yearlySavings * rate, currentCurrency)}</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button onClick={onCopyAll} title="Copy Summary" className="flex-1 min-w-[70px] bg-amber-600 text-white py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
            <ClipboardCopyIcon /> Summary
          </button>
          <button onClick={onOpenCurrencyModal} title="Currency" className={`flex-1 min-w-[70px] py-3 rounded-2xl font-black text-[8px] uppercase tracking-tighter transition-all shadow-sm flex flex-col items-center justify-center gap-1 border-2 ${currencyConfig?.useSecondary ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-indigo-600 border-indigo-100 active:scale-95'}`}>
            <RefreshCwIcon /> {currencyConfig?.useSecondary ? currencyConfig.secondary : 'Currency Option'}
          </button>
          <button onClick={handlePrint} className="flex-1 min-w-[50px] bg-white border-2 border-slate-200 text-slate-500 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm" title="Print">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> Print
          </button>
          <button onClick={onOpenTips} title="Tips" className="flex-1 min-w-[70px] bg-white border-2 border-amber-500 text-amber-600 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
            <InfoIcon /> Tips
          </button>
        </div>
        {isPrinting && <PrintLayout title={`${activeTab.toUpperCase()} REPORT`} data={getPrintData().data} columns={getPrintData().columns} summary={getPrintData().summary} onClose={() => setIsPrinting(false)} />}
      </div>
    );
  }

  // BUSINESS VIEW
  if (isBusiness) {
      const outlay = (stats.businessCapital || 0) + (stats.businessExpenses || 0);
      return (
        <div className="space-y-4 text-center">
            <div className={`relative ${stats.businessInCycle ? 'bg-violet-600' : 'bg-slate-800'} shadow-xl p-5 rounded-3xl flex flex-col min-h-[180px] overflow-hidden transition-all duration-300 ${shouldAnimate ? 'ring-4 ring-white/10' : ''}`}>
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12"><BriefcaseIcon size={120} /></div>
              <div className="relative z-10 w-full mb-1 text-left px-2">
                <div className="flex items-center gap-2 mb-1.5">
                   <div className={`w-2 h-2 rounded-full ${stats.businessInCycle ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></div>
                   <p className="text-violet-100 text-[10px] font-black uppercase tracking-[0.2em]">{stats.businessInCycle ? 'Active Cycle' : 'Inactive'}</p>
                </div>
                <p className="text-2xl font-black text-white uppercase leading-none truncate pr-4 drop-shadow-md">{stats.businessInCycle ? (stats.businessCycleDescription || 'Current Operation') : 'No Active Cycle'}</p>
                {stats.businessInCycle && <p className="text-[10px] font-bold text-violet-200 mt-1 uppercase tracking-wider">Outlay: {formatCurrency(outlay * rate, currentCurrency)}</p>}
              </div>
              <div className="relative z-10 flex-1 flex items-end w-full px-2 mt-2 mb-1">
                 {businessChartData ? (
                    <div className="w-full h-16 flex items-end justify-between gap-1">
                       {businessChartData.items.map((item, idx) => {
                          const isPos = item.amount >= 0;
                          const heightPct = (Math.abs(item.amount) / businessChartData.absMax) * (businessChartData.hasNegative ? 40 : 80);
                          return (
                            <div key={idx} className="flex-1 h-full flex flex-col justify-center relative group">
                               {businessChartData.hasNegative && <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20"></div>}
                               <div className={`w-full flex ${businessChartData.hasNegative ? 'h-full items-center' : 'h-full items-end'}`}>
                                  <div className={`w-full relative transition-all duration-500 rounded-[1px] ${isPos ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]'}`} style={{ height: `${Math.max(6, heightPct)}%`, top: businessChartData.hasNegative ? (isPos ? `-${Math.max(3, heightPct/2)}%` : `${Math.max(3, heightPct/2)}%`) : undefined }} />
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 ) : (
                   <div className="w-full h-12 flex items-center justify-center border border-white/10 rounded-xl bg-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">No Cycle History</span></div>
                 )}
              </div>
              <div className="relative z-10 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center justify-between w-full mt-1">
                 <p className="text-white text-[9px] font-bold italic truncate flex-1 text-left leading-tight opacity-90">{businessReducedInsight}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-violet-50 border border-violet-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-violet-600 text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>Capital Used ({currentCurrency})</p>
                <p className="text-sm font-black text-violet-800">{formatCurrency((stats.businessCapital || 0) * rate, currentCurrency)}</p>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-rose-600 text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>Accumulated Expenses</p>
                <p className="text-sm font-black text-violet-800">{formatCurrency((stats.businessExpenses || 0) * rate, currentCurrency)}</p>
              </div>
            </div>
            <div className="bg-white border-2 border-violet-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Total Outlay ({currentCurrency})</p>
              <p className="text-xl font-black text-slate-800">{formatCurrency(outlay * rate, currentCurrency)}</p>
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button onClick={onOpenCurrencyModal} title="Currency" className={`flex-1 min-w-[70px] py-3 rounded-2xl font-black text-[8px] uppercase tracking-tighter transition-all shadow-sm flex flex-col items-center justify-center gap-1 border-2 ${currencyConfig?.useSecondary ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-indigo-600 border-indigo-100 active:scale-95'}`}>
                <RefreshCwIcon /> {currencyConfig?.useSecondary ? currencyConfig.secondary : 'Currency Option'}
              </button>
              <button onClick={handlePrint} className="flex-1 min-w-[50px] bg-white border-2 border-slate-200 text-slate-500 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm" title="Print">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> Print
              </button>
              <button onClick={onOpenTips} title="Tips" className="flex-1 min-w-[70px] bg-white border-2 border-violet-500 text-violet-600 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
                <InfoIcon /> Tips
              </button>
            </div>
            {isPrinting && <PrintLayout title={`${activeTab.toUpperCase()} REPORT`} data={getPrintData().data} columns={getPrintData().columns} summary={getPrintData().summary} onClose={() => setIsPrinting(false)} />}
        </div>
      );
  }

  // SALARY VIEW
  if (isSalary) {
    return (
      <div className="space-y-4 text-center">
        <div className={`relative bg-gradient-to-br from-orange-500 to-amber-600 shadow-xl p-6 rounded-[2.5rem] flex flex-col min-h-[220px] overflow-hidden transition-all duration-300 ${shouldAnimate ? 'ring-4 ring-white/10' : ''}`}>
          <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 text-white"><BriefcaseIcon size={160} /></div>
          
          <div className="relative z-10 w-full mb-2 text-left">
            <p className="text-orange-50 text-[10px] font-black uppercase tracking-[0.2em] mb-2 drop-shadow-sm">Monthly Salary Total ({currentCurrency})</p>
            <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-6 drop-shadow-lg">
              {formatCurrency(currentSalaryTotal * rate, currentCurrency)}
            </h2>
          </div>

          <div className="relative z-10 flex-1 flex items-end w-full mb-2">
            {salaryChartData ? (
              <div className="w-full h-16 flex items-end justify-between gap-1.5 px-1">
                {salaryChartData.data.map((val, idx) => {
                  const heightPct = (val / salaryChartData.maxVal) * 80;
                  const isActiveMonth = idx === salaryMonth;
                  return (
                    <div key={idx} className="flex-1 h-full flex flex-col justify-end">
                      <div 
                        className={`w-full rounded-t-[2px] transition-all duration-500 ${isActiveMonth ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]' : 'bg-white/40'}`} 
                        style={{ height: `${Math.max(8, heightPct)}%` }} 
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-12 flex items-center justify-center border border-white/10 rounded-xl bg-white/5"><span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">No Salary History</span></div>
            )}
          </div>

          <div className="relative z-10 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 inline-block w-full mt-2">
            <p className="text-white text-[10px] font-black italic text-left uppercase tracking-wider">{salaryReducedInsight || "Analytics Active"}</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
           <button onClick={() => changeSalaryMonth(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-xl active:scale-90 transition-transform shadow-inner"><ChevronLeftIcon /></button>
           <div className="flex flex-col text-center">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 leading-none">Showing Salary For</span>
             <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{salaryMonthLabel}</span>
           </div>
           <button onClick={() => changeSalaryMonth(1)} className="p-3 bg-slate-50 text-slate-400 rounded-xl active:scale-90 transition-transform shadow-inner"><ChevronRightIcon /></button>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-2 shadow-inner">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="text-amber-700 text-[11px] font-black uppercase tracking-[0.25em]">Yearly Cumulative ({currentCurrency})</p>
           </div>
           <p className="text-2xl font-black text-amber-900 tracking-tight">{formatCurrency((stats.salaryYearlyTotal || 0) * rate, currentCurrency)}</p>
        </div>

        <div className="grid grid-cols-4 gap-2 px-1">
          <button onClick={onCopyAll} className="bg-orange-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-100">
             <ClipboardListIcon />
             <span className="text-[8px] font-black uppercase tracking-tighter">Records</span>
          </button>
          <button onClick={onOpenCurrencyModal} className="bg-white border-2 border-slate-100 text-blue-600 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
             <RefreshCwIcon />
             <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">Currency Option</span>
          </button>
          <button onClick={handlePrint} className="bg-white border-2 border-slate-100 text-slate-600 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
             <PrinterIcon />
             <span className="text-[8px] font-black uppercase tracking-tighter">Print</span>
          </button>
          <button onClick={onOpenTips} className="bg-white border-2 border-amber-500 text-amber-600 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-sm">
             <InfoIcon />
             <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none">Tips</span>
          </button>
        </div>
        
        {isPrinting && <PrintLayout title={`${activeTab.toUpperCase()} REPORT`} data={getPrintData().data} columns={getPrintData().columns} summary={getPrintData().summary} onClose={() => setIsPrinting(false)} />}
      </div>
    );
  }

  // DEFAULT VIEW (DEBT / RENT / CASHFLOW)
  return (
    <div className="space-y-4 text-center">
       {isCashFlow ? (
          <>
            {/* Cashflow Content */}
            <div className={`relative bg-slate-900 shadow-xl p-5 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[180px] overflow-hidden transition-all duration-300 ${shouldAnimate ? 'ring-4 ring-slate-800/50' : ''}`}>
               <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 text-slate-700"><TrendingUpIcon size={120} /></div>
               <div className="relative z-10 w-full mb-2">
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Current Net Balance ({currentCurrency})</p>
                 <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency((stats.cashflowNetBalance || 0) * rate, currentCurrency)}</p>
               </div>
               <div className="relative z-10 w-full h-16 flex items-end px-4 mb-2">
                  {cashflowData ? (
                     <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                        <defs><linearGradient id="flowGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={cashflowData.isPositive ? '#34d399' : '#fb7185'} stopOpacity="0.5" /><stop offset="100%" stopColor={cashflowData.isPositive ? '#34d399' : '#fb7185'} stopOpacity="0" /></linearGradient></defs>
                        <path d={`${cashflowData.pathD} L 100 50 L 0 50 Z`} fill="url(#flowGradient)" className="opacity-30"/>
                        <path d={cashflowData.pathD} fill="none" stroke={cashflowData.isPositive ? '#34d399' : '#fb7185'} strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-sm"/>
                     </svg>
                  ) : (<div className="w-full h-full flex items-center justify-center border-t border-slate-800"><span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">No Trend Data</span></div>)}
               </div>
               <div className="relative z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 inline-block max-w-[90%] mx-auto mt-1">
                  <p className={`text-[10px] font-bold italic leading-tight ${cashflowData?.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>{cashflowReducedInsight}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-emerald-600 text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>Total Incoming</p>
                <p className="text-sm font-black text-emerald-800">{formatCurrency((stats.cashflowIncoming || 0) * rate, currentCurrency)}</p>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-rose-600 text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>Total Outgoing</p>
                <p className="text-sm font-black text-emerald-800">{formatCurrency((stats.cashflowOutgoing || 0) * rate, currentCurrency)}</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-2">
              {checkPerm('hide_bank') && (
                <button onClick={toggleBalances} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest active:scale-95 transition-all shadow-sm">
                  {showBalances ? <EyeOffIcon /> : <EyeIcon />}{showBalances ? 'Hide Bank Details' : 'Show Bank Details'}
                </button>
              )}
              {checkPerm('clear') && (
                <button onClick={() => onClearTab?.(activeTab)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-black text-red-500 uppercase tracking-widest active:scale-95 transition-all shadow-sm">
                  <TrashIcon />Clear Ledger
                </button>
              )}
            </div>
            {showBalances && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-white border-2 border-black p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm relative group">
                  {checkPerm('adjust_bank') && (<button onClick={() => onAdjustBankBalance?.('adjust')} className="absolute top-2 right-2 p-1.5 bg-slate-50 text-slate-400 rounded-lg border border-slate-100 active:scale-90 transition-transform z-10"><EditIcon /></button>)}
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 w-full"><BankIcon className="text-slate-400 shrink-0" /><span className="truncate">Initial Bank ({currentCurrency})</span></p>
                  <button onClick={() => checkPerm('adjust_bank') && onAdjustBankBalance?.('overwrite')} className={`text-sm font-black text-slate-800 transition-colors ${checkPerm('adjust_bank') ? 'hover:text-blue-600 active:scale-95' : 'cursor-default'}`}>{formatCurrency((stats.cashflowInitialBalance || 0) * rate, currentCurrency)}</button>
                </div>
                <div className="bg-white border-2 border-blue-600 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md relative">
                  <p className="text-blue-600 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 w-full"><BankIcon className="text-blue-400 shrink-0" /><span className="truncate">Current Bank ({currentCurrency})</span></p>
                  <p className="text-sm font-black text-slate-800">{formatCurrency((stats.cashflowCurrentBankBalance || 0) * rate, currentCurrency)}</p>
                </div>
              </div>
            )}

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button onClick={onCopyIncoming} title="Copy Incoming" className="flex-1 min-w-[70px] bg-white border-2 border-emerald-500 text-emerald-600 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
                <ArrowUpRightIcon /> Incoming
              </button>
              <button onClick={onCopyOutgoing} title="Copy Outgoing" className="flex-1 min-w-[70px] bg-white border-2 border-rose-500 text-rose-600 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
                <ArrowDownRightIcon /> Outgoing
              </button>
              <button onClick={onOpenCurrencyModal} title="Currency" className={`flex-1 min-w-[70px] py-3 rounded-2xl font-black text-[8px] uppercase tracking-tighter transition-all shadow-sm flex flex-col items-center justify-center gap-1 border-2 ${currencyConfig?.useSecondary ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-indigo-600 border-indigo-100 active:scale-95'}`}>
                <RefreshCwIcon /> {currencyConfig?.useSecondary ? currencyConfig.secondary : 'Currency Option'}
              </button>
              <button onClick={handlePrint} className="flex-1 min-w-[50px] bg-white border-2 border-slate-200 text-slate-500 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm" title="Print">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> Print
              </button>
              <button onClick={onOpenTips} title="Tips" className="flex-1 min-w-[70px] bg-white border-2 border-slate-200 text-slate-500 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
                <InfoIcon /> Tips
              </button>
            </div>
          </>
       ) : isRent ? (
          <>
            {/* Rent Content */}
            <div className={`relative bg-gradient-to-br from-blue-600 to-indigo-800 shadow-xl p-5 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[180px] overflow-hidden transition-all duration-300 ${shouldAnimate ? 'ring-4 ring-white/10' : ''}`}>
               <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 text-white"><TrendingUpIcon size={120} /></div>
               <div className="relative z-10 w-full mb-2">
                 <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Current Yearly Earnings ({currentCurrency})</p>
                 <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency((stats.rentalYearAmount || 0) * rate, currentCurrency)}</p>
               </div>
               <div className="relative z-10 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 inline-block max-w-[90%] mx-auto mt-1">
                  <p className="text-[10px] font-bold italic leading-tight text-white">{rentalReducedInsight}</p>
               </div>
               {/* Rent Pie Line */}
               {rentBreakdown && rentBreakdown.total > 0 && (
                 <div className="w-full mt-5 px-4 animate-in fade-in slide-in-from-bottom-2 duration-700 relative z-10">
                   <div className="w-full h-3 rounded-full flex overflow-hidden bg-black/20 backdrop-blur-sm ring-1 ring-white/10">
                      <div style={{ width: `${(rentBreakdown.finished / rentBreakdown.total) * 100}%` }} className="h-full bg-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      <div style={{ width: `${(rentBreakdown.active / rentBreakdown.total) * 100}%` }} className="h-full bg-white transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                      <div style={{ width: `${(rentBreakdown.cancelled / rentBreakdown.total) * 100}%` }} className="h-full bg-rose-400 transition-all duration-500" />
                   </div>
                   <div className="flex justify-between mt-2 px-1">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">{rentBreakdown.finished}</span>
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div><span className="text-[7px] font-bold text-white/60 uppercase">Done</span></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{rentBreakdown.active}</span>
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-white"></div><span className="text-[7px] font-bold text-white/60 uppercase">Active</span></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider">{rentBreakdown.cancelled}</span>
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div><span className="text-[7px] font-bold text-white/60 uppercase">Void</span></div>
                      </div>
                   </div>
                 </div>
               )}
            </div>

            {/* Rent Stat Grid */}
            <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Month Schedule</p>
                <p className="text-xl font-black text-indigo-600">{stats.rentalMonthCount || 0}</p>
              </div>
              <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Year Schedule</p>
                <p className="text-xl font-black text-indigo-800">{stats.rentalYearCount || 0}</p>
              </div>
              <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Yearly Finished</p>
                <p className="text-xl font-black text-emerald-600">{stats.rentalYearFinishedCount || 0}</p>
              </div>
              <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Yearly Cancelled</p>
                <p className="text-xl font-black text-rose-600">{stats.rentalYearCancelledCount || 0}</p>
              </div>
            </div>
            
            <CalendarView records={records} currentDate={currentViewDate} onDateChange={setCurrentViewDate} />
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <button onClick={handleRentCopy} className="flex-1 bg-white border-2 border-indigo-500 text-indigo-600 p-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
                  {rentCopySuccess ? <CheckCircleIcon /> : <CopyIcon />} {rentCopySuccess ? 'Copied!' : 'Copy Month'}
                </button>
                <button onClick={handleRentYearCopy} className="flex-1 bg-white border-2 border-emerald-500 text-emerald-600 p-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
                  {rentYearCopySuccess ? <CheckCircleIcon /> : <CalendarClockIcon />} {rentYearCopySuccess ? 'Copied!' : 'Copy Year'}
                </button>
              </div>
              
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {checkPerm('adjust_earnings') && (<button onClick={onAdjustEarnings} title="Adjust" className="flex-1 min-w-[70px] bg-indigo-600 text-white py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-md"><EditIcon /> Adjust</button>)}
                <button onClick={onOpenCurrencyModal} title="Currency" className={`flex-1 min-w-[70px] py-3 rounded-2xl font-black text-[8px] uppercase tracking-tighter transition-all shadow-sm flex flex-col items-center justify-center gap-1 border-2 ${currencyConfig?.useSecondary ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-indigo-600 border-indigo-100 active:scale-95'}`}>
                  <RefreshCwIcon /> {currencyConfig?.useSecondary ? currencyConfig.secondary : 'Currency Option'}
                </button>
                <button onClick={handlePrint} className="flex-1 min-w-[50px] bg-white border-2 border-slate-200 text-slate-500 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm" title="Print">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> Print
                </button>
                <button onClick={onOpenTips} title="Tips" className="flex-1 min-w-[70px] bg-white border-2 border-indigo-500 text-indigo-600 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
                  <InfoIcon /> Tips
                </button>
              </div>
            </div>
          </>
       ) : (
          <>
            {/* Debt Content */}
            <div className={`relative ${stats.overdueCount > 0 ? 'bg-gradient-to-br from-red-600 to-rose-900' : 'bg-gradient-to-br from-emerald-500 to-teal-700'} shadow-xl p-5 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[180px] overflow-hidden transition-all duration-300 ${shouldAnimate ? 'ring-4 ring-white/10' : ''}`}>
               <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 text-white"><CalendarIcon size={120} /></div>
               
               {/* Total Due Balance Summary Above Pie Line */}
               <div className="relative z-10 w-full mb-2 flex flex-col items-center">
                 <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Total Due Balance ({currentCurrency})</p>
                 <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency(stats.totalDueAmount * rate, currentCurrency)}</p>
               </div>
               
               {debtBreakdown && debtBreakdown.total > 0 && (
                 <div className="w-full mt-4 px-4 animate-in fade-in slide-in-from-bottom-2 duration-700 relative z-10">
                   <div className="w-full h-3 rounded-full flex overflow-hidden bg-black/20 backdrop-blur-sm ring-1 ring-white/10">
                      <div style={{ width: `${(debtBreakdown.overdue / debtBreakdown.total) * 100}%` }} className="h-full bg-red-400 transition-all duration-500 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                      <div style={{ width: `${(debtBreakdown.today / debtBreakdown.total) * 100}%` }} className="h-full bg-orange-400 transition-all duration-500 shadow-[0_0_10px_rgba(251,146,60,0.5)]" />
                      <div style={{ width: `${(debtBreakdown.tomorrow / debtBreakdown.total) * 100}%` }} className="h-full bg-yellow-400 transition-all duration-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                      <div style={{ width: `${(debtBreakdown.noneDue / debtBreakdown.total) * 100}%` }} className="h-full bg-slate-300 transition-all duration-500" />
                   </div>
                   <div className="flex justify-between mt-2 px-1">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-red-300 uppercase tracking-wider">{formatCurrency(debtBreakdown.overdue * rate, currentCurrency)}</span>
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div><span className="text-[7px] font-bold text-white/60 uppercase">Late</span></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-orange-300 uppercase tracking-wider">{formatCurrency(debtBreakdown.today * rate, currentCurrency)}</span>
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div><span className="text-[7px] font-bold text-white/60 uppercase">Today</span></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-yellow-300 uppercase tracking-wider">{formatCurrency(debtBreakdown.tomorrow * rate, currentCurrency)}</span>
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div><span className="text-[7px] font-bold text-white/60 uppercase">Tmrw</span></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{formatCurrency(debtBreakdown.noneDue * rate, currentCurrency)}</span>
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div><span className="text-[7px] font-bold text-white/60 uppercase">Future</span></div>
                      </div>
                   </div>
                 </div>
               )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Total Loan</p>
                <p className="text-xl font-black text-blue-600">{formatCurrency(totalLoanAmount * rate, currentCurrency)}</p>
              </div>
              <div className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-sm">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Overdue Count</p>
                <p className={`text-xl font-black ${stats.overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{stats.overdueCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={onCopyOverdue} className="py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
                <AlertCircleIcon /> Late & Today
              </button>
              <button onClick={onCopyTomorrow} className="py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
                <CalendarClockIcon /> Tomorrow
              </button>
              <button onClick={onCopyAll} className="py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">
                <ClipboardCopyIcon /> All Dues
              </button>
            </div>

            <div className="flex gap-1.5">
              <button onClick={onOpenCurrencyModal} className="flex-1 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-3 border-2 bg-white text-blue-600 border-blue-100 active:scale-95">
                <RefreshCwIcon /> {currencyConfig?.useSecondary ? `Converted to ${currencyConfig.secondary}` : 'Currency Option'}
              </button>
              <button onClick={handlePrint} className="p-4 bg-white border-2 border-slate-200 text-slate-500 rounded-3xl active:scale-95 shadow-sm" title="Print Report">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              </button>
              <button onClick={onOpenTips} className="p-4 bg-white border-2 border-blue-500 text-blue-600 rounded-3xl active:scale-95 shadow-sm">
                <InfoIcon />
              </button>
            </div>
          </>
       )}
       {isPrinting && <PrintLayout title={`${activeTab.toUpperCase()} REPORT`} data={getPrintData().data} columns={getPrintData().columns} summary={getPrintData().summary} onClose={() => setIsPrinting(false)} />}
    </div>
  );
};

export default Dashboard;