import React, { useState, useRef, useMemo, memo } from 'react';
import { DebtRecord, TabType, AppSettings } from '../types';
import { formatPHP, getTodayStr } from '../utils';

interface GlobalCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRecords: Record<string, DebtRecord[]>;
  tabs: string[];
  settings: AppSettings;
  isSyncing?: boolean;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const CloudSyncIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m7.8 16.2-2.9 2.9"/><path d="M2 12h4"/><path d="m7.8 7.8-2.9-2.9"/></svg>;

const StatItem = memo(({ label, value, colorClass = "text-slate-900", isCurrency = true, isHighlighted = false, theme = "blue" }: { label: string, value: number, colorClass?: string, isCurrency?: boolean, isHighlighted?: boolean, theme?: "blue" | "violet" }) => {
  const highlightBg = theme === "violet" ? "bg-violet-600 border-violet-500 shadow-violet-100" : "bg-emerald-600 border-emerald-500 shadow-emerald-100";
  const labelColor = isHighlighted ? (theme === "violet" ? "text-violet-50" : "text-emerald-50") : "text-slate-400";

  return (
    <div className={`flex justify-between items-center p-3 rounded-xl border transition-all duration-300 ${isHighlighted ? `${highlightBg} shadow-lg` : 'bg-slate-50 border-slate-100'}`}>
      <span className={`text-[9px] font-black uppercase tracking-widest ${labelColor}`}>{label}</span>
      <span className={`text-sm font-black ${isHighlighted ? 'text-white' : colorClass}`}>{isCurrency ? formatPHP(value) : value.toLocaleString()}</span>
    </div>
  );
});

