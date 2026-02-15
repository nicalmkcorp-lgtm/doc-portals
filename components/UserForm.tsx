import React, { useState, useMemo } from 'react';
import { AppUser, TabType } from '../types';

interface UserFormProps {
  onClose: () => void;
  onSubmit: (user: AppUser, isEdit: boolean) => void;
  initialData: AppUser | null;
  allTabs: string[];
  tabTypes: Record<string, TabType>;
}

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

const TAB_PERMISSIONS: Record<TabType, {id: string, label: string}[]> = {
  debt: [
    {id: 'add', label: 'Add Record Button'},
    {id: 'history', label: 'Access History'},
    {id: 'details', label: 'View Loan Details'},
    {id: 'extend', label: 'Extend +7 Days'},
    {id: 'remarks', label: 'Edit Remarks'},
    {id: 'edit', label: 'Edit Record'},
    {id: 'delete', label: 'Delete Record'}
  ],
  rent: [
    {id: 'add', label: 'Add Entry Button'},
    {id: 'history', label: 'Access History'},
    {id: 'adjust_earnings', label: 'Adjust Earnings'},
    {id: 'finish', label: 'Finished Booking'},
    {id: 'cancel', label: 'Cancel Booking'},
    {id: 'remarks', label: 'Edit Remarks'},
    {id: 'edit', label: 'Edit Record'},
    {id: 'delete', label: 'Delete Record'}
  ],
  cashflow: [
    {id: 'add', label: 'Access Add Form'},
    {id: 'add_incoming', label: 'add new transaction, (Incoming)'},
    {id: 'add_outgoing', label: 'add new transaction, (outgoing)'},
    {id: 'history', label: 'Access History'},
    {id: 'hide_bank', label: 'Hide/Show Bank Details'},
    {id: 'clear', label: 'Clear Ledger'},
    {id: 'adjust_bank', label: 'Adjust Bank Balance'},
    {id: 'remarks', label: 'Edit Remarks'},
    {id: 'edit', label: 'Edit Record'},
    {id: 'delete', label: 'Delete Record'}
  ],
  salary: [
    {id: 'add', label: 'Add Salary Button'},
    {id: 'history', label: 'Access History'},
    {id: 'remarks', label: 'Edit Remarks'},
    {id: 'edit', label: 'Edit Record'},
    {id: 'delete', label: 'Delete Record'}
  ],
  business: [
    {id: 'add', label: 'Access Add Form'},
    {id: 'start_cycle', label: "'Start Cycle' = start new business cycle, (start business cycle)"},
    {id: 'add_expenses', label: "'Add Expenses' = add entry, add expenses, (save entry)"},
    {id: 'history', label: 'Access History'},
    {id: 'end_cycle', label: 'End Cycle Button'},
    {id: 'remarks', label: 'Edit Remarks'},
    {id: 'edit', label: 'Edit Record'},
    {id: 'delete', label: 'Delete Record'}
  ],
  savings: [
    {id: 'add', label: 'Add Item Button'},
    {id: 'add_income', label: 'Add income= add new fund item, (income)'},
    {id: 'add_expense', label: 'Add expenses = add new fund item, (expenses)'},
    {id: 'history', label: 'Access History'},
    {id: 'pay', label: 'Pay (Mark Finished)'},
    {id: 'remarks', label: 'Edit Remarks'},
    {id: 'edit', label: 'Edit Record'},
    {id: 'delete', label: 'Delete Record'}
  ],
  supply: [
    {id: 'add', label: 'Access Add Form'},
    {id: 'register_item', label: "'Register new item' = add new stock, (register new stock item)"},
    {id: 'receive_stock', label: "'Recieve Stock' = add new stock, incoming, (recieve incomming stock)"},
    {id: 'issue_stock', label: "'Issue stock' = add new stock, outgoing, (issue stock quantity)"},
    {id: 'history', label: 'Access History'},
    {id: 'edit_logs', label: "'Edit logs'= supply summary, (edit logs)"},
    {id: 'delete_logs', label: "'Delete logs' - supply summary, (delete log)"},
    {id: 'adjust_qty', label: 'Qty Adjust'},
    {id: 'edit', label: 'Edit Item Details'},
    {id: 'delete', label: 'Delete Item'}
  ],
  product: [
    {id: 'add', label: 'Access Add Form'},
    {id: 'add_product', label: "'Add product' = add new stock, new product, (register product)"},
    {id: 'receive_product', label: "'Recieve product' = add new stock, incoming, (recieve incomming products)"},
    {id: 'issue_product', label: "'Issue product' = add new stock, outgoing, (issue product quantity)"},
    {id: 'history', label: 'Access History'},
    {id: 'edit_logs', label: "'Edit logs'= supply summary, (edit logs)"},
    {id: 'delete_logs', label: "'Delete logs' = supply summary, (delete logs)"},
    {id: 'calculation', label: "'Calculation' = supply summary, (calculator)"},
    {id: 'adjust_qty', label: 'Qty Adjust'},
    {id: 'edit', label: 'Edit Item Details'},
    {id: 'delete', label: 'Delete Item'}
  ]
};

