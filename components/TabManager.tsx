
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TabType } from '../types';

interface TabManagerProps {
  tabs: string[];
  activeTab: string;
  tabTypes: Record<string, TabType>;
  onSwitch: (tab: string) => void;
  onAdd: () => void;
  onRename: (tab: string) => void;
  onDelete: (tab: string) => void;
  onRearrange: (newOrder: string[]) => void;
  lastDashboardInteraction?: number; // Signal from App.tsx to snap back
  showAddButton?: boolean;
}

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const MoreVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;

const WalletIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const CarIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>;
const TrendingUpSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const PackageIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const BriefcaseIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const PiggyBankIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1 .5-1.5 1-2 0-2.5-1.5-4.5-4-4Z"/><path d="M7 14h.01"/><path d="M9 18v-2h6v2"/></svg>;
const LayersIconSmall = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.27a2 2 0 0 0 0 3.66l9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09a2 2 0 0 0 0-3.66z"/><path d="m2.1 14.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/><path d="m2.1 19.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09"/></svg>;

const TabManager: React.FC<TabManagerProps> = ({ tabs, activeTab, tabTypes, onSwitch, onAdd, onRename, onDelete, onRearrange, lastDashboardInteraction, showAddButton = true }) => {
  const [menuData, setMenuData] = useState<{ tab: string, x: number, y: number } | null>(null);
  const [localTabs, setLocalTabs] = useState<string[]>(tabs);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const isInteractingRef = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef(0);
  const initialScrollLeftRef = useRef(0); // Capture scroll pos at start of drag
  const returnTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Auto-scroll refs
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const lastTouchXRef = useRef(0);
  const scrollDirectionRef = useRef<0 | 1 | -1>(0); // 0: none, 1: right, -1: left
  const scrollSpeedRef = useRef(0);

  useEffect(() => {
    setLocalTabs(tabs);
  }, [tabs]);

  const localTabsRef = useRef(localTabs);
  useEffect(() => {
    localTabsRef.current = localTabs;
  }, [localTabs]);

  const scrollToActiveTab = useCallback(() => {
    const activeIndex = tabs.indexOf(activeTab);
    const activeEl = tabRefs.current[activeIndex];
    if (activeEl && containerRef.current && !isDragging) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeTab, tabs, isDragging]);

  const startReturnTimer = useCallback(() => {
    if (returnTimeoutRef.current) window.clearTimeout(returnTimeoutRef.current);
    if (isInteractingRef.current) return;
    
    returnTimeoutRef.current = window.setTimeout(() => {
      scrollToActiveTab();
    }, 6000); 
  }, [scrollToActiveTab]);

  useEffect(() => {
    scrollToActiveTab();
    if (returnTimeoutRef.current) window.clearTimeout(returnTimeoutRef.current);
  }, [activeTab, lastDashboardInteraction, scrollToActiveTab]);

  const handleTabSwitch = (tab: string) => {
    if (isDragging) return;
    if (activeTab !== tab) {
      onSwitch(tab);
    }
  };

  const handleOpenMenu = (e: React.MouseEvent, tab: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 160; 
    const menuHeight = 140; 
    const screenPadding = 12;

    let x = rect.right + 8;
    let y = rect.top - 8;

    if (x + menuWidth > window.innerWidth - screenPadding) {
      x = rect.left - menuWidth - 8;
    }
    if (x < screenPadding) x = screenPadding;
    if (y + menuHeight > window.innerHeight - screenPadding) {
      y = window.innerHeight - menuHeight - screenPadding;
    }
    if (y < screenPadding) y = screenPadding;

    setMenuData({ tab, x, y });
  };

  const checkAndPerformSwap = useCallback((currentClientX: number) => {
    if (draggedIndex === null) return;
    
    const draggedElRect = tabRefs.current[draggedIndex]?.getBoundingClientRect();
    if (!draggedElRect) return;

    const currentCenterX = draggedElRect.left + (draggedElRect.width / 2);
    
    let targetIndex = draggedIndex;
    tabRefs.current.forEach((ref, idx) => {
      if (!ref || idx === draggedIndex) return;
      const rect = ref.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      if (idx < draggedIndex && currentCenterX < centerX) targetIndex = Math.min(targetIndex, idx);
      if (idx > draggedIndex && currentCenterX > centerX) targetIndex = Math.max(targetIndex, idx);
    });

    if (targetIndex !== draggedIndex) {
      if (window.navigator.vibrate) window.navigator.vibrate(25);
      const updated = [...localTabsRef.current];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, removed);
      
      setLocalTabs(updated);
      setDraggedIndex(targetIndex);
      
      // CRITICAL: When the tab changes position in the DOM, we must reset the reference system
      // to keep the movement relative to the finger consistent.
      touchStartXRef.current = currentClientX;
      if (containerRef.current) {
        initialScrollLeftRef.current = containerRef.current.scrollLeft;
      }
      setDragOffset(0);
    }
  }, [draggedIndex]);

  const startAutoScroll = useCallback(() => {
    if (scrollAnimationFrameRef.current) return;

    const scrollLoop = () => {
      if (containerRef.current && scrollDirectionRef.current !== 0) {
        const speed = scrollSpeedRef.current;
        containerRef.current.scrollLeft += scrollDirectionRef.current * speed;
        
        // RECALCULATE OFFSET: Since the container scrolled, the tab's natural position 
        // shifted. We update dragOffset to counter the scroll delta and stay under the finger.
        const scrollDelta = containerRef.current.scrollLeft - initialScrollLeftRef.current;
        const touchDelta = lastTouchXRef.current - touchStartXRef.current;
        setDragOffset(touchDelta + scrollDelta);
        
        checkAndPerformSwap(lastTouchXRef.current);
      }
      scrollAnimationFrameRef.current = requestAnimationFrame(scrollLoop);
    };
    scrollAnimationFrameRef.current = requestAnimationFrame(scrollLoop);
  }, [checkAndPerformSwap]);

  const stopAutoScroll = useCallback(() => {
    if (scrollAnimationFrameRef.current) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }
    scrollDirectionRef.current = 0;
  }, []);

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    e.stopPropagation();
    isInteractingRef.current = true;
    if (returnTimeoutRef.current) window.clearTimeout(returnTimeoutRef.current);
    
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    lastTouchXRef.current = touch.clientX;
    if (containerRef.current) {
      initialScrollLeftRef.current = containerRef.current.scrollLeft;
    }
    
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    
    if (showAddButton) {
      longPressTimerRef.current = window.setTimeout(() => {
        setDraggedIndex(index);
        setIsDragging(true);
        if (window.navigator.vibrate) window.navigator.vibrate([40]);
        longPressTimerRef.current = null;
        startAutoScroll();
      }, 450);
    }
  };

  const handleContainerTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    isInteractingRef.current = true;
    if (returnTimeoutRef.current) window.clearTimeout(returnTimeoutRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    lastTouchXRef.current = touch.clientX;

    if (longPressTimerRef.current && !isDragging) {
      const moveDist = Math.abs(touch.clientX - touchStartXRef.current);
      if (moveDist > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    if (isDragging && draggedIndex !== null && containerRef.current) {
      e.preventDefault();
      
      // Calculate offset including scroll delta to stick to finger
      const scrollDelta = containerRef.current.scrollLeft - initialScrollLeftRef.current;
      const touchDelta = touch.clientX - touchStartXRef.current;
      setDragOffset(touchDelta + scrollDelta);

      // Edge detection for auto-scroll
      const containerRect = containerRef.current.getBoundingClientRect();
      const edgeThreshold = 60; 
      const distFromLeft = touch.clientX - containerRect.left;
      const distFromRight = containerRect.right - touch.clientX;

      if (distFromLeft < edgeThreshold) {
        scrollDirectionRef.current = -1;
        scrollSpeedRef.current = Math.max(2, (edgeThreshold - distFromLeft) / 4);
      } else if (distFromRight < edgeThreshold) {
        scrollDirectionRef.current = 1;
        scrollSpeedRef.current = Math.max(2, (edgeThreshold - distFromRight) / 4);
      } else {
        scrollDirectionRef.current = 0;
      }

      checkAndPerformSwap(touch.clientX);
    }
  };

  const handleTouchEnd = () => {
    isInteractingRef.current = false;
    stopAutoScroll();

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    if (isDragging) {
      setIsDragging(false);
      setDraggedIndex(null);
      setDragOffset(0);
      if (JSON.stringify(localTabs) !== JSON.stringify(tabs)) {
        onRearrange(localTabs);
      }
    }
    startReturnTimer();
  };

  const getFormatIcon = (tabName: string) => {
    const type = tabTypes[tabName] || 'debt';
    if (type === 'rent') return <CarIconSmall />;
    if (type === 'cashflow') return <TrendingUpSmall />;
    if (type === 'supply') return <PackageIconSmall />;
    if (type === 'product') return <LayersIconSmall />;
    if (type === 'salary') return <BriefcaseIconSmall />;
    if (type === 'business') return <BriefcaseIconSmall />;
    if (type === 'savings') return <PiggyBankIconSmall />;
    return <WalletIconSmall />;
  };

  return (
    <div className="flex items-center border-t border-slate-100 bg-white relative">
      <div 
        ref={containerRef}
        onScroll={() => {
          if (returnTimeoutRef.current) window.clearTimeout(returnTimeoutRef.current);
          if (!isInteractingRef.current) startReturnTimer();
        }}
        className={`flex-1 overflow-x-auto no-scrollbar overscroll-x-contain flex items-center px-3 py-2 gap-2 ${isDragging ? 'overflow-x-hidden touch-none' : ''}`}
        onTouchStart={handleContainerTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {localTabs.map((tab, idx) => {
          const isActive = activeTab === tab;
          const isBeingDragged = draggedIndex === idx;
          const type = tabTypes[tab] || 'debt';

          return (
            <div 
              key={tab}
              ref={el => tabRefs.current[idx] = el}
              className={`relative flex items-center shrink-0 transition-all duration-300 ease-[cubic-bezier(0.2,1,0.3,1)] ${isBeingDragged ? 'z-50' : 'z-10'}`}
              style={{
                transform: isBeingDragged ? `translateX(${dragOffset}px) scale(1.1)` : 'translateX(0)',
                opacity: isDragging && !isBeingDragged ? 0.5 : 1,
                transition: isBeingDragged ? 'none' : undefined,
                filter: isBeingDragged ? 'drop-shadow(0 15px 35px rgba(0,0,0,0.2))' : 'none'
              }}
              onTouchStart={(e) => handleTouchStart(e, idx)}
            >
              <button
                onClick={() => handleTabSwitch(tab)}
                className={`px-4 py-3 text-[13px] font-black rounded-2xl transition-all flex items-center gap-2 select-none border-2 tracking-tight ${
                  isActive
                    ? (type === 'rent' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : type === 'cashflow' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : type === 'supply' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' : type === 'product' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' : 'bg-blue-50 text-blue-600 border-blue-100')
                    : 'bg-white text-slate-400 border-transparent hover:text-slate-600'
                } ${isBeingDragged ? 'bg-white border-blue-500 text-blue-600 shadow-xl' : ''}`}
              >
                <span className={`${isActive || isBeingDragged ? (type === 'rent' ? 'text-indigo-500' : type === 'cashflow' ? 'text-emerald-500' : (type === 'supply' || type === 'product') ? 'text-cyan-500' : 'text-blue-500') : 'text-slate-300'}`}>
                  {getFormatIcon(tab)}
                </span>
                {tab}
              </button>
              
              {isActive && !isDragging && showAddButton && (
                <div className="flex items-center ml-1 animate-in fade-in zoom-in-95 duration-300">
                  <button 
                    onClick={(e) => handleOpenMenu(e, tab)}
                    className={`p-2 rounded-xl transition-colors ${menuData?.tab === tab ? 'bg-blue-100 text-blue-700' : 'text-slate-300 hover:text-blue-50'}`}
                  >
                    <MoreVerticalIcon />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showAddButton && (
        <button 
          onClick={onAdd}
          className="mx-4 p-3.5 bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90 shrink-0"
        >
          <PlusIcon />
        </button>
      )}

      {menuData && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[6000]" 
            onClick={() => setMenuData(null)}
          />
          <div 
            className="fixed z-[6001] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 py-1.5 w-40 overflow-hidden animate-in zoom-in-95 duration-150"
            style={{ top: menuData.y, left: menuData.x }}
          >
            <div className="px-3.5 py-1.5 border-b border-slate-50 mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{menuData.tab}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onRename(menuData.tab); setMenuData(null); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-blue-50 text-blue-700 transition-colors text-xs font-bold"
            >
              <div className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg"><EditIcon /></div>
              Edit Section
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(menuData.tab); setMenuData(null); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-red-50 text-red-600 transition-colors text-xs font-bold"
            >
              <div className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-500 rounded-lg"><TrashIcon /></div>
              Delete Section
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default TabManager;
