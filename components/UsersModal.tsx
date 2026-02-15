import React, { useState } from 'react';
import { AppUser, TabType } from '../types';
import UserForm from './UserForm';
import ConfirmModal from './ConfirmModal';
import LoadingOverlay from './LoadingOverlay';

interface UsersModalProps {
  onClose: () => void;
  users: AppUser[];
  onAddUser: (user: AppUser) => Promise<void>;
  onUpdateUser: (user: AppUser) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  allTabs: string[];
  tabTypes: Record<string, TabType>;
  themeColor?: string;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="4" r="3"/></svg>;

const UsersModal: React.FC<UsersModalProps> = ({ onClose, users, onAddUser, onUpdateUser, onDeleteUser, allTabs, tabTypes, themeColor = '#db2777' }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleSubmit = async (user: AppUser, isEdit: boolean) => {
    setIsProcessing(true);
    setIsFormOpen(false);
    try {
      if (isEdit) await onUpdateUser(user);
      else await onAddUser(user);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingUserId) return;
    setIsProcessing(true);
    const target = deletingUserId;
    setDeletingUserId(null);
    try {
      await onDeleteUser(target);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl animate-popup flex flex-col max-h-[85vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <UsersIcon />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">Manage Users</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Access Records</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3">
          {users.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                <UsersIcon />
              </div>
              <p className="text-slate-400 text-sm font-bold italic">No users found.</p>
            </div>
          ) : (
            users.map(user => (
              <div key={user.id} className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex items-center justify-between group">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-slate-800 uppercase truncate">{user.username}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PW: ****</span>
                    <span className="text-slate-200 text-[10px]">•</span>
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Access Configured</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => handleEditClick(user)} className="p-2.5 bg-white text-blue-600 rounded-xl border border-blue-100 shadow-sm active:scale-90 transition-transform">
                    <EditIcon />
                  </button>
                  <button onClick={() => setDeletingUserId(user.id)} className="p-2.5 bg-white text-rose-500 rounded-xl border border-rose-100 shadow-sm active:scale-90 transition-transform">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
          <button 
            onClick={handleAddClick}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <UserPlusIcon /> Add New User
          </button>
        </div>
      </div>

      {isFormOpen && (
        <UserForm 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleSubmit} 
          initialData={editingUser} 
          allTabs={allTabs}
          tabTypes={tabTypes}
        />
      )}

      {deletingUserId && (
        <ConfirmModal 
          isOpen={true} 
          onClose={() => setDeletingUserId(null)} 
          onConfirm={confirmDelete} 
          title="Delete User?" 
          message="Remove this user's access profile permanently?" 
        />
      )}

      {isProcessing && <LoadingOverlay isVisible={true} message="Updating Cloud..." color={themeColor} />}
    </div>
  );
};

export default UsersModal;