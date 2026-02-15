
export type TabType = 'debt' | 'rent' | 'cashflow' | 'salary' | 'business' | 'savings' | 'supply' | 'product';

export interface AppUser {
  id: string;
  username: string;
  password: string;
  restrictions: string[] | { allowedTabs: string[], tabPermissions: Record<string, string[]> }; 
}

export interface AppSession {
  role: 'master' | 'user';
  username?: string;
  password?: string;
  allowedTabs?: string[];
  tabPermissions?: Record<string, string[]>;
  isOffline?: boolean;
}

export interface Investor {
  id: string;
  name: string;
  bankName: string;
  bankNumber: string;
  amount: number;
  dateInvested: string; // ISO Date
  percentPerMonth: number;
  amountPerMonth: number;
  remarks?: string;
  signature?: string; // Base64 signature image
  signatureDate?: string; // ISO date
}

export interface DebtRecord {
  id: string;
  name: string;
  amount: number;
  price?: number; // Unit price for Supply/Product items
  actualAmount?: number; // Specifically for savings/planned expenses
  date: string; // ISO format (Start Date)
  endDate?: string; // ISO format (End Date)
  remarks: string;
  facebookId?: string;
  contactNumber?: string; // Single number for Phone, WhatsApp, and KakaoTalk
  status?: 'active' | 'finished' | 'cancelled' | 'deleted' | 'legacy';
  tab?: string; // The source tab name (used for history records)
  transactionType?: 'income' | 'expense'; // Specifically for cashflow/savings/supply/product tabs
  supplySource?: 'production' | 'delivery' | 'return' | 'sale' | 'waste' | 'personal' | 'giveaway' | 'disposal'; // For Supply/Product transactions
  businessEntryType?: 'capital' | 'expense' | 'earning'; // Specifically for business tabs
  itemCode?: string; // Specifically for Supply/Product items
  minAmount?: number; // Reorder point
  maxAmount?: number; // Inventory capacity
  isSupplyTransaction?: boolean; // Flag for routing supply movements to log sheets
  signature?: string; // Base64 signature image
  signatureDate?: string; // ISO date of signature
  signerAddress?: string; // Address from signature
  signerName?: string; // Actual name of the person who signed
}

export interface CurrencyConfig {
  primary: string;
  secondary: string;
  useSecondary: boolean;
  exchangeRate: number;
  lastUpdated?: number;
}

export interface AppSettings {
  spreadsheetUrl: string;
  scriptUrl: string;
  personalScriptUrl?: string; // Separate script for Personal Ledger backups
  appPin?: string; // Managed Master Passcode
  deletedHistory: DebtRecord[]; // Global history across all tabs
  tabTypes: Record<string, TabType>;
  earningsAdjustments?: {
    month: number;
    year: number;
  };
  cashflowInitialBalances?: Record<string, number>; // Initial bank balance per tab
  realizedEarnings?: number; // Sum of finished bookings for current year
  copyBullet?: string;
  copyFooter?: string;
  loadingColor?: string; // Hex color for loading screen customization
  biometricSensitiveEnabled?: boolean; // Enable biometrics for PIN actions
  currencyConfigs?: Record<string, CurrencyConfig>; // Per-tab currency settings
  restrictedTabMode?: boolean; 
  unrestrictedTabNames?: string[];
  authorizedSignature?: string; // Base64 image of the authorized signer
  publicUrl?: string; // Public hosting URL for banner-free signing
}

export interface HistorySnapshot {
  allRecords: Record<string, DebtRecord[]>;
  tabs: string[];
  tabTypes: Record<string, TabType>;
  deletedHistory: DebtRecord[];
  earningsAdjustments?: {
    month: number;
    year: number;
  };
  cashflowInitialBalances?: Record<string, number>;
  copyBullet?: string;
  copyFooter?: string;
  lastDeletedId?: string;
}

export interface DashboardStats {
  overdueCount: number;
  totalDueAmount: number;
  todayDueAmount: number;
  tomorrowDueAmount: number;
  rentalMonthCount?: number; 
  rentalYearCount?: number;  
  rentalMonthAmount?: number; 
  rentalYearAmount?: number;
  rentalYearCancelledCount?: number;
  rentalYearFinishedCount?: number;
  cashflowNetBalance?: number;
  cashflowIncoming?: number;
  cashflowOutgoing?: number;
  cashflowInitialBalance?: number;
  cashflowCurrentBankBalance?: number;
  salaryMonthlyTotal?: number;
  salaryYearlyTotal?: number;
  businessCapital?: number;
  businessExpenses?: number;
  businessNetEarning?: number;
  businessInCycle?: boolean;
  businessCycleDescription?: string;
  savingsIncome?: number;
  savingsTarget?: number;
  savingsCurrent?: number;
  savingsTotalExpenses?: number;
  supplyTotalValue?: number;
  supplyActiveCount?: number;
  supplyTotalQuantity?: number;
  supplyUnderStockCount?: number;
  supplyOverStockCount?: number;
  productTotalValue?: number;
  productActiveCount?: number;
  productTotalQuantity?: number;
  productUnderStockCount?: number;
  productOverStockCount?: number;
}

export interface TabData {
  name: string;
  isSystem?: boolean;
}
