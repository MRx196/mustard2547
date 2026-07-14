import { createClient } from '@supabase/supabase-js';

// Default keys provided by the user
const DEFAULT_URL = 'https://doqxliqtbwcciryegkjm.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcXhsaXF0YndjY2lyeWVna2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5ODYyNjgsImV4cCI6MjA5OTU2MjI2OH0.650paBULVIHoEdDngrnqo-dG6-a3FApcy-h8aOp23_8';

// Retrieve credentials from localStorage or use defaults
export const getSupabaseConfig = () => {
  const storedUrl = localStorage.getItem('supabase_url');
  const storedKey = localStorage.getItem('supabase_anon_key');
  
  return {
    url: storedUrl || DEFAULT_URL,
    anonKey: storedKey || DEFAULT_ANON_KEY,
    isCustom: !!(storedUrl || storedKey)
  };
};

const config = getSupabaseConfig();

export const supabase = createClient(config.url, config.anonKey);

export interface Member {
  id: string;
  account_number: string; // Auto-generated like SDMS 0001, SDMS 0002
  full_name: string;
  gender: string;
  dob: string;
  marital_status: string;
  house_no_gps: string;
  landmark: string;
  congregation: string;
  email: string;
  group_name: string;
  occupation: string;
  phone_number: string;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  member_id: string;
  full_name: string;
  age: number;
  percentage: number;
  house_number: string;
  marital_status: string;
  relationship: string;
  phone_number: string;
}

export interface Transaction {
  id: string;
  member_id: string;
  account_number: string;
  type: 'deposit' | 'withdrawal' | 'share_purchase' | 'dividend' | 'loan_disbursement' | 'loan_repayment';
  amount: number;
  date: string;
  description: string;
  posted_by: string; // user role/name
}

export interface Loan {
  id: string;
  member_id: string;
  member_name: string;
  principal: number;
  interest_rate: number;
  term_months: number;
  guarantor_id: string;
  guarantor_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'repaid';
  collateral: string;
  monthly_installment: number;
  outstanding_balance: number;
  created_at: string;
}

export interface SMSLog {
  id: string;
  member_id?: string;
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  timestamp: string;
  api_used: 'Hubtel' | 'Arkesel' | 'Mock';
}

export interface SMSTemplate {
  id: string;
  type: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'dividend' | 'reminder';
  content: string;
}

export interface AuditLog {
  id: string;
  user_role: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AccountCOA {
  account_no: number;
  account_name: string;
  category: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses';
  balance: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debits: { account_no: number; amount: number }[];
  credits: { account_no: number; amount: number }[];
}

export interface MobileMoneyTransaction {
  id: string;
  member_id: string;
  member_name: string;
  phone_number: string;
  amount: number;
  type: 'collection' | 'payout';
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  reference: string;
}
