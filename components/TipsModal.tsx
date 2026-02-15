import React from 'react';
import { TabType } from '../types';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TabType;
}

const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;

const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const debtTips = [
    "When you delete an entry, the data of that person will be saved in history.",
    "You can search the name of that person in history when you want to add new transaction with that deleted person.",
    "All the data will be retrieved, and the info will be pre-filled automatically.",
    "You can also search the record list with date, name, or amount using the search bar.",
    "You can see the details of the person when you click an entry in the list. All entries for that person will be shown when you click 'All Loan Details'.",
    "You can sort the list by date or by name using the sort toggles.",
    "You can copy all debt (global) using the top buttons or by specific tabs separately using the dashboard buttons.",
    "Use the 'Currency Conversion' button at the top to view balances in other currencies (USD, KRW, etc.). It fetches live rates but requires internet."
  ];

  const rentTips = [
    "When you delete an entry, the data of that person will be saved in history.",
    "You can search the name of that person in history when you want to add new transaction with that deleted person.",
    "All the data will be retrieved, and the info will be pre-filled automatically.",
    "You can also search the record list with date, name, or amount using the search bar.",
    "Scheduled rental dates are shown in the calendar view for easy tracking.",
    "Clicking 'Cancel Booking' will remove the entry without adding to yearly earnings.",
    "Clicking 'Finished Booking' will add the rental amount to the yearly earnings total.",
    "You can sort the list by date or by name using the sort toggles.",
    "Copy booking details using 'All Rent' (global) or for specific tabs separately.",
    "Convert your earnings summary into foreign currencies by clicking the 'Currency Conversion' button at the top."
  ];

  const salaryTips = [
    "When you add a period and salary, it automatically computes the total salary for the given month.",
    "You can change the amount shown in the main card by navigating through different months.",
    "You can copy the details of the salary for all entries in the tab using the primary copy button.",
    "You can also search the record list with date or amount using the search bar.",
    "You can sort the list by date or by name using the sort toggles.",
    "If you work for an international client, use 'Currency Conversion' at the top to see your income in your preferred local or foreign currency."
  ];

  const cashFlowTips = [
    "This tab shows the amount coming in and out of a bank account.",
    "You can set the initial bank funds to accurately reflect the current bank balance after calculations.",
    "Total incoming and outgoing entry sums are automatically shown in the dashboard.",
    "When adding a new entry, you can provide Amount and Reference details, categorizing it as incoming or outgoing funds.",
    "You can search the record list with date or amount using the search bar.",
    "You can sort the transactions by date or by name (remarks) using the sort toggles.",
    "Manage international accounts easily by using the 'Currency Conversion' popup to view your current bank balance in any currency."
  ];

  const businessTips = [
    "When you add a new cycle, it will ask for the initial funds and details. The initial funds is the amount that you pay to start the business.",
    "When you have a business cycle running, you can add expenses which will be added to the list and computed automatically.",
    "When you end the cycle, it will ask for the cash on hand, and it will automatically compute how much you earned on that business cycle.",
    "You can also search the record list with date or amount using the search bar.",
    "You can sort the list by date or by name using the sort toggles.",
    "Evaluate global performance by converting your business outlay and earnings into other currencies using the dashboard converter."
  ];

  const savingsTips = [
    "The Savings tab helps you calculate monthly surplus by tracking Incomes vs Expenses.",
    "Target Savings: This is your planned goal (Total Income minus all planned expenses).",
    "Current Savings: This shows your 'In-Hand' money (Total Income minus only the expenses you have already PAID).",
    "To pay an expense, simply click the 'Pay' button on an expense record in the list. This will mark it as finished and update your Current Savings.",
    "You can copy a full monthly summary using the 'Copy Savings Summary' button on the dashboard.",
    "Like other tabs, deleting records moves them to History for easy re-adding later.",
    "Use the 'Currency Conversion' button at the top to visualize your savings goals in global currencies like USD or JPY."
  ];

  const getTips = () => {
    switch(type) {
      case 'rent': return rentTips;
      case 'salary': return salaryTips;
      case 'cashflow': return cashFlowTips;
      case 'business': return businessTips;
      case 'savings': return savingsTips;
      default: return debtTips;
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'rent': return 'Rent Tab Tips';
      case 'salary': return 'Salary Tab Tips';
      case 'cashflow': return 'Cash Flow Tab Tips';
      case 'business': return 'Business Tab Tips';
      case 'savings': return 'Savings Tab Tips';
      default: return 'Debt Tab Tips';
    }
  };

  const getTheme = () => {
    switch(type) {
      case 'rent': return { color: 'text-indigo-600', bg: 'bg-indigo-50', button: 'bg-indigo-600 shadow-indigo-100', border: 'border-indigo-50' };
      case 'salary': return { color: 'text-amber-600', bg: 'bg-amber-50', button: 'bg-amber-600 shadow-amber-100', border: 'border-amber-50' };
      case 'cashflow': return { color: 'text-emerald-600', bg: 'bg-emerald-50', button: 'bg-emerald-600 shadow-emerald-100', border: 'border-emerald-50' };
      case 'business': return { color: 'text-violet-600', bg: 'bg-violet-50', button: 'bg-violet-600 shadow-violet-100', border: 'border-violet-50' };
      case 'savings': return { color: 'text-amber-600', bg: 'bg-amber-50', button: 'bg-amber-500 shadow-amber-100', border: 'border-amber-50' };
      default: return { color: 'text-blue-600', bg: 'bg-blue-50', button: 'bg-blue-600 shadow-blue-100', border: 'border-blue-50' };
    }
  };

  const tips = getTips();
  const title = getTitle();
  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-[15000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className={`w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-hidden border ${theme.border}`}>
        <div className="p-6 border-b border-slate-50 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center shadow-inner`}>
              <InfoIcon />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">{title}</h2>
              <p className={`text-[10px] font-bold ${theme.color} uppercase tracking-widest mt-1.5`}>User Guide</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
          {tips.map((tip, idx) => (
            <div key={idx} className="flex gap-4 items-start group">
              <div className={`w-6 h-6 ${theme.bg} ${theme.color} rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black mt-0.5 group-hover:scale-110 transition-transform`}>
                {idx + 1}
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed pt-0.5">
                {tip}
              </p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4 shrink-0">
          <div className="text-center py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Application Developer</p>
            <p className="text-sm font-black text-slate-800 tracking-tight">Marjun Peji</p>
          </div>
          <button 
            onClick={onClose}
            className={`w-full py-4 ${theme.button} text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest`}
          >
            Got it, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipsModal;