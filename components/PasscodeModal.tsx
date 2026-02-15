import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (code: string) => void | Promise<void>;
  title: string;
  message: string;
  targetTab?: string; 
  biometricEnabled?: boolean;
  preventCloseOnSuccess?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const FingerprintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M5 12c0-2.8 2.2-5 5-5s5 2.2 5 5"/><path d="M8 12c0-1.1.9-2 2-2s2 .9 2 2"/><path d="M12 22s4-1.1 4-5V10c0-1.1-.9-2-2-2s-2 .9-2 2v7c0 1.1-.9 2-2 2s-2-.9-2-2"/><path d="M18 12c0 1.7-.5 3.3-1.4 4.7"/><path d="M22 12c0 2.8-1.1 5.4-3 7.3"/></svg>;

const PasscodeModal: React.FC<PasscodeModalProps> = ({ isOpen, onClose, onSuccess, title, message, biometricEnabled = false, preventCloseOnSuccess = false, loading = false, loadingText = 'Saving to Cloud...' }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [isBioSupported, setIsBioSupported] = useState(false);
  const [isBioChecking, setIsBioChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBiometricAuth = useCallback(async () => {
    if (isBioChecking || loading) return;
    
    if (!Capacitor.isNativePlatform()) return;

    setIsBioChecking(true);

    try {
      const result = await NativeBiometric.isAvailable();
      if (result.isAvailable) {
          await NativeBiometric.verify({
            reason: "Authorize Action",
            title: "Nica Lmk Corp",
            subtitle: "Verification",
            description: "Scan to confirm"
          });
          await onSuccess("BIOMETRIC_PASS");
          if (!preventCloseOnSuccess) onClose();
      } else {
          setIsBioSupported(false);
      }
    } catch (err: any) {
      console.debug("Biometric failed", err);
    } finally {
      setIsBioChecking(false);
    }
  }, [isBioChecking, loading, onClose, onSuccess, preventCloseOnSuccess]);

  useEffect(() => {
    if (isOpen && biometricEnabled && Capacitor.isNativePlatform()) {
      const checkAvailability = async () => {
        try {
          const result = await NativeBiometric.isAvailable();
          if (result.isAvailable) {
            setIsBioSupported(true);
            handleBiometricAuth();
          }
        } catch (e) { console.debug("Native Bio unavailable", e); }
      };
      checkAvailability();
    }
  }, [isOpen, biometricEnabled, handleBiometricAuth]);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError(false);
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleManualVerify = async () => {
    if (loading) return;
    const finalCode = passcode.trim();
    if (finalCode.length >= 1) {
      try {
        await onSuccess(finalCode);
        if (!preventCloseOnSuccess) onClose();
      } catch (e) {
        setError(true);
        setPasscode('');
        if (window.navigator.vibrate) window.navigator.vibrate(100);
        setTimeout(() => setError(false), 500);
      }
    } else {
      setError(true);
      if (window.navigator.vibrate) window.navigator.vibrate(100);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputRef.current) inputRef.current.blur();
      handleManualVerify();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110000] flex items-center justify-center bg-black/70 backdrop-blur-md p-6 animate-in fade-in duration-200">
      <div className={`w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center ${error ? 'animate-shake' : ''}`}>
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <LockIcon />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-xs mb-6 leading-relaxed font-semibold px-2">
            {message}
          </p>

          <div className="relative">
            <input 
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              placeholder="PIN"
              disabled={loading}
              className={`w-full p-4 bg-slate-50 border-2 ${error ? 'border-red-500' : 'border-slate-200'} rounded-2xl text-center text-2xl font-black tracking-[0.5em] text-slate-800 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-400 outline-none transition-all shadow-inner disabled:opacity-50`}
              value={passcode}
              onKeyDown={handleKeyDown}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <button 
              type="button"
              onClick={handleManualVerify}
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest disabled:bg-slate-400"
            >
              {loading ? loadingText : 'Verify with PIN'}
            </button>

            {biometricEnabled && isBioSupported && (
              <button 
                type="button"
                onClick={handleBiometricAuth}
                disabled={isBioChecking || loading}
                className="w-full py-4 bg-blue-50 text-blue-600 font-black rounded-2xl border-2 border-blue-100 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FingerprintIcon />
                {isBioChecking ? 'Starting Sensor...' : 'Use Fingerprint'}
              </button>
            )}

            {!loading && (
              <button 
                type="button" 
                onClick={onClose}
                className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-8px); }
          75% { transform: translateY(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PasscodeModal;