const GlobalCalculationModal: React.FC<GlobalCalculationModalProps> = ({ isOpen, onClose, allRecords, tabs, settings, isSyncing }) => {
  const [activeTab, setActiveTab] = useState<'debt' | 'rent' | 'flow' | 'business'>('debt');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalGesture = useRef(false);

  const tabOrder: ('debt' | 'rent' | 'flow' | 'business')[] = ['debt', 'rent', 'flow', 'business'];
  const currentIndex = tabOrder.indexOf(activeTab);

  if (!isOpen) return null;

  const metrics = useMemo(() => {
    const todayStr = getTodayStr();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const rentTabs = tabs.filter(t => (settings.tabTypes[t] || 'debt') === 'rent');
    
    const history = settings.deletedHistory || [];
    const currentYearStr = String(currentYear);
    
    const calculatedRentEarnings = history.reduce((acc, r) => {
        if (r.status === 'finished' && r.date && r.date.startsWith(currentYearStr)) {
             if (rentTabs.includes(r.tab || '')) {
                 return acc + (Number(r.amount) || 0);
             }
        }
        return acc;
    }, 0);

    let globalDebt = { overdue: 0, today: 0, nonDue: 0, total: 0 };
    let globalRent = { 
        monthSchedule: 0, 
        yearSchedule: 0, 
        yearEarnings: calculatedRentEarnings + (settings.earningsAdjustments?.year || 0) 
    };
    let globalFlow = { banks: 0, initial: 0, current: 0, incoming: 0, outgoing: 0, net: 0 };
    let globalBusiness = { tabs: 0, capital: 0, expenses: 0, lossCount: 0, lossAmount: 0, profitAmount: 0, net: 0 };

    tabs.forEach(tabName => {
      const type = settings.tabTypes[tabName] || 'debt';
      const records = allRecords[tabName] || [];

      if (type === 'debt') {
        records.forEach(r => {
          globalDebt.total += r.amount;
          if (r.date < todayStr) globalDebt.overdue += r.amount;
          else if (r.date === todayStr) globalDebt.today += r.amount;
          else globalDebt.nonDue += r.amount;
        });
      } else if (type === 'rent') {
        records.forEach(r => {
          const parts = r.date.split('-');
          const startYear = parseInt(parts[0]);
          const startMonth = parseInt(parts[1]);
          if (startYear === currentYear) globalRent.yearSchedule++;
          if (startMonth === currentMonth && startYear === currentYear) globalRent.monthSchedule++;
        });
      } else if (type === 'cashflow') {
        globalFlow.banks++;
        const initial = settings.cashflowInitialBalances?.[tabName] || 0;
        globalFlow.initial += initial;
        let tabIncoming = 0, tabOutgoing = 0;
        records.forEach(r => {
          if (r.transactionType === 'income') tabIncoming += r.amount;
          else if (r.transactionType === 'expense') tabOutgoing += r.amount;
        });
        globalFlow.incoming += tabIncoming;
        globalFlow.outgoing += tabOutgoing;
        globalFlow.net += (tabIncoming - tabOutgoing);
        globalFlow.current += (initial + tabIncoming - tabOutgoing);
      } else if (type === 'business') {
        globalBusiness.tabs++;
        records.forEach(r => {
          if (r.businessEntryType === 'capital') globalBusiness.capital += r.amount;
          else if (r.businessEntryType === 'expense') globalBusiness.expenses += r.amount;
          else if (r.businessEntryType === 'earning') {
            if (r.amount < 0) {
              globalBusiness.lossCount++;
              globalBusiness.lossAmount += Math.abs(r.amount);
            } else {
              globalBusiness.profitAmount += r.amount;
            }
            globalBusiness.net += r.amount;
          }
        });
      }
    });

    return { globalDebt, globalRent, globalFlow, globalBusiness };
  }, [allRecords, settings, tabs]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalGesture.current = false;
    setIsSwiping(false);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    if (!isHorizontalGesture.current) {
      if (Math.abs(diffX) > 5 && Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontalGesture.current = true;
        setIsSwiping(true);
      } else if (Math.abs(diffY) > 5) {
        touchStartX.current = null;
        touchStartY.current = null;
        return;
      }
    }

    if (isHorizontalGesture.current) {
      if (e.cancelable) e.preventDefault();
      let offset = diffX;
      if ((currentIndex === 0 && diffX > 0) || (currentIndex === tabOrder.length - 1 && diffX < 0)) {
        offset = diffX * 0.35;
      }
      setSwipeOffset(offset);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !isHorizontalGesture.current) {
      touchStartX.current = null;
      touchStartY.current = null;
      setIsSwiping(false);
      return;
    }

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = window.innerWidth * 0.18;

    setIsSwiping(false);
    setSwipeOffset(0);

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && currentIndex > 0) {
        setActiveTab(tabOrder[currentIndex - 1]);
        if (window.navigator.vibrate) window.navigator.vibrate(20);
      } else if (diffX < -threshold && currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
        if (window.navigator.vibrate) window.navigator.vibrate(20);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalGesture.current = false;
  };

  const { globalDebt, globalRent, globalFlow, globalBusiness } = metrics;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <CalculatorIcon />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">Global Ledger</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Financial State</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex border-b border-slate-100 shrink-0 relative bg-slate-50/50">
          {tabOrder.map((t, idx) => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-4 text-[9px] font-black uppercase tracking-tighter transition-all relative z-10 ${activeTab === t ? 'text-blue-600' : 'text-slate-400'}`}
            >
              {t === 'debt' ? 'Debt' : t === 'rent' ? 'Rent' : t === 'flow' ? 'Flow' : 'Business'}
              {activeTab === t && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in fade-in slide-in-from-bottom-1 duration-300" />
              )}
            </button>
          ))}
        </div>

        <div 
          className="relative flex-1 overflow-hidden"
          style={{ touchAction: isSwiping ? 'none' : 'auto' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className={`flex h-full will-change-transform gpu-layer ${!isSwiping ? 'transition-transform duration-300' : ''}`}
            style={{ 
              transform: `translate3d(calc(-${currentIndex * 100}% + ${swipeOffset}px), 0, 0.1px)`,
              backfaceVisibility: 'hidden',
              pointerEvents: isSwiping ? 'none' : 'auto'
            }}
          >
            {/* DEBT TAB */}
            <div className="w-full shrink-0 p-5 space-y-2 overflow-y-auto no-scrollbar max-h-[60vh] gpu-layer" style={{ contain: 'content' }}>
              <div className="text-center mb-2"><span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Debt Summary</span></div>
              <StatItem label="Global Overdue" value={globalDebt.overdue} colorClass="text-red-600" />
              <StatItem label="Global Today Due" value={globalDebt.today} colorClass="text-blue-600" />
              <StatItem label="Global Non Due" value={globalDebt.nonDue} colorClass="text-slate-600" />
              <div className="h-px bg-slate-50 my-1" />
              <StatItem label="Global Debt Total" value={globalDebt.total} isHighlighted={true} />
            </div>

            {/* RENT TAB */}
            <div className="w-full shrink-0 p-5 space-y-2 overflow-y-auto no-scrollbar max-h-[60vh] gpu-layer" style={{ contain: 'content' }}>
              <div className="text-center mb-2"><span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">Rental Summary</span></div>
              <StatItem label="Global Month Schedule" value={globalRent.monthSchedule} isCurrency={false} colorClass="text-indigo-600" />
              <StatItem label="Global Year Schedule" value={globalRent.yearSchedule} isCurrency={false} colorClass="text-indigo-400" />
              <div className="h-px bg-slate-50 my-1" />
              <StatItem label="Global Year Earnings" value={globalRent.yearEarnings} isHighlighted={true} />
            </div>

            {/* FLOW TAB */}
            <div className="w-full shrink-0 p-5 space-y-2 overflow-y-auto no-scrollbar max-h-[60vh] gpu-layer" style={{ contain: 'content' }}>
              <div className="text-center mb-2"><span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Cash Flow Summary</span></div>
              <StatItem label="Global Banks (Tabs)" value={globalFlow.banks} isCurrency={false} colorClass="text-emerald-600" />
              <StatItem label="Global Bank Initial" value={globalFlow.initial} colorClass="text-slate-600" />
              <StatItem label="Global Bank Current" value={globalFlow.current} colorClass="text-emerald-700" />
              <StatItem label="Global Incomming" value={globalFlow.incoming} colorClass="text-emerald-500" />
              <StatItem label="Global Outgoing" value={globalFlow.outgoing} colorClass="text-rose-500" />
              <div className="h-px bg-slate-50 my-1" />
              <StatItem label="Global Net Balance" value={globalFlow.net} isHighlighted={true} />
            </div>

            {/* BUSINESS TAB */}
            <div className="w-full shrink-0 p-5 space-y-2 overflow-y-auto no-scrollbar max-h-[60vh] gpu-layer" style={{ contain: 'content' }}>
              <div className="text-center mb-2 flex items-center justify-center gap-2">
                <BriefcaseIcon />
                <span className="text-[9px] font-black text-violet-500 uppercase tracking-[0.2em]">Business Summary</span>
              </div>
              <StatItem label="Global Business No." value={globalBusiness.tabs} isCurrency={false} colorClass="text-violet-600" />
              <StatItem label="Global Capital" value={globalBusiness.capital} colorClass="text-violet-500" />
              <StatItem label="Global Expenses" value={globalBusiness.expenses} colorClass="text-rose-400" />
              <StatItem label="Global Loss Business" value={globalBusiness.lossCount} isCurrency={false} colorClass="text-rose-600" />
              <StatItem label="Global Loss Amount" value={globalBusiness.lossAmount} colorClass="text-rose-700" />
              <StatItem label="Global Business Earnings" value={globalBusiness.profitAmount} colorClass="text-emerald-600" />
              <div className="h-px bg-slate-50 my-1" />
              <StatItem label="Global Net Income" value={globalBusiness.net} isHighlighted={true} theme="violet" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 shrink-0 space-y-3">
          <div className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-emerald-500 animate-ping' : 'bg-emerald-400'}`}></div>
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
              <CloudSyncIcon /> {isSyncing ? 'Cloud Sync in Progress' : 'Cloud Dashboard in Sync'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-black text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            Close Calculation
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalCalculationModal;