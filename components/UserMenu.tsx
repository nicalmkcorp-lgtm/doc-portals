import React, { useState } from 'react';
import { AppSession } from '../types';

interface UserMenuProps {
  session: AppSession;
  onLogout: () => void;
  onChangePassword: () => void;
  themeColor?: string;
}

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3y-1.5L15.5 7.5z"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const UserMenu: React.FC<UserMenuProps> = ({ session, onLogout, onChangePassword, themeColor = '#db2777' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const displayName = session.isOffline 
    ? 'Personal' 
    : (session.username || 'Master');

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-2xl active:scale-95 transition-all shadow-sm"
      >
        <div 
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
          style={{ backgroundColor: session.role === 'master' ? '#1e293b' : themeColor }}
        >
          <UserIcon />
        </div>
        <div className="text-left pr-1 min-w-0">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1 truncate">Logged In</p>
          <p className="text-[10px] font-black text-slate-800 leading-none truncate max-w-[60px] sm:max-w-[100px] uppercase">
            {displayName}
          </p>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[5000]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[5001] animate-in zoom-in-95 duration-150 origin-top-right">
            <div className="px-4 py-2 border-b border-slate-50 mb-1">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Signed in as</p>
              <p className="text-xs font-black text-slate-800 truncate">{session.isOffline ? 'Personal Account' : (session.username || 'System Administrator')}</p>
            </div>
            
            {session.role === 'user' && !session.isOffline && (
              <button 
                onClick={() => { onChangePassword(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-xs font-bold"
              >
                <KeyIcon /> Change Password
              </button>
            )}

            <button 
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 transition-colors text-xs font-bold"
            >
              <LogoutIcon /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;