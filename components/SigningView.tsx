
import React, { useEffect, useRef, useState } from 'react';

const SignaturePad = ({ onSave, onClear }: { onSave: (data: string) => void, onClear: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
    }
  }, []);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e: any) => { e.preventDefault(); setIsDrawing(true); const ctx = canvasRef.current?.getContext('2d'); const { x, y } = getPos(e); ctx?.beginPath(); ctx?.moveTo(x, y); };
  const move = (e: any) => { e.preventDefault(); if (!isDrawing) return; const ctx = canvasRef.current?.getContext('2d'); const { x, y } = getPos(e); ctx?.lineTo(x, y); ctx?.stroke(); };
  const end = () => setIsDrawing(false);

  return (
    <div className="space-y-3">
      <div className="w-full h-48 bg-white border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden touch-none relative cursor-crosshair">
        <canvas ref={canvasRef} className="w-full h-full" onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      </div>
      <div className="flex gap-2">
        <button onClick={() => { onClear(); const c = canvasRef.current; const ctx = c?.getContext('2d'); ctx?.clearRect(0,0,c!.width,c!.height); }} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-200">Clear</button>
        <button onClick={() => { const c = canvasRef.current; if (c) onSave(c.toDataURL("image/png")); }} className="flex-[2] py-3 bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Confirm Signature</button>
      </div>
    </div>
  );
};

export const SigningView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [step, setStep] = useState<'review' | 'sign' | 'success'>('review');
  const [signerName, setSignerName] = useState('');
  const [signerAddress, setSignerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftId = params.get('draftId');
    const endpoint = params.get('endpoint');

    if (!draftId) {
      setError("Invalid link: Missing Contract ID.");
      setLoading(false);
      return;
    }

    if (!endpoint) {
      setError("Invalid link: Missing Cloud Endpoint.");
      setLoading(false);
      return;
    }

    console.log("Fetching contract:", draftId, "from", endpoint);

    fetch(`${endpoint}?mode=get_draft&draftId=${draftId}`)
      .then(async (res) => {
        const text = await res.text();
        console.log("Raw Response:", text); // Debug log
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("JSON Parse Error", text);
          throw new Error("Server returned invalid data. Please ensure the Google Script is updated to v202.12+");
        }
      })
      .then(json => {
        if (json.status === 'success' && json.data) {
          setData(json.data);
        } else {
          setError(json.message || "Contract expired, already signed, or not found.");
        }
      })
      .catch((err) => setError(err.message || "Unable to load contract details. Check connection."))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (signature: string) => {
    if (!signerName.trim() || !signerAddress.trim()) {
      alert("Please fill in your Full Name and Address.");
      return;
    }
    setIsSubmitting(true);
    const params = new URLSearchParams(window.location.search);
    const endpoint = params.get('endpoint');
    const draftId = params.get('draftId');

    try {
      const payload = {
        action: 'processSignature',
        id: data.id,
        draftId: draftId,
        signer_name: signerName,
        signer_address: signerAddress,
        signature: signature,
        term: data.term || "",
        period: data.period || "",
        amount_per_due: data.amount_per_due || "",
        amount: data.amount || "",
        start_date: data.date || "",
        end_date: data.end_date || "",
        type: data.type || ""
      };

      await fetch(endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      
      setStep('success');
    } catch (e) {
      alert("Submission failed. Please try again or check your internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse flex flex-col items-center gap-4"><div className="w-16 h-16 bg-slate-200 rounded-full"></div><div className="h-4 w-32 bg-slate-200 rounded"></div><p className="text-xs text-slate-400 font-bold">Connecting to Ledger...</p></div></div>;
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
      <div className="max-w-xs bg-white p-8 rounded-[2rem] shadow-xl">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
        <h1 className="text-xl font-black text-slate-900 mb-2">Unavailable</h1>
        <p className="text-slate-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200">Retry</button>
      </div>
    </div>
  );

  if (step === 'success') return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center"><div className="max-w-xs animate-in zoom-in-95 duration-500"><div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg">✓</div><h1 className="text-3xl font-black text-slate-900 mb-2">Signed!</h1><p className="text-slate-500 text-sm font-medium">Thank you. The document has been securely recorded.</p></div></div>;

  // Defensive Check: If data is null here despite no error/loading, show error
  if (!data) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Data Error</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-start pt-10">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100">
        <div className="p-8 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">N</div>
             <div>
                <h1 className="text-xl font-black text-slate-900 leading-none">Official Agreement</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nica.Lmk.Corp Infrastructure</p>
             </div>
          </div>
        </div>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
           <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Agreement Details</h2>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                 {data.lender_name && <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lender</p><p className="text-sm font-bold text-slate-800">{data.lender_name}</p></div>}
                 {data.operator && <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Operator</p><p className="text-sm font-bold text-slate-800">{data.operator}</p></div>}
                 {data.amount && <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p><p className="text-xl font-black text-emerald-600">₱{Number(data.amount).toLocaleString()}</p></div>}
                 {data.term && <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Term</p><p className="text-sm font-bold text-slate-800">{data.term}</p></div>}
                 {data.start_date && <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</p><p className="text-sm font-bold text-slate-800">{data.start_date}</p></div>}
                 {data.car_model && <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vehicle</p><p className="text-sm font-bold text-slate-800">{data.car_model} <span className="text-slate-400 text-xs">({data.plate_number})</span></p></div>}
              </div>
           </div>

           <div className="space-y-3">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Terms & Conditions</h2>
              <div className="text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap bg-slate-50 p-5 rounded-2xl border border-slate-100 font-medium">
                 {data.terms_content}
              </div>
           </div>

           {step === 'review' ? (
             <div className="space-y-4 pt-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                   <div className="mt-0.5 min-w-[16px] text-blue-600">ℹ</div>
                   <p className="text-xs font-bold text-blue-800 leading-relaxed">By proceeding, I confirm that I have read, understood, and agree to the terms listed above.</p>
                </div>
                <button onClick={() => setStep('sign')} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 active:scale-[0.98] transition-all uppercase text-xs tracking-[0.2em]">Proceed to Signature</button>
             </div>
           ) : (
             <div className="space-y-6 pt-2 animate-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Full Name</label>
                      <input type="text" value={signerName} onChange={e => setSignerName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Required" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Complete Address</label>
                      <input type="text" value={signerAddress} onChange={e => setSignerAddress(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Required" />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Draw Signature</label>
                   <SignaturePad onSave={handleSubmit} onClear={() => {}} />
                </div>
                {isSubmitting && <p className="text-center text-xs font-bold text-blue-600 animate-pulse bg-blue-50 py-2 rounded-lg">Processing secure signature...</p>}
                <button onClick={() => setStep('review')} disabled={isSubmitting} className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Back to Review</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
