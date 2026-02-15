import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DebtRecord, CurrencyConfig, TabType, AppSession } from '../types';
import { formatCurrency, formatDateMD, getTodayStr, addDays } from '../utils';
import PasscodeModal from './PasscodeModal';
import DualConfirmModal from './DualConfirmModal';
import PrintLayout from './PrintLayout';

interface SupplyLog {
  id?: string;
  supplySource: string;
  name: string;
  amount: number;
  date: string;
  remarks: string;
}

interface SupplyDetailModalProps {
  record: DebtRecord;
  scriptUrl?: string;
  allRecords?: Record<string, DebtRecord[]>;
  onClose: () => void;
  onEdit: (record: DebtRecord) => void;
  onDelete: (id: string) => void;
  onUpdateRecord: (record: DebtRecord) => void;
  currencyConfig?: CurrencyConfig;
  activeTabType?: TabType;
  activeTabName?: string;
  appPin?: string;
  isMaster?: boolean;
  biometricEnabled?: boolean;
  session?: AppSession | null;
  onLogAction?: (log: DebtRecord, action: 'update' | 'delete', tabName: string) => void;
  copyBullet?: string;
  copyFooter?: string;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const SortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-3 3-3-3"/><path d="m15 6-3-3-3 3"/><path d="M12 3v18"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>;
const PrinterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>;

const normalize = (val: any) => String(val || '').toLowerCase().trim();

export const SupplyDetailModal: React.FC<SupplyDetailModalProps> = ({ 
  record, scriptUrl, allRecords, onClose, onEdit, onDelete, onUpdateRecord, currencyConfig, activeTabType, activeTabName, 
  appPin, isMaster, biometricEnabled, session, onLogAction, copyBullet = '🌸', copyFooter = 'Thank you - Lmk'
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'incoming' | 'outgoing'>('details');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isIncomingCalcOpen, setIsIncomingCalcOpen] = useState(false);
  const [outgoingCopyStatus, setOutgoingCopyStatus] = useState(false);
  const [incomingCopyStatus, setIncomingCopyStatus] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  
  const [incomingLogs, setIncomingLogs] = useState<SupplyLog[]>([]);
  const [outgoingLogs, setOutgoingLogs] = useState<SupplyLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(() => addDays(getTodayStr(), -180));
  const [endDate, setEndDate] = useState(getTodayStr());

  const [isPrinting, setIsPrinting] = useState(false);
  const [printData, setPrintData] = useState<{ logs: SupplyLog[], type: string } | null>(null);

  const isProductType = activeTabType === 'product';
  const ignoreRemoteUpdates = useRef(false);

  const canCalculation = useMemo(() => {
    if (isMaster || !activeTabName) return true;
    if (activeTabType !== 'product') return true; 
    return session?.tabPermissions?.[activeTabName]?.includes('calculation') ?? true;
  }, [isMaster, activeTabName, session, activeTabType]);

  const [passcodeAction, setPasscodeAction] = useState<{ type: 'edit' | 'delete', log: SupplyLog, direction: 'in' | 'out' } | null>(null);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [isDualConfirmOpen, setIsDualConfirmOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<SupplyLog | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SupplyLog>>({});
  const [editDirection, setEditDirection] = useState<'in' | 'out'>('in');
  const [isUpdatingLog, setIsUpdatingLog] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const gestureType = useRef<'none' | 'horizontal' | 'vertical'>('none');

  const tabOrder: ('details' | 'incoming' | 'outgoing')[] = ['details', 'incoming', 'outgoing'];
  const currentIndex = tabOrder.indexOf(activeTab);
  const rate = currencyConfig?.useSecondary ? currencyConfig.exchangeRate : 1;
  const currentCurrency = currencyConfig?.useSecondary ? currencyConfig.secondary : (currencyConfig?.primary || 'PHP');
  const isLowStock = record.minAmount !== undefined && record.amount < record.minAmount;

  const fetchLogs = useCallback(async () => {
    if (ignoreRemoteUpdates.current) return;
    if (!activeTabName || !record.name) return;
    const targetName = normalize(record.name);
    
    setIsLoadingLogs(true);
    try {
      if (!scriptUrl) {
        const inTab = activeTabName + " Incoming";
        const outTab = activeTabName + " Outgoing";
        const matchedIn = ((allRecords?.[inTab] as any[]) || []).filter((log: any) => normalize(log.name) === targetName);
        const matchedOut = ((allRecords?.[outTab] as any[]) || []).filter((log: any) => normalize(log.name) === targetName);
        setIncomingLogs(matchedIn);
        setOutgoingLogs(matchedOut);
        setIsLoadingLogs(false);
        return;
      }
      const timestamp = Date.now();
      const [inRes, outRes] = await Promise.all([
        fetch(`${scriptUrl}?tab=${encodeURIComponent(activeTabName + ' Incoming')}&type=supply_trans&_=${timestamp}`),
        fetch(`${scriptUrl}?tab=${encodeURIComponent(activeTabName + ' Outgoing')}&type=supply_trans&_=${timestamp}`)
      ]);
      const inData = await inRes.json();
      const outData = await outRes.json();
      
      const filteredIn = (inData?.records || []).filter((log: any) => normalize(log.name) === targetName);
      const filteredOut = (outData?.records || []).filter((log: any) => normalize(log.name) === targetName);
      
      setIncomingLogs(filteredIn);
      setOutgoingLogs(filteredOut);
    } catch (e) {
      console.error("Log fetch failed", e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [scriptUrl, activeTabName, record.name, allRecords]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleTouchStart = (e: React.TouchEvent) => { if (e.touches.length > 1) return; touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; gestureType.current = 'none'; setIsSwiping(false); };
  const handleTouchMove = (e: React.TouchEvent) => { if (touchStartX.current === null || touchStartY.current === null) return; const currentX = e.touches[0].clientX; const currentY = e.touches[0].clientY; const diffX = currentX - touchStartX.current; const diffY = currentY - touchStartY.current; if (gestureType.current === 'none') { const absX = Math.abs(diffX); const absY = Math.abs(diffY); if (absX > 15 && absX > absY) { gestureType.current = 'horizontal'; setIsSwiping(true); } else if (absY > 10) { gestureType.current = 'vertical'; return; } } if (gestureType.current === 'horizontal') { if (e.cancelable) e.preventDefault(); e.stopPropagation(); let offset = diffX; if ((currentIndex === 0 && diffX > 0) || (currentIndex === tabOrder.length - 1 && diffX < 0)) offset = diffX * 0.35; setSwipeOffset(offset); } };
  const handleTouchEnd = (e: React.TouchEvent) => { if (touchStartX.current === null) return; if (gestureType.current === 'horizontal') { e.stopPropagation(); const diffX = e.changedTouches[0].clientX - touchStartX.current; const threshold = window.innerWidth * 0.25; setIsSwiping(false); setSwipeOffset(0); if (Math.abs(diffX) > threshold) { if (diffX > 0 && currentIndex > 0) { setActiveTab(tabOrder[currentIndex - 1]); setSelectedLogId(null); } else if (diffX < -threshold && currentIndex < tabOrder.length - 1) { setActiveTab(tabOrder[currentIndex + 1]); setSelectedLogId(null); } } } touchStartX.current = null; touchStartY.current = null; gestureType.current = 'none'; };

  const filteredLogs = useCallback((logs: SupplyLog[]) => logs.filter(l => l.date >= startDate && l.date <= endDate), [startDate, endDate]);
  const sortedIncoming = useMemo(() => filteredLogs([...incomingLogs]).sort((a, b) => sortBy === 'date-desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)), [incomingLogs, sortBy, filteredLogs]);
  const sortedOutgoing = useMemo(() => filteredLogs([...outgoingLogs]).sort((a, b) => sortBy === 'date-desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)), [outgoingLogs, sortBy, filteredLogs]);

  const outgoingStats = useMemo(() => {
    const up = record.price || 0; const norm = (s: string) => s.toLowerCase().trim();
    const sl = sortedOutgoing.filter(l => norm(l.supplySource) === 'sales');
    const ga = sortedOutgoing.filter(l => norm(l.supplySource) === 'giveaway');
    const ds = sortedOutgoing.filter(l => norm(l.supplySource) === 'disposal');
    const su = (list: SupplyLog[]) => list.reduce((s, l) => s + l.amount, 0);
    const sU = su(sl); const gU = su(ga); const dU = su(ds); const oU = sU + gU + dU;
    return { sales: { units: sU, price: sU * up }, giveaway: { units: gU, price: gU * up }, disposal: { units: dU, price: dU * up }, overallUnits: oU, overallPrice: oU * up, unitPrice: up };
  }, [sortedOutgoing, record.price]);

  const incomingStats = useMemo(() => {
    const up = record.price || 0; const norm = (s: string) => s.toLowerCase().trim();
    const pr = sortedIncoming.filter(l => norm(l.supplySource) === 'production');
    const de = sortedIncoming.filter(l => norm(l.supplySource) === 'delivery');
    const re = sortedIncoming.filter(l => norm(l.supplySource) === 'return');
    const su = (list: SupplyLog[]) => list.reduce((s, l) => s + l.amount, 0);
    const pU = su(pr); const dU = su(de); const rU = su(re); const oU = pU + dU + rU;
    return { production: { units: pU, price: pU * up }, delivery: { units: dU, price: dU * up }, returns: { units: rU, price: rU * up }, overallUnits: oU, overallPrice: oU * up, unitPrice: up };
  }, [sortedIncoming, record.price]);

  const fmtC = useCallback((val: number) => {
    const cleanVal = Math.round(val);
    return currentCurrency === 'PHP' 
      ? `₱${cleanVal.toLocaleString('en-US')}` 
      : `${currentCurrency} ${cleanVal.toLocaleString('en-US')}`;
  }, [currentCurrency]);

  const fmtRangeDate = (dStr: string) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    const m = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const day = String(d.getDate()).padStart(2, '0');
    return `${m}${day}`;
  };

  const fmtLogDate = (dStr: string) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    const m = d.toLocaleString('en-US', { month: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    return `${m}'${day}`;
  };

  const handleCopyLogs = (logs: SupplyLog[], type: string) => {
    if (logs.length === 0) return;
    let text = `${type.toUpperCase()} SUMMARY\nItem: ${record.name}\n\n`;
    logs.forEach(l => { text += `${copyBullet} ${formatDateMD(l.date)}: ${l.amount} (${l.supplySource})\n`; if (l.remarks) text += `  Note: ${l.remarks}\n`; });
    text += `\nTOTAL: ${logs.reduce((s, l) => s + l.amount, 0)}\n\n${copyFooter}`;
    navigator.clipboard.writeText(text); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleCopyOutgoingStats = () => {
    const logsToCopy = [...filteredLogs(outgoingLogs)].sort((a, b) => a.date.localeCompare(b.date));
    const yearStr = startDate ? startDate.split('-')[0] : new Date().getFullYear();

    let text = `Outgoing Breakdown \n\n`;
    text += `${record.name}\n`;
    text += `Price : ${record.price || 0}\n\n`;
    text += `Year - ${yearStr}\n`;
    text += `From ${fmtRangeDate(startDate)} to ${fmtRangeDate(endDate)}\n\n`;

    logsToCopy.forEach(log => {
      text += `📌 ${fmtLogDate(log.date)}\n`;
      if (log.remarks && log.remarks.trim()) {
          text += `${log.remarks.trim()}\n`;
      }
      const source = log.supplySource ? (log.supplySource.charAt(0).toUpperCase() + log.supplySource.slice(1)) : 'General';
      const val = log.amount * (record.price || 0) * rate;
      text += `${source}: ${log.amount} (${fmtC(val)})\n\n`;
    });

    text += `Total: ${outgoingStats.overallUnits} (${fmtC(outgoingStats.overallPrice * rate)})`;
    
    if (copyFooter) text += `\n\n${copyFooter}`;

    navigator.clipboard.writeText(text); 
    setOutgoingCopyStatus(true); 
    setTimeout(() => setOutgoingCopyStatus(false), 2000);
  };

  const handleCopyIncomingStats = () => {
    const logsToCopy = [...filteredLogs(incomingLogs)].sort((a, b) => a.date.localeCompare(b.date));
    const yearStr = startDate ? startDate.split('-')[0] : new Date().getFullYear();

    let text = `Incoming Breakdown \n\n`;
    text += `${record.name}\n`;
    text += `Price : ${record.price || 0}\n\n`;
    text += `Year - ${yearStr}\n`;
    text += `From ${fmtRangeDate(startDate)} to ${fmtRangeDate(endDate)}\n\n`;

    logsToCopy.forEach(log => {
      text += `📌 ${fmtLogDate(log.date)}\n`;
      if (log.remarks && log.remarks.trim()) {
          text += `${log.remarks.trim()}\n`;
      }
      const source = log.supplySource ? (log.supplySource.charAt(0).toUpperCase() + log.supplySource.slice(1)) : 'General';
      const val = log.amount * (record.price || 0) * rate;
      text += `${source}: ${log.amount} (${fmtC(val)})\n\n`;
    });

    text += `Total: ${incomingStats.overallUnits} (${fmtC(incomingStats.overallPrice * rate)})`;
    
    if (copyFooter) text += `\n\n${copyFooter}`;

    navigator.clipboard.writeText(text); 
    setIncomingCopyStatus(true); 
    setTimeout(() => setIncomingCopyStatus(false), 2000);
  };

  const handlePrintLogs = (logs: SupplyLog[], type: string) => {
    if (logs.length === 0) return;
    setPrintData({ logs, type });
    setIsPrinting(true);
  };

  const handlePasscodeSuccess = (code: string) => {
    if (code === "BIOMETRIC_PASS" || code === String(appPin || '0609')) {
      if (passcodeAction?.type === 'delete') handleDeleteLog(passcodeAction.log, passcodeAction.direction);
      else { 
        setEditingLog(passcodeAction!.log); 
        setEditFormData({ ...passcodeAction!.log }); 
        setEditDirection(passcodeAction!.direction);
      }
      setIsPasscodeOpen(false);
    } else throw new Error("INCORRECT");
  };

  const handleDeleteLog = async (logToDel: SupplyLog, direction: 'in' | 'out') => {
    if (!logToDel || !activeTabName) return;
    setIsUpdatingLog(true);
    const isIncome = direction === 'in';
    const newStock = record.amount + (isIncome ? -logToDel.amount : logToDel.amount);
    
    ignoreRemoteUpdates.current = true;
    setTimeout(() => { ignoreRemoteUpdates.current = false; }, 2000);

    try {
      if (!scriptUrl) {
        const subTab = activeTabName + (isIncome ? " Incoming" : " Outgoing");
        if (onLogAction) onLogAction(logToDel as unknown as DebtRecord, 'delete', subTab);
        onUpdateRecord({ ...record, amount: newStock });
        if (isIncome) setIncomingLogs(prev => prev.filter(l => l.id !== logToDel.id));
        else setOutgoingLogs(prev => prev.filter(l => l.id !== logToDel.id));
      } else {
        const tName = `${activeTabName} ${isIncome ? 'Incoming' : 'Outgoing'}`;
        onUpdateRecord({ ...record, amount: newStock });
        await fetch(scriptUrl, { method: 'POST', body: JSON.stringify({ action: 'deleteRecord', tab: tName, id: logToDel.id }) });
        ignoreRemoteUpdates.current = false; 
        await fetchLogs();
      }
    } catch (e) { alert("Failed"); ignoreRemoteUpdates.current = false; } finally { setIsUpdatingLog(false); setPasscodeAction(null); }
  };

  const submitLogUpdate = async () => {
    if (!activeTabName || !editingLog) return;
    const currentEditingLog = editingLog;
    const currentEditFormData = editFormData;
    
    setIsUpdatingLog(true);
    const diff = (Number(currentEditFormData.amount) || 0) - (currentEditingLog.amount || 0);
    const isIncome = editDirection === 'in';
    const newStock = record.amount + (isIncome ? diff : -diff);

    ignoreRemoteUpdates.current = true;
    setTimeout(() => { ignoreRemoteUpdates.current = false; }, 2000);

    try {
      const subTab = activeTabName + (isIncome ? " Incoming" : " Outgoing");
      const updatedLog = { ...currentEditingLog, ...currentEditFormData, amount: Number(currentEditFormData.amount) } as SupplyLog;

      if (!scriptUrl) {
         if (onLogAction) onLogAction(updatedLog as unknown as DebtRecord, 'update', subTab);
         onUpdateRecord({ ...record, amount: newStock });
         if (isIncome) setIncomingLogs(prev => prev.map(l => l.id === currentEditingLog.id ? updatedLog : l));
         else setOutgoingLogs(prev => prev.map(l => l.id === currentEditingLog.id ? updatedLog : l));
         setEditingLog(null);
      } else {
        setEditingLog(null);
        onUpdateRecord({ ...record, amount: newStock });
        if (isIncome) setIncomingLogs(prev => prev.map(l => l.id === currentEditingLog.id ? updatedLog : l));
        else setOutgoingLogs(prev => prev.map(l => l.id === currentEditingLog.id ? updatedLog : l));
        setIsUpdatingLog(false);

        await fetch(scriptUrl, { method: 'POST', body: JSON.stringify({ action: 'updateRecord', tab: subTab, record: updatedLog }) });
        ignoreRemoteUpdates.current = false;
        await fetchLogs();
      }
    } catch (e) { alert("Failed"); ignoreRemoteUpdates.current = false; } finally { setIsUpdatingLog(false); setPasscodeAction(null); }
  };

  const renderLogList = (logs: SupplyLog[], type: 'in' | 'out') => (
    <div className="flex flex-col absolute inset-0 p-5">
      {isLoadingLogs ? (
        <div className="flex flex-col items-center justify-center absolute inset-0 gap-3 bg-white/80 z-20"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div><span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Logs...</span></div>
      ) : (
        <>
          <div className="shrink-0 space-y-3 mb-4">
             <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                <div className="flex-1 space-y-1"><label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><CalendarIcon /> Start</label><input type="date" className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-[10px] font-bold outline-none" value={startDate} onChange={e => setStartDate(e.target.value)}/></div>
                <div className="flex-1 space-y-1"><label className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><CalendarIcon /> End</label><input type="date" className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-[10px] font-bold outline-none" value={endDate} onChange={e => setEndDate(e.target.value)}/></div>
             </div>
             <div className="flex items-center justify-between gap-1.5">
                <button onClick={() => setSortBy(prev => prev === 'date-desc' ? 'date-asc' : 'date-desc')} className="px-3 py-2 bg-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"><SortIcon /> Date</button>
                {isProductType && <button onClick={() => canCalculation ? (type === 'out' ? setIsCalcOpen(true) : setIsIncomingCalcOpen(true)) : null} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1 shadow-sm"><CalculatorIcon /> Stats</button>}
                <div className="flex gap-1">
                  <button 
                    onClick={() => handlePrintLogs(logs, type === 'in' ? 'Incoming' : 'Outgoing')} 
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-white shadow-md active:scale-95 transition-all"
                  >
                    <PrinterIcon />
                    <span className="text-[9px] font-black uppercase tracking-widest">Print Log</span>
                  </button>
                  <button onClick={() => handleCopyLogs(logs, type === 'in' ? 'Incoming' : 'Outgoing')} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase bg-blue-50 text-blue-600 shadow-sm transition-all active:scale-95`}>{copyStatus ? 'Copied' : 'Copy'}</button>
                </div>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-8 overscroll-contain">
            {logs.length === 0 ? <p className="text-[10px] text-center text-slate-400 font-black mt-10 uppercase tracking-widest opacity-50">No activity logged for this period</p> : 
            logs.map((log, i) => (
              <div key={i} onClick={() => setSelectedLogId(selectedLogId === log.id ? null : (log.id || null))} className={`bg-white border ${selectedLogId === log.id ? 'border-blue-400 shadow-md' : 'border-slate-100 shadow-sm'} p-3 rounded-2xl flex flex-col gap-1 transition-all active:scale-[0.98]`}>
                <div className="flex justify-between items-start">
                   <div className="min-w-0 flex-1"><p className={`text-[10px] font-black uppercase truncate ${type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>{log.supplySource || 'Source'}</p><p className="text-[9px] font-bold text-slate-400">{formatDateMD(log.date)}</p></div>
                   <div className="flex items-center gap-3"><span className={`text-base font-black ${type === 'in' ? 'text-emerald-700' : 'text-rose-700'}`}>{type === 'in' ? '+' : '-'}{log.amount}</span>
                   {selectedLogId === log.id && <div className="flex gap-1 animate-in slide-in-from-right-2"><button onClick={(e) => { e.stopPropagation(); initiateAction('edit', log, type); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shadow-sm"><EditIcon/></button><button onClick={(e) => { e.stopPropagation(); initiateAction('delete', log, type); }} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg shadow-sm"><TrashIcon/></button></div>}
                   </div>
                </div>
                {log.remarks && <p className="text-[9px] text-slate-500 italic mt-0.5 truncate border-l-2 border-slate-200 pl-2">"{log.remarks}"</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const initiateAction = (type: 'edit' | 'delete', log: SupplyLog, direction: 'in' | 'out') => {
    setPasscodeAction({ type, log, direction });
    if (!scriptUrl) {
      setIsDualConfirmOpen(true);
    } else {
      setIsPasscodeOpen(true);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[450px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-[85vh] overflow-hidden border border-slate-100">
        <div className="p-6 pb-4 flex justify-between items-start shrink-0">
          <div className="min-w-0 flex-1"><h2 className="text-xl font-black text-slate-900 leading-tight truncate uppercase">{record.name}</h2><div className="flex items-center gap-2 mt-1">{isProductType && <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">{record.itemCode || 'NO-CODE'}</span>}{isLowStock && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 animate-pulse"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Low Stock</span>}</div></div>
          <div className="text-right shrink-0"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">In Stock</span><p className={`text-2xl font-black ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>{record.amount}</p></div>
        </div>
        <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0">{tabOrder.map(tab => (<button key={tab} onClick={() => { setActiveTab(tab); setSelectedLogId(null); }} className={`flex-1 py-3 text-[9px] font-black uppercase relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400'}`}>{tab}{activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}</button>))}</div>
        <div className="flex-1 relative overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}><div className={`absolute inset-0 flex transition-transform duration-300 ${isSwiping ? '' : 'ease-out'}`} style={{ transform: `translateX(calc(-${currentIndex * 100}% + ${swipeOffset}px))` }}>
          <div className="w-full h-full shrink-0 p-6 space-y-6 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-2 gap-3"><div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100"><span className="text-[8px] font-black text-slate-400 uppercase">Asset Value</span><span className="text-lg font-black text-slate-900">{formatCurrency((record.amount * (record.price || 0)) * rate, currentCurrency)}</span></div><div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100"><span className="text-[8px] font-black text-slate-400 uppercase">Unit Price</span><span className="text-lg font-black text-slate-900">{formatCurrency((record.price || 0) * rate, currentCurrency)}</span></div></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm"><div className="flex justify-between"><span className="text-xs font-bold text-slate-600">Reorder Level</span><span className="text-sm font-black text-slate-900">{record.minAmount ?? '---'}</span></div><div className="flex justify-between"><span className="text-xs font-bold text-slate-600">Capacity Limit</span><span className="text-sm font-black text-slate-900">{record.maxAmount ?? '---'}</span></div></div>
            <div className="grid grid-cols-2 gap-3"><div className="bg-emerald-50 p-3 rounded-2xl text-emerald-700 font-black border border-emerald-100"><span className="text-[8px] uppercase tracking-widest">Incoming</span><p className="text-xl leading-none mt-1">{incomingStats.overallUnits}</p></div><div className="bg-rose-50 p-3 rounded-2xl text-rose-700 font-black border border-rose-100"><span className="text-[8px] uppercase tracking-widest">Outgoing</span><p className="text-xl leading-none mt-1">{outgoingStats.overallUnits}</p></div></div>
            <div className="pt-4 flex flex-col gap-2"><button onClick={() => onEdit(record)} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 text-xs uppercase tracking-widest">Edit Entry Details</button><button onClick={() => onDelete(record.id)} className="w-full py-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest hover:text-rose-600">Remove Item</button></div>
          </div>
          <div className="w-full h-full shrink-0 relative">{renderLogList(sortedIncoming, 'in')}</div>
          <div className="w-full h-full shrink-0 relative">{renderLogList(sortedOutgoing, 'out')}</div>
        </div></div>
        <div className="p-4 border-t border-slate-100 bg-white shrink-0"><button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase shadow-inner active:scale-95 transition-all">Close</button></div>
      </div>
      {isPasscodeOpen && <PasscodeModal isOpen={true} onClose={() => setIsPasscodeOpen(false)} onSuccess={handlePasscodeSuccess} title="Security Check" message={`Enter PIN to authorize changes.`} biometricEnabled={biometricEnabled} />}
      {isDualConfirmOpen && (
        <DualConfirmModal
          isOpen={true}
          onClose={() => { setIsDualConfirmOpen(false); setPasscodeAction(null); }}
          onConfirm={() => {
            setIsDualConfirmOpen(false);
            const action = passcodeAction; // Capture current state before close
            if (action?.type === 'delete') {
                handleDeleteLog(action.log, action.direction);
            } else if (action?.type === 'edit') { 
                setEditingLog(action.log); 
                setEditFormData({ ...action.log });
                setEditDirection(action.direction);
            }
          }}
          title={passcodeAction?.type === 'delete' ? "Delete Log Entry" : "Edit Log Entry"}
          message={passcodeAction?.type === 'delete' 
            ? "Removing this entry will adjust the main stock quantity accordingly. This action is permanent."
            : "Authorized editing of activity log entry."}
        />
      )}
      {editingLog && <div className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm animate-in fade-in duration-200"><div className="w-full max-w-xs bg-white rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4"><h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight">Modify Log Entry</h3><div className="space-y-4"><div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Quantity</label><input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-center text-xl outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner" value={editFormData.amount || ''} onChange={e => setEditFormData({...editFormData, amount: Number(e.target.value)})}/></div><div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Log Date</label><input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-center outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner" value={editFormData.date || ''} onChange={e => setEditFormData({...editFormData, date: e.target.value})}/></div><div className="space-y-1"><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label><input type="text" placeholder="Remarks..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner" value={editFormData.remarks || ''} onChange={e => setEditFormData({...editFormData, remarks: e.target.value})}/></div></div><div className="flex flex-col gap-2 pt-2"><button onClick={submitLogUpdate} className="py-4 bg-blue-600 text-white font-black rounded-2xl uppercase shadow-xl shadow-blue-100 active:scale-95 transition-all">Update Entry</button><button onClick={() => setEditingLog(null)} className="py-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cancel</button></div></div></div>}
      {(isCalcOpen || isIncomingCalcOpen) && <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 p-6 animate-in fade-in duration-200" onClick={() => { setIsCalcOpen(false); setIsIncomingCalcOpen(false); }}><div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}><h3 className="text-lg font-black text-slate-900 mb-6 uppercase flex items-center gap-2"><CalculatorIcon /> Statistics</h3><div className="space-y-3">{isCalcOpen ? <><div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales</span><span className="font-black text-slate-900 text-xs">{outgoingStats.sales.units} ({formatCurrency(outgoingStats.sales.price * rate, currentCurrency)})</span></div><div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gifts</span><span className="font-black text-slate-900 text-xs">{outgoingStats.giveaway.units} ({formatCurrency(outgoingStats.giveaway.price * rate, currentCurrency)})</span></div><div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loss</span><span className="font-black text-slate-900 text-xs">{outgoingStats.disposal.units} ({formatCurrency(outgoingStats.disposal.price * rate, currentCurrency)})</span></div><div className="h-px bg-slate-100 my-2" /><div className="flex justify-between text-base font-black text-rose-600 px-1"><span>TOTAL</span><span>{outgoingStats.overallUnits}</span></div></> : <><div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Output</span><span className="font-black text-slate-900 text-xs">{incomingStats.production.units} ({formatCurrency(incomingStats.production.price * rate, currentCurrency)})</span></div><div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery</span><span className="font-black text-slate-900 text-xs">{incomingStats.delivery.units} ({formatCurrency(incomingStats.delivery.price * rate, currentCurrency)})</span></div><div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Returns</span><span className="font-black text-slate-900 text-xs">{incomingStats.returns.units} ({formatCurrency(incomingStats.returns.price * rate, currentCurrency)})</span></div><div className="h-px bg-slate-100 my-2" /><div className="flex justify-between text-base font-black text-emerald-600 px-1"><span>TOTAL</span><span>{incomingStats.overallUnits}</span></div></>}</div><div className="flex gap-2 mt-8"><button onClick={isCalcOpen ? handleCopyOutgoingStats : handleCopyIncomingStats} className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase shadow-lg shadow-blue-100 active:scale-95 transition-all">{isCalcOpen ? (outgoingCopyStatus ? 'COPIED' : 'COPY ALL') : (incomingCopyStatus ? 'COPIED' : 'COPY ALL')}</button><button onClick={() => { setIsCalcOpen(false); setIsIncomingCalcOpen(false); }} className="flex-1 py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] uppercase shadow-inner active:scale-95 transition-all">Close</button></div></div></div>}
      
      {isPrinting && printData && (
        <PrintLayout 
          title={`${activeTab === 'incoming' ? 'INCOMING' : 'OUTGOING'} LOGS: ${record.name}`} 
          subtitle={`${formatDateMD(startDate)} to ${formatDateMD(endDate)}`}
          columns={[
            { header: 'Date', accessor: (l: SupplyLog) => formatDateMD(l.date), width: '20%' },
            { header: 'Source', accessor: (l: SupplyLog) => l.supplySource.toUpperCase(), width: '25%' },
            { header: 'Remarks', accessor: (l: SupplyLog) => l.remarks, width: '35%' },
            { header: 'Qty', accessor: (l: SupplyLog) => l.amount, align: 'right', width: '20%' }
          ]}
          data={printData.logs}
          summary={[
            { label: 'Total Quantity', value: printData.logs.reduce((s, l) => s + l.amount, 0).toString() },
            { label: 'Estimated Value', value: formatCurrency(printData.logs.reduce((s, l) => s + l.amount, 0) * (record.price || 0) * rate, currentCurrency) }
          ]}
          onClose={() => setIsPrinting(false)} 
        />
      )}
    </div>,
    document.body
  );
};

export default SupplyDetailModal;