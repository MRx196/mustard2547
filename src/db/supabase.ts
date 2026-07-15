import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://doqxliqtbwcciryegkjm.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcXhsaXF0YndjY2lyeWVna2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5ODYyNjgsImV4cCI6MjA5OTU2MjI2OH0.650paBULVIHoEdDngrnqo-dG6-a3FApcy-h8aOp23_8';

export const getSupabaseConfig = () => {
  const envUrl = (import.meta.env as any)?.VITE_SUPABASE_URL;
  const envKey = (import.meta.env as any)?.VITE_SUPABASE_ANON_KEY;
  const storedUrl = localStorage.getItem('supabase_url');
  const storedKey = localStorage.getItem('supabase_anon_key');
  
  return {
    url: storedUrl || envUrl || DEFAULT_URL,
    anonKey: storedKey || envKey || DEFAULT_ANON_KEY,
    isCustom: !!(storedUrl || storedKey)
  };
};

const config = getSupabaseConfig();

export const supabase = createClient(config.url, config.anonKey);

// Sign Up isolated staff account via direct REST request to prevent logging out the active admin session
// and to avoid "Multiple GoTrueClient instances detected" console warning.
export const signUpStaffUser = async (email: string, password: string, metadata?: { full_name: string; role: string }) => {
  const cfg = getSupabaseConfig();
  try {
    const response = await fetch(`${cfg.url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': cfg.anonKey
      },
      body: JSON.stringify({ 
        email, 
        password,
        options: {
          data: metadata || {}
        }
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      return { data: null, error: { message: data.msg || data.error_description || 'Signup failed.' } };
    }
    
    // Support both root-level user (email confirmation on) and session-wrapped user (email confirmation off)
    const resolvedUser = data.user || data;
    const resolvedId = data.id || data.user?.id;
    if (resolvedId && !resolvedUser.id) {
      resolvedUser.id = resolvedId;
    }
    
    return { data: { user: resolvedUser }, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message || 'Signup failed due to network error.' } };
  }
};

export interface Congregation {
  id: string;
  name: string;
  created_at: string;
}

export interface Member {
  id: string;
  account_number: string;
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
  type: 'deposit' | 'withdrawal' | 'share_purchase' | 'dividend' | 'loan_disbursement' | 'loan_repayment' | 'momo_in' | 'momo_out';
  amount: number;
  date: string;
  description: string;
  posted_by: string;
}

export interface Loan {
  id: string;
  member_id: string;
  member_name: string;
  principal: number;
  interest_rate: number;
  term_months: number;
  guarantor_id?: string;
  guarantor_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'repaid';
  collateral: string;
  monthly_installment: number;
  outstanding_balance: number;
  created_at: string;
}

export interface Guarantor {
  id: string;
  loan_id: string;
  member_id?: string;
  full_name: string;
  phone_number: string;
  relationship: string;
  amount: number;
  created_at: string;
}

export interface SMSTemplate {
  id: string;
  name: string;
  event: string;
  body: string;
  recipient_type: string;
}

export interface SMSLog {
  id: string;
  timestamp: string;
  recipient_name: string;
  recipient_phone: string;
  message: string;
  event: string;
  status: 'Pending' | 'Sent' | 'Delivered' | 'Failed';
  reference_id: string;
  api_used: string;
}

export interface StaffUser {
  email: string;
  full_name: string;
  role: string;
  status: 'Active' | 'Inactive';
  last_signin: string;
  created_at: string;
  username?: string;
  phone_number?: string;
  auth_id?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_name: string;
  user_email: string;
  user_role: string;
  action: string;
  module: string;
  record_affected: string;
  previous_value: string;
  new_value: string;
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
  member_id?: string;
  member_name?: string;
  phone_number: string;
  amount: number;
  type: 'collection' | 'payout';
  network: string;
  purpose: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  reference: string;
}
