
import React from 'react';
import { DebtRecord } from '../types';
import { formatDateMD, formatPHP } from '../utils';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  signedRecords: DebtRecord[];
  onOpenContract: (record: DebtRecord) => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10.01 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, signedRecords, onOpenContract }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-inner">
              <CheckBadgeIcon />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">Signed Contracts</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Agreement Inbox</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-4 px-1">
          {signedRecords.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <PenIcon />
              </div>
              <p className="text-slate-400 font-bold text-sm">No signed agreements yet.</p>
              <p className="text-slate-300 text-[10px] mt-1 font-medium uppercase tracking-wider">Contracts will appear here</p>
            </div>
          ) : (
            signedRecords.map((record) => (
              <button 
                key={record.id}
                onClick={() => { onOpenContract(record); onClose(); }}
                className="w-full flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-emerald-200 active:bg-emerald-50 active:scale-[0.98] transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <div className="flex-1 min-w-0 ml-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-900 text-sm truncate uppercase">{record.name}</h3>
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Signed</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <span>{record.tab}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{formatDateMD(record.date)}</span>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-slate-800">{formatPHP(record.amount)}</p>
                   {record.signatureDate && <p className="text-[9px] font-bold text-emerald-600">{new Date(record.signatureDate).toLocaleDateString()}</p>}
                </div>
              </button>
            ))
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 mt-2 bg-slate-50 text-slate-500 font-black rounded-2xl active:bg-slate-100 active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          Close Inbox
        </button>
      </div>
    </div>
  );
};

export default NotificationsModal;
