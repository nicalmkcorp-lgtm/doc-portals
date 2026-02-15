import React, { useState } from 'react';

interface AccountModalProps {
  onClose: () => void;
  activeEmail: string;
  savedAccounts: string[];
  onSwitch: (email: string) => void;
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const AccountModal: React.FC<AccountModalProps> = ({ onClose, activeEmail, savedAccounts, onSwitch, onAdd, onRemove }) => {
  const [newEmail, setNewEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail && /^\S+@\S+\.\S+$/.test(newEmail)) {
      onAdd(newEmail);
      setNewEmail('');
      setIsAdding(false);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Google Accounts</h2>
            <p className="text-slate-500 text-xs">Switch between your linked accounts</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar pb-2">
          {savedAccounts.length === 0 && !isAdding && (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No accounts saved yet.</p>
            </div>
          )}

          {savedAccounts.map((email) => (
            <div 
              key={email} 
              className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                activeEmail === email 
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' 
                  : 'bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <button 
                onClick={() => onSwitch(email)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                  activeEmail === email ? 'bg-blue-600' : 'bg-slate-400'
                }`}>
                  {email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800 truncate">{email}</div>
                  {activeEmail === email && (
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <CheckIcon /> Currently Active
                    </div>
                  )}
                </div>
              </button>
              
              <button 
                onClick={() => onRemove(email)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                title="Remove account"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top-2 duration-200">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Account Email</label>
            <div className="flex gap-2">
              <input 
                type="email"
                autoFocus
                placeholder="email@gmail.com"
                className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-100"
              >
                Add
              </button>
            </div>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="mt-2 text-xs text-slate-400 font-semibold hover:text-slate-600"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full mt-4 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
          >
            <UserPlusIcon /> Add Different Account
          </button>
        )}

        <div className="mt-8 text-center text-[10px] text-slate-400 leading-relaxed">
          Switching accounts here updates the context for the Spreadsheet and Apps Script. Make sure the selected account has access to the sheet.
        </div>
      </div>
    </div>
  );
};

export default AccountModal;