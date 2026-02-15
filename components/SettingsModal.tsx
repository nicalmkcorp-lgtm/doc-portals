
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AppSettings } from '../types';
import PasscodeModal from './PasscodeModal';
import LoadingOverlay from './LoadingOverlay';

interface SettingsModalProps {
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  allTabs: string[];
  onToggleRestriction: () => void;
  onManageUsers: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'restricted') => void;
  isOfflineMode?: boolean;
  onPushToServer?: () => void;
  onPullFromServer?: () => void;
  onGoOnline?: (scriptUrl: string) => void;
  forbiddenUrl?: string;
}

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const SmartphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>;
const WrenchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12(0 0 1 -3 -3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="4" r="3"/></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H17c2.8 0 5-2.2 5-5 0-4.4-4.5-8-10-8Z"/></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2H6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c.1 0 .2 0 .3 0A6 6 10 1 0 12 8.1 5.5 5.5 0 1 0 5.5 19h12z"/></svg>;
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const PenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;

const COLOR_PRESETS = [
  { hex: '#db2777', name: 'Nica Pink' },
  { hex: '#2563eb', name: 'Trust Blue' },
  { hex: '#059669', name: 'Forest' },
  { hex: '#7c3aed', name: 'Violet' },
  { hex: '#ea580c', name: 'Ember' },
  { hex: '#0891b2', name: 'Ocean' },
  { hex: '#1e293b', name: 'Slate' },
  { hex: '#000000', name: 'Midnight' },
];

const DEPLOYMENT_SCRIPT_LITE = `// Nica.Lmk.Corp Cloud Engine v186.4
// Copy this script to Extensions > Apps Script in your Google Sheet
const HISTORY_SHEET_NAME = "history";
const CONFIG_SHEET_NAME = "_TabConfigs_";
const USERS_SHEET_NAME = "USERS";
// ... (Full script is available in the deployment guide)`;

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, settings, onSave, allTabs, onToggleRestriction, onManageUsers, showToast, isOfflineMode, onPushToServer, onPullFromServer, onGoOnline, forbiddenUrl }) => {
  const [formData, setFormData] = useState<AppSettings>(({
    ...settings,
    appPin: settings.appPin || '',
    earningsAdjustments: settings.earningsAdjustments || { month: 0, year: 0 },
    copyBullet: settings.copyBullet || '🌸',
    copyFooter: settings.copyFooter || 'Thank you - Lmk',
    loadingColor: settings.loadingColor || '#db2777',
    biometricSensitiveEnabled: settings.biometricSensitiveEnabled ?? true,
    restrictedTabMode: settings.restrictedTabMode ?? false,
    unrestrictedTabNames: settings.unrestrictedTabNames || [],
    authorizedSignature: settings.authorizedSignature || '',
    publicUrl: settings.publicUrl || ''
  }));
  
  const [copied, setCopied] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'instructions'>('config');
  const [isScriptUrlVisible, setIsScriptUrlVisible] = useState(false);
  const [pinWizard, setPinWizard] = useState<'none' | 'checking' | 'old' | 'new' | 'saving' | 'reveal'>('none');
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);
  const [showSigPad, setShowSigPad] = useState(false);

  const handleFixIds = async () => {
    const activeUrl = isOfflineMode ? formData.personalScriptUrl : formData.scriptUrl;
    if (!activeUrl) {
      showToast("Cloud maintenance unavailable without Script URL.", "error");
      return;
    }
    setIsFixing(true);
    try {
      const res = await fetch(activeUrl, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'fixMissingIds' }) 
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(`Cloud IDs verified successfully. Metadata/Header rows (1-3) were strictly protected. ${data.count || 0} empty IDs in data rows (4+) were identified and fixed.`);
      } else {
        throw new Error(data.message);
      }
    } catch (e: any) { 
      alert(`Action Failed: ${e.message || 'Check connection'}. Ensure script is updated to v186.4.`); 
    } finally { setIsFixing(false); }
  };

  const handleSave = async () => {
    if (isOfflineMode) {
      if (formData.personalScriptUrl && forbiddenUrl && formData.personalScriptUrl.trim() === forbiddenUrl.trim()) {
        showToast("This URL is already in use by the Corporate account.", "error");
        return;
      }
    } else {
      if (formData.scriptUrl && forbiddenUrl && formData.scriptUrl.trim() === forbiddenUrl.trim()) {
        showToast("This URL is already in use by the Personal account.", "error");
        return;
      }
    }

    const activeUrl = isOfflineMode ? formData.personalScriptUrl : formData.scriptUrl;
    // Sync signature if present and changed
    if (activeUrl && formData.authorizedSignature !== settings.authorizedSignature) {
        try {
            await fetch(activeUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'saveAuthorizedSignature',
                    signature: formData.authorizedSignature
                })
            });
        } catch (e) {
            console.warn("Failed to sync signature", e);
        }
    }

    onSave(formData); 
    onClose(); 
  };

  const clearSignature = () => {
    setFormData({ ...formData, authorizedSignature: '' });
  };

  const startPinAuth = (nextAction: 'old' | 'reveal') => {
    const activeUrl = isOfflineMode ? formData.personalScriptUrl : formData.scriptUrl;
    if (!activeUrl && !isOfflineMode) {
      showToast("Script URL is missing. Cannot verify.", "error");
      return;
    }
    setPinWizard(nextAction);
  };

  const handleAuthSuccess = async (code: string) => {
    if (isOfflineMode) {
      const valid = formData.appPin || '0609';
      if (code === valid || code === "BIOMETRIC_PASS") {
        if (pinWizard === 'reveal') { setIsScriptUrlVisible(true); setPinWizard('none'); }
        else { setPinWizard('new'); }
      } else { throw new Error("INCORRECT_PIN"); }
      return;
    }

    setIsCheckingCloud(true);
    try {
      const res = await fetch(`${formData.scriptUrl}?tab=_TabConfigs_`);
      const data = await res.json();
      const cloudPin = data.appPin ? data.appPin.toString() : '0609';
      
      setIsCheckingCloud(false);

      if (code === cloudPin || code === "BIOMETRIC_PASS") {
        if (pinWizard === 'reveal') { 
          setIsScriptUrlVisible(true); 
          setPinWizard('none'); 
        } else { 
          setPinWizard('new'); 
        }
      } else { 
        throw new Error("INCORRECT_PIN");
      }
    } catch (e: any) { 
      setIsCheckingCloud(false);
      if (e.message === "INCORRECT_PIN") {
        showToast("Incorrect master code", "error");
        throw e; 
      }
      setPinWizard('none');
      showToast("Unable to connect to Cloud.", "error");
    }
  };

  const handleNewPinSubmit = async (code: string) => {
    if (code.length < 4) {
      showToast("PIN must be at least 4 digits.", "error");
      throw new Error("INVALID_PIN_LENGTH");
    }

    if (isOfflineMode) {
      const updatedSettings = { ...formData, appPin: code };
      setFormData(updatedSettings);
      onSave(updatedSettings);
      setPinWizard('none');
      showToast("Local master code updated!");
      return;
    }

    setIsCheckingCloud(true);
    try {
      const res = await fetch(formData.scriptUrl, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveMasterPin', pin: code }) 
      });
      const data = await res.json();
      if (data.status === 'success') {
        const updatedSettings = { ...formData, appPin: code };
        setFormData(updatedSettings);
        onSave(updatedSettings); 
        setPinWizard('none');
        showToast("Master code updated successfully!");
      } else {
        throw new Error();
      }
    } catch (e: any) { 
      if (e.message === "INVALID_PIN_LENGTH") throw e;
      setPinWizard('none'); 
      showToast("Cloud sync failed. PIN not updated.", "error");
    } finally {
      setIsCheckingCloud(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(DEPLOYMENT_SCRIPT_LITE); 
    setCopied(true); 
    setTimeout(() => setCopied(false), 3000); 
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-lg bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div><h2 className="text-xl font-black text-slate-900 leading-none">Settings & Cloud</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{isOfflineMode ? 'PERSONAL LEDGER MODE' : 'ENGINE v186.4'}</p></div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><CloseIcon /></button>
        </div>
        <div className="flex bg-slate-50 border-b border-slate-100 shrink-0">
          <button onClick={() => setActiveTab('config')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400'}`}>Configuration</button>
          <button onClick={() => setActiveTab('instructions')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'instructions' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400'}`}>Instructions</button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {activeTab === 'config' ? (
            <div className="space-y-8 pb-10">
              {isOfflineMode ? (
                <section className="space-y-4">
                   <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2"><CloudIcon /> Personal Cloud Engine</h3>
                   <div className="p-5 bg-amber-50 border border-amber-100 rounded-[2rem] space-y-4 shadow-sm">
                      <p className="text-[10px] font-bold text-amber-700 leading-relaxed">Save your private data to your own Google Sheet. This is strictly for Personal Ledger use only.</p>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Private Script URL</label>
                        <div className="relative">
                          <input type={isScriptUrlVisible ? "text" : "password"} className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none" placeholder="https://script.google.com/..." value={formData.personalScriptUrl} onChange={e => setFormData({ ...formData, personalScriptUrl: e.target.value })} />
                          <button type="button" onClick={() => isScriptUrlVisible ? setIsScriptUrlVisible(false) : startPinAuth('reveal')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-amber-600">{isScriptUrlVisible ? <EyeOffIcon /> : <EyeIcon />}</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={onPushToServer} disabled={!formData.personalScriptUrl} className="py-3.5 bg-amber-600 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50">Backup Personal</button>
                        <button onClick={onPullFromServer} disabled={!formData.personalScriptUrl} className="py-3.5 bg-white border border-amber-200 text-amber-600 font-black rounded-xl shadow-sm active:scale-95 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50">Restore Personal</button>
                      </div>
                   </div>
                </section>
              ) : (
                <>
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise Cloud Synchronization</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={onPushToServer} className="p-5 bg-blue-600 text-white rounded-[2rem] flex flex-col items-center gap-2 shadow-xl active:scale-95 transition-all">
                          <ArrowUpIcon />
                          <span className="text-[9px] font-black uppercase tracking-widest">Push Corporate</span>
                          <span className="text-[7px] opacity-60 font-bold uppercase">(Sync to Sheet)</span>
                       </button>
                       <button onClick={onPullFromServer} className="p-5 bg-emerald-600 text-white rounded-[2rem] flex flex-col items-center gap-2 shadow-xl active:scale-95 transition-all">
                          <ArrowDownIcon />
                          <span className="text-[9px] font-black uppercase tracking-widest">Pull Corporate</span>
                          <span className="text-[7px] opacity-60 font-bold uppercase">(Restore Ledger)</span>
                       </button>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise Integration</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Master Script URL</label>
                        <div className="relative">
                          <input type={isScriptUrlVisible ? "text" : "password"} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none pr-12" value={formData.scriptUrl} onChange={e => setFormData({ ...formData, scriptUrl: e.target.value })} />
                          <button type="button" onClick={() => isScriptUrlVisible ? setIsScriptUrlVisible(false) : startPinAuth('reveal')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600">{isScriptUrlVisible ? <EyeOffIcon /> : <EyeIcon />}</button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><GlobeIcon /> Public Hosting URL</label>
                        <div className="relative">
                          <input type="text" placeholder="https://your-github-username.github.io/repo-name" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none" value={formData.publicUrl} onChange={e => setFormData({ ...formData, publicUrl: e.target.value })} />
                        </div>
                        <p className="text-[8px] text-slate-400 font-bold ml-1 mt-1">For banner-free signing (e.g. GitHub Pages).</p>
                      </div>
                    </div>
                  </section>
                </>
              )}
              
              <section className="space-y-4">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><PenIcon /> Authorized Signature</h3>
                 <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-4 shadow-inner">
                    <div className="flex flex-col items-center gap-4">
                       {formData.authorizedSignature ? (
                          <div className="relative w-full max-w-[200px] h-32 bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center p-2 group">
                             <img src={formData.authorizedSignature} alt="Authorized" className="max-w-full max-h-full object-contain" />
                             <button 
                               onClick={clearSignature} 
                               className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-md text-slate-400 hover:text-rose-500 transition-colors"
                             >
                               <TrashIcon />
                             </button>
                          </div>
                       ) : (
                          <div className="w-full max-w-[200px] h-32 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                             <span className="text-slate-300"><PenIcon /></span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No Signature</span>
                          </div>
                       )}
                       <button 
                         onClick={() => setShowSigPad(true)} 
                         className="w-full py-3 bg-white border-2 border-blue-100 text-blue-600 font-bold rounded-2xl active:scale-95 transition-all text-[10px] uppercase tracking-widest shadow-sm"
                       >
                         {formData.authorizedSignature ? 'Replace Signature' : 'Open Signature Pad'}
                       </button>
                       <p className="text-[9px] text-slate-400 text-center leading-relaxed px-4">
                         This signature will be automatically applied as the "Authorized Signature" on all generated PDF contracts.
                       </p>
                    </div>
                 </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><PaletteIcon /> Appearance & Style</h3>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-6 shadow-inner">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Choose App Theme</label>
                    <div className="flex overflow-x-auto gap-3 p-2 no-scrollbar">
                      {COLOR_PRESETS.map(c => (
                        <button 
                          key={c.hex} 
                          onClick={() => setFormData({ ...formData, loadingColor: c.hex })} 
                          className={`group relative aspect-square w-12 h-12 shrink-0 rounded-full border-4 transition-all active:scale-95 flex items-center justify-center ${formData.loadingColor === c.hex ? 'border-white ring-4 ring-blue-500 shadow-xl scale-110 z-10' : 'border-white/50 border-slate-200 hover:border-slate-300 shadow-sm'}`} 
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {formData.loadingColor === c.hex && (
                            <div className="text-white animate-in zoom-in duration-300 drop-shadow-md">
                              <CheckIcon />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><ClipboardIcon /> Copy Preferences</h3>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-4 shadow-inner">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bullet Symbol</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none"><PaletteIcon /></span>
                        <input type="text" className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-3xl font-black text-center shadow-inner outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 h-[56px]" value={formData.copyBullet} onChange={e => setFormData({ ...formData, copyBullet: e.target.value })} placeholder="🌸" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Signature Footer</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none"><ClipboardIcon /></span>
                        <input type="text" className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest shadow-inner outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 h-[56px]" value={formData.copyFooter} onChange={e => setFormData({ ...formData, copyFooter: e.target.value })} placeholder="Lmk" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><ShieldCheckIcon /> Security & Access</h3>
                <button onClick={() => startPinAuth('old')} className="w-full p-5 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center justify-between group shadow-sm hover:bg-blue-100/50 transition-all"><div className="text-left"><p className="text-[11px] font-black text-blue-800 uppercase tracking-tight">Change Master Code</p><p className="text-[9px] text-blue-500 font-bold uppercase mt-1">{isOfflineMode ? 'Local Security' : 'Cloud Sync'}</p></div><div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform"><ShieldCheckIcon /></div></button>
                {!isOfflineMode && <button onClick={onManageUsers} className="w-full p-5 bg-emerald-600 border border-emerald-500 rounded-[2rem] flex items-center justify-between group shadow-xl hover:bg-emerald-500 transition-all"><div className="text-left"><p className="text-[11px] font-black text-white uppercase tracking-tight">Add users</p><p className="text-[9px] text-emerald-100 font-bold uppercase mt-1">User Management</p></div><div className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:-rotate-12 transition-transform"><UsersIcon /></div></button>}
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Maintenance</h3>
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2.5rem] space-y-4 shadow-sm">
                  <div className="flex items-center gap-3"><div className="w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><WrenchIcon /></div><div><p className="text-xs font-black text-blue-900 uppercase">{isOfflineMode ? 'Local Maintenance' : 'Script Engine v186.4'}</p></div></div>
                  <button onClick={handleCopyScript} className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${copied ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700 active:scale-95'}`}>{copied ? <><CheckIcon /> Code Copied</> : <><CopyIcon /> Copy Script Code</>}</button>
                </div>
                <button onClick={handleFixIds} disabled={isFixing || (isOfflineMode && !formData.personalScriptUrl)} className={`w-full py-5 bg-white border-2 border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-600 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-slate-50 ${(isOfflineMode && !formData.personalScriptUrl) ? 'opacity-50 grayscale' : ''}`}>{isFixing ? 'Working...' : 'Fix Ledger IDs'}</button>
              </section>
            </div>
          ) : (
            <div className="space-y-8 pb-10">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><BookOpenIcon /> Cloud Setup Guide</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6 space-y-5 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">Open your Google Spreadsheet on a desktop browser.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">Go to <span className="text-blue-600 font-black">{"Extensions > Apps Script"}</span> from the top menu.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                      <div className="space-y-3 flex-1">
                        <p className="text-xs font-bold text-slate-700 leading-relaxed">Copy the Deployment Code using the button below and paste it into the Apps Script editor (delete any existing code first).</p>
                        <button onClick={handleCopyScript} className="w-full py-3 bg-white border-2 border-blue-200 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm">Copy Engine Code</button>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">4</div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">Click <span className="text-blue-600 font-black">{"Deploy > New Deployment"}</span>. Select "Web App".</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">5</div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">Set "Execute as" to <span className="text-slate-900 font-black">Me</span> and "Who has access" to <span className="text-slate-900 font-black">Anyone</span>.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">6</div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">Deploy and copy the <span className="text-blue-600 font-black">Web App URL</span>. Paste it into your configuration.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><SmartphoneIcon /> Mobile Experience</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner"><SmartphoneIcon /></div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900 leading-none">Add to Home Screen</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">Install Nica.Lmk.Corp as a standalone application on your mobile device for a native full-screen experience.</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0"><button onClick={handleSave} className="w-full py-5 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] min-h-[65px] hover:bg-blue-700 shadow-blue-100">Save All Settings</button></div>
      </div>
      
      {isCheckingCloud && pinWizard === 'none' && <LoadingOverlay isVisible={true} message="Verifying Cloud Security..." color={formData.loadingColor} />}

      {(pinWizard === 'old' || pinWizard === 'reveal') && (
        <PasscodeModal 
          isOpen={true} 
          onClose={() => setPinWizard('none')} 
          onSuccess={handleAuthSuccess} 
          title="Verify Access" 
          message={pinWizard === 'reveal' ? "Enter master code to reveal URL." : "Enter code to manage."} 
          preventCloseOnSuccess={true}
          biometricEnabled={formData.biometricSensitiveEnabled}
          loading={isCheckingCloud}
          loadingText="Verifying..."
        />
      )}
      {pinWizard === 'new' && (
        <PasscodeModal 
          isOpen={true} 
          onClose={() => setPinWizard('none')} 
          onSuccess={handleNewPinSubmit} 
          title="New Master Code" 
          message="Enter a NEW code to lock cloud actions." 
          preventCloseOnSuccess={true}
          loading={isCheckingCloud}
          loadingText="Saving Master Code..."
        />
      )}

      {showSigPad && createPortal(
        <div className="fixed inset-0 z-[16000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <SignaturePadModal 
             onClose={() => setShowSigPad(false)}
             onSave={(sig) => { setFormData({...formData, authorizedSignature: sig}); setShowSigPad(false); }}
           />
        </div>,
        document.body
      )}
    </div>
  );
};

const SignaturePadModal = ({ onClose, onSave }: { onClose: () => void, onSave: (data: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Precise measurement
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set internal resolution based on DPR for pixel-perfect drawing
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Reset transform before re-scaling
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
    }
  }, []);

  useEffect(() => {
    // Wait for modal animation to settle before measuring
    const timer = setTimeout(initCanvas, 300);
    window.addEventListener('resize', initCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initCanvas);
    };
  }, [initCanvas]);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    // Client coordinates are relative to the viewport
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Exact position within the canvas element
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (e.cancelable) e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear based on the CSS size (since context is scaled)
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if signature has data
      const dataUrl = canvas.toDataURL("image/png");
      if (dataUrl.length < 1000) {
        alert("Please draw your signature first.");
        return;
      }
      onSave(dataUrl);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[2rem] p-6 shadow-2xl flex flex-col items-center animate-in zoom-in-95 overflow-hidden">
       <h3 className="text-lg font-black text-slate-900 mb-2">Draw Authorized Signature</h3>
       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Applied to Official Documents</p>
       <div className="w-full h-48 bg-white border-2 border-dashed border-slate-300 rounded-xl overflow-hidden cursor-crosshair touch-none relative mb-4">
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
       </div>
       <div className="flex w-full gap-2">
          <button onClick={handleClear} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Clear</button>
          <button onClick={handleSave} className="flex-[2] py-3 bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Save Signature</button>
       </div>
       <button onClick={onClose} className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancel</button>
    </div>
  );
};

export default SettingsModal;