const UserForm: React.FC<UserFormProps> = ({ onClose, onSubmit, initialData, allTabs, tabTypes }) => {
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState(initialData?.password || '');
  
  // Normalize internal structure
  const initialRestrictions = useMemo(() => {
    if (!initialData?.restrictions) return { allowedTabs: [], tabPermissions: {} };
    if (Array.isArray(initialData.restrictions)) return { allowedTabs: initialData.restrictions, tabPermissions: {} };
    return initialData.restrictions;
  }, [initialData]);

  const [allowedTabs, setAllowedTabs] = useState<string[]>(initialRestrictions.allowedTabs);
  const [tabPermissions, setTabPermissions] = useState<Record<string, string[]>>(initialRestrictions.tabPermissions);
  const [permModalTab, setPermModalTab] = useState<string | null>(null);

  const isEdit = !!initialData;

  const toggleTab = (tabName: string) => {
    setAllowedTabs(prev => 
      prev.includes(tabName) ? prev.filter(t => t !== tabName) : [...prev, tabName]
    );
  };

  const togglePermission = (tab: string, permId: string) => {
    setTabPermissions(prev => {
      const current = prev[tab] || TAB_PERMISSIONS[tabTypes[tab] || 'debt'].map(p => p.id);
      const next = current.includes(permId) ? current.filter(p => p !== permId) : [...current, permId];
      return { ...prev, [tab]: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    onSubmit({
      id: initialData?.id || `u-${Date.now()}`,
      username,
      password,
      restrictions: { allowedTabs, tabPermissions }
    }, isEdit);
  };

  return (
    <div className="fixed inset-0 z-[13000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <UserIcon />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">{isEdit ? 'Edit User' : 'New User'}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Access Control</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><CloseIcon /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input type="text" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input type="text" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visible Sections</label>
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-3 space-y-1.5 max-h-[260px] overflow-y-auto no-scrollbar shadow-inner">
              {allTabs.map(tab => (
                <div key={tab} className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleTab(tab)}
                    className={`flex-1 flex items-center justify-between p-3 rounded-xl transition-all ${allowedTabs.includes(tab) ? 'bg-blue-600 text-white font-black shadow-lg border-transparent' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    <span className="text-[11px] uppercase tracking-tight">{tab}</span>
                    {allowedTabs.includes(tab) && <CheckIcon />}
                  </button>
                  {allowedTabs.includes(tab) && (
                    <button 
                      type="button"
                      onClick={() => setPermModalTab(tab)}
                      className="w-12 bg-white border border-blue-200 text-blue-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <ShieldIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {allowedTabs.length === 0 && (
              <p className="text-[9px] font-bold text-amber-600 uppercase text-center mt-1">User will see all sections if empty</p>
            )}
          </div>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-col gap-2">
          <button onClick={handleSubmit} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">
            {isEdit ? 'Update User' : 'Save New User'}
          </button>
          <button onClick={onClose} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cancel</button>
        </div>
      </div>

      {permModalTab && (
        <div className="fixed inset-0 z-[14000] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[300px] bg-white rounded-[2rem] shadow-2xl p-6 flex flex-col max-h-[70vh]">
            <div className="flex justify-between items-center mb-4">
               <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase">Permissions</h3>
                 <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{permModalTab}</p>
               </div>
               <button onClick={() => setPermModalTab(null)} className="p-1.5 bg-slate-50 text-slate-400 rounded-lg"><CloseIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
               {TAB_PERMISSIONS[tabTypes[permModalTab] || 'debt'].map(perm => {
                 const isAllowed = (tabPermissions[permModalTab!] || TAB_PERMISSIONS[tabTypes[permModalTab!] || 'debt'].map(p => p.id)).includes(perm.id);
                 return (
                   <button 
                     key={perm.id} 
                     type="button" 
                     onClick={() => togglePermission(permModalTab!, perm.id)}
                     className={`w-full flex items-center justify-between p-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${isAllowed ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-50'}`}
                   >
                     {perm.label}
                     {isAllowed ? <CheckIcon /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                   </button>
                 );
               })}
            </div>
            <button 
              onClick={() => setPermModalTab(null)}
              className="mt-4 w-full py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200"
            >
              Set Permissions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserForm;