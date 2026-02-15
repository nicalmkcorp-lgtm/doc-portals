
import React, { useState, useMemo } from 'react';
import { DebtRecord } from '../types';
import { formatDateShort, formatPHP, getTodayStr, openFacebook } from '../utils';

interface CalendarViewProps {
  records: DebtRecord[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const FacebookLogo = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const PhoneLogo = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const WhatsAppLogo = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L22 2l-2.1 5.4Z"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const PERSON_COLORS = [
  'bg-indigo-400', 'bg-emerald-400', 'bg-rose-400', 'bg-amber-400', 'bg-sky-400',
  'bg-violet-400', 'bg-orange-400', 'bg-teal-400', 'bg-pink-400', 'bg-lime-400',
];

const getPersonColor = (name: string) => {
  if (!name) return 'bg-slate-400';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PERSON_COLORS[Math.abs(hash) % PERSON_COLORS.length];
};

const CalendarView: React.FC<CalendarViewProps> = ({ records, currentDate, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthYearLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const nextMonth = () => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= numDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr, activeRentals: records.filter(r => dateStr >= r.date && dateStr <= (r.endDate || r.date)) });
    }
    return days;
  }, [currentDate, records]);

  const selectedDayRentals = useMemo(() => {
    if (!selectedDate) return [];
    return records.filter(r => selectedDate >= r.date && selectedDate <= (r.endDate || r.date));
  }, [selectedDate, records]);

  const cleanNumberForIntent = (num: string) => {
    if (!num) return '';
    return num.toString().replace(/\D/g, '');
  };

  const todayStr = getTodayStr();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-4 relative min-h-[380px]">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="font-bold text-slate-800 tracking-tight">{monthYearLabel}</h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 active:scale-90"><ChevronLeftIcon /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 active:scale-90"><ChevronRightIcon /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[10px] font-black text-slate-300 uppercase py-1">{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="aspect-square"></div>;
          const hasRentals = d.activeRentals.length > 0;
          const isToday = d.dateStr === todayStr;
          const isSelected = d.dateStr === selectedDate;
          return (
            <button key={d.dateStr} onClick={() => hasRentals && setSelectedDate(d.dateStr)} className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${hasRentals ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100' : 'text-slate-600 hover:bg-slate-50'} ${isToday ? 'border-2 border-emerald-500 !text-emerald-600' : ''} ${isSelected ? 'bg-indigo-600 !text-white ring-0 scale-95 shadow-lg shadow-indigo-200' : ''} ${!hasRentals ? 'cursor-default pointer-events-none' : 'active:scale-95'}`}>
              <span>{d.day}</span>
              {hasRentals && !isSelected && <div className="absolute bottom-1 flex gap-0.5 max-w-full px-1 overflow-hidden">{d.activeRentals.slice(0, 5).map((r, idx) => <div key={`${r.id}-${idx}`} className={`w-1 h-1 rounded-full shrink-0 ${getPersonColor(r.name)}`}></div>)}</div>}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-top duration-300 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <div><h3 className="text-lg font-black text-slate-900 leading-tight">Rental Details</h3><p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{formatDateShort(selectedDate)}</p></div>
            <button onClick={() => setSelectedDate(null)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors active:scale-90"><CloseIcon /></button>
          </div>
          <div className="overflow-y-auto no-scrollbar flex-1 space-y-4 pb-2">
            {selectedDayRentals.map((r, idx) => (
              <div key={`${r.id}-${idx}`} className="bg-slate-50 rounded-3xl border border-slate-100 p-5 space-y-4 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${getPersonColor(r.name)}`}></div>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0"><h4 className="text-base font-black text-slate-800 truncate leading-tight mb-1">{r.name}</h4><div className="flex items-center gap-1 text-indigo-600 text-xs font-bold"><CalendarIcon /> {formatDateShort(r.date)} to {formatDateShort(r.endDate || r.date)}</div></div>
                  <div className="text-lg font-black text-slate-900">{formatPHP(r.amount)}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => r.facebookId && openFacebook(r.facebookId)} disabled={!r.facebookId} title="Facebook Profile" className={`flex items-center justify-center p-3 rounded-2xl active:scale-95 shadow-sm col-span-2 ${r.facebookId ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400 opacity-50'}`}><FacebookLogo /></button>
                  <button onClick={() => r.contactNumber && window.location.assign(`tel:${cleanNumberForIntent(r.contactNumber)}`)} disabled={!r.contactNumber} title="Call Phone" className={`flex items-center justify-center p-3 rounded-2xl active:scale-95 shadow-sm ${r.contactNumber ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-400 opacity-50'}`}><PhoneLogo /></button>
                  <button onClick={() => r.contactNumber && window.open(`https://wa.me/${cleanNumberForIntent(r.contactNumber)}`, '_blank')} disabled={!r.contactNumber} title="WhatsApp" className={`flex items-center justify-center p-3 rounded-2xl active:scale-95 shadow-sm ${r.contactNumber ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400 opacity-50'}`}><WhatsAppLogo /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setSelectedDate(null)} className="w-full py-4 bg-slate-900 text-white text-sm font-bold rounded-2xl active:scale-95 transition-all mt-2">Close Details</button>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
