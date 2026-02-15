import React, { useState } from 'react';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSubmit: (oldPw: string, newPw: string) => Promise<void>;
  username: string;
}

const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3y-1.5L15.5 7.5z"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSubmit, username }) => {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setError("New passwords do not match.");
      return;
    }
    if (newPw.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      await onSubmit(oldPw, newPw);
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[15000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col border border-slate-100">
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <KeyIcon />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">Security</h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1.5">Change Pass</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" 
              value={oldPw}
              onChange={e => setOldPw(e.target.value)}
              placeholder="Old password"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" 
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="At least 4 chars"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" 
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Confirm"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-rose-600 text-[9px] font-black text-center uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {isProcessing ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;