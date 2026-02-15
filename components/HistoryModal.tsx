
import React, { useState, useMemo } from 'react';
import { DebtRecord } from '../types';
import { formatDateShort } from '../utils';
import ConfirmModal from './ConfirmModal';

interface HistoryModalProps {
  onClose: () => void;
  history: DebtRecord[];
  onReuse: (record: DebtRecord) => void;
  onDeleteFromHistory: (record: DebtRecord, scrubPerson?: boolean) => void;
  onViewContract: (record: DebtRecord) => void;
}

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const TrashIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const FileTextIcon = ({ size = 16 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;

const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, history = [], onReuse, onDeleteFromHistory, onViewContract }) => {
  const [search, setSearch] = useState('');
  const [recordToDelete, setRecordToDelete] = useState<DebtRecord | null>(null);

  // Get unique persons from history (most recent record for each name)
  const uniqueHistory = useMemo(() => {
    if (!Array.isArray(history)) return [];
    const map = new Map<string, DebtRecord>();
    history.forEach(r => {
      if (!r || !r.name) return;
      const nameKey = r.name.toLowerCase().trim();
      // Always overwrite to ensure we have the latest record's details (contact, etc)
      map.set(nameKey, r);
    });
    // Reverse values to show newest deleted items at top of list visually if they were added last
    return Array.from(map.values()).reverse().filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [history, search]);

  const confirmDelete = () => {
    if (recordToDelete) {
      onDeleteFromHistory(recordToDelete, true);
      setRecordToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
              <HistoryIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">Recently Deleted</h2>
              <p className="text-slate-500 text-xs">Reuse data or manage history</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <CloseIcon />
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-4">
          {uniqueHistory.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-medium">{search ? 'No matches found.' : 'History is empty.'}</p>
            </div>
          ) : (
            uniqueHistory.map((record) => (
              <div 
                key={record.id}
                className="w-full flex items-center gap-2 p-1.5 rounded-2xl border border-slate-100 bg-white group hover:border-blue-200 transition-all"
              >
                <button 
                  onClick={() => onReuse(record)}
                  className="flex-1 flex items-center justify-between p-2.5 text-left active:scale-[0.98] transition-transform overflow-hidden"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="font-bold text-slate-800 truncate mb-0.5 flex items-center gap-2">
                      {record.name}
                      {record.signature && <span className="bg-emerald-100 text-emerald-600 p-0.5 rounded-full"><svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg></span>}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Last: {formatDateShort(record.date)}
                    </div>
                  </div>
                  <div className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Reuse
                  </div>
                </button>
                <div className="flex items-center gap-1 pr-2">
                  {record.signature && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onViewContract(record); 
                      }}
                      className="p-3 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="View Signed Agreement"
                    >
                      <FileTextIcon size={16} />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setRecordToDelete(record);
                    }}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete all history for this person"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-2 py-4 text-slate-500 font-bold text-sm bg-slate-50 rounded-2xl active:bg-slate-100"
        >
          Cancel
        </button>
      </div>

      {recordToDelete && (
        <ConfirmModal 
          isOpen={true}
          onClose={() => setRecordToDelete(null)}
          onConfirm={confirmDelete}
          title="Delete History?"
          message={`Permanently delete ALL history for "${recordToDelete.name}"? This cannot be undone.`}
          confirmText="Delete All"
        />
      )}
    </div>
  );
};

export default HistoryModal;
