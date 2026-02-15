import React, { useState, useEffect, useCallback } from 'react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';
import PasscodeModal from './PasscodeModal';

interface AuthGuardProps {
  onUnlock: () => void;
  masterPin?: string;
}

const FingerprintIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
    <path d="M5 12c0-2.8 2.2-5 5-5s5 2.2 5 5"/>
    <path d="M8 12c0-1.1.9-2 2-2s2 .9 2 2"/>
    <path d="M12 22s4-1.1 4-5V10c0-1.1-.9-2-2-2s-2 .9-2 2v7c0 1.1-.9 2-2 2s-2-.9-2-2"/>
    <path d="M18 12c0 1.7-.5 3.3-1.4 4.7"/>
    <path d="M22 12c0 2.8-1.1 5.4-3 7.3"/>
  </svg>
);

const AuthGuard: React.FC<AuthGuardProps> = ({ onUnlock, masterPin }) => {
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showPinFallback, setShowPinFallback] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const handleAuthenticate = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    if (!isNative) {
      // Web Bypass Mode - Simulate a check then allow unlock
      setTimeout(() => {
        setIsChecking(false);
        // We don't auto-unlock to let the user see the UI, they can click the button
      }, 500);
      return;
    }

    try {
      // Wait for app to be fully ready
      await new Promise(r => setTimeout(r, 500));
      
      const result = await NativeBiometric.isAvailable();
      
      if (result.isAvailable) {
        try {
          await NativeBiometric.verify({
            reason: "Scan fingerprint to access.",
            title: "Nica Lmk Corp",
            subtitle: "Security Check",
            description: "Authenticate to continue",
          });
          onUnlock();
          return;
        } catch (verifyErr) {
          // User cancelled or auth failed
          setError("Authentication cancelled or failed.");
        }
      } else {
        // Biometrics hardware exists but maybe no fingerprint enrolled
        setError("Biometrics not set up on this device.");
        setShowPinFallback(true);
      }
    } catch (err: any) {
      console.error("Bio Error", err);
      setError("Security unavailable. Use PIN.");
      setShowPinFallback(true);
    } finally {
      setIsChecking(false);
    }
  }, [onUnlock, isNative]);

  useEffect(() => {
    handleAuthenticate();
  }, [handleAuthenticate]);

  const handlePinSuccess = (code: string) => {
    const valid = masterPin || '0609';
    if (code === valid) {
      onUnlock();
    } else {
      throw new Error("INCORRECT");
    }
  };

  const handleWebBypass = () => {
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900 flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full animate-pulse"></div>
      
      <div className="relative z-10 w-full max-w-xs text-center">
        <div className="mb-12 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center mb-6 shadow-2xl relative">
            <FingerprintIcon className={`${isChecking ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Nica Lmk Corp</h1>
          <p className="text-slate-400 text-sm">Secured Vault</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <p className="text-red-400 text-xs font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {isNative ? (
            <button
              onClick={handleAuthenticate}
              disabled={isChecking}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isChecking ? 'Checking Sensor...' : 'Retry Biometrics'}
            </button>
          ) : (
            <button
              onClick={handleWebBypass}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Web Developer Bypass
            </button>
          )}

          <button
            onClick={() => setShowPinFallback(true)}
            className="w-full py-3 bg-white/5 text-slate-400 font-bold rounded-2xl text-xs uppercase tracking-widest active:bg-white/10 transition-colors"
          >
            Enter Master PIN
          </button>
        </div>

        <p className="mt-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          {isNative ? 'Offline Security Layer' : 'Debug Mode Active'}
        </p>
      </div>

      {showPinFallback && (
        <PasscodeModal
          isOpen={true}
          onClose={() => setShowPinFallback(false)}
          onSuccess={handlePinSuccess}
          title="Master Access"
          message="Enter your admin PIN to unlock."
        />
      )}
    </div>
  );
};

export default AuthGuard;