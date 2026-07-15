-- Mustard Seed Welfare Fund (SEGE DISTRICT) - Production Supabase SQL Schema
-- Full migration to Supabase Authentication & Row Level Security (RLS) policies

-- Drop old tables if they exist to start fresh
DROP TABLE IF EXISTS momo_transactions CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS sms_logs CASCADE;
DROP TABLE IF EXISTS sms_templates CASCADE;
DROP TABLE IF EXISTS guarantors CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS beneficiaries CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS staff_users CASCADE; -- drop deprecated table name if lingering
DROP TABLE IF EXISTS congregations CASCADE;

-- 1. Congregations Table
CREATE TABLE congregations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 2. Custom Users Profile Table (linked to Supabase auth.users)
CREATE TABLE users (
    email TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Active' | 'Inactive'
    last_signin TEXT NOT NULL,
    created_at TEXT NOT NULL,
    username TEXT,
    phone_number TEXT,
    auth_id UUID -- references auth.users(id) via Supabase Auth metadata
);

-- Index to quickly resolve Auth ID to public user profile
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- 3. Members Table
CREATE TABLE members (
    id TEXT PRIMARY KEY,
    account_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    dob TEXT NOT NULL,
    marital_status TEXT NOT NULL,
    house_no_gps TEXT,
    landmark TEXT,
    congregation TEXT NOT NULL,
    email TEXT,
    group_name TEXT,
    occupation TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_members_account_number ON members(account_number);
CREATE INDEX idx_members_phone_number ON members(phone_number);

-- 4. Beneficiaries Table
CREATE TABLE beneficiaries (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    house_number TEXT,
    marital_status TEXT,
    relationship TEXT NOT NULL,
    phone_number TEXT NOT NULL
);

CREATE INDEX idx_beneficiaries_member_id ON beneficiaries(member_id);

-- 5. Transactions Table
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    account_number TEXT NOT NULL,
    type TEXT NOT NULL, -- 'deposit' | 'withdrawal' | 'share_purchase' | 'dividend' | 'loan_disbursement' | 'loan_repayment'
    amount NUMERIC(15,2) NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    posted_by TEXT NOT NULL
);

CREATE INDEX idx_transactions_member_id ON transactions(member_id);

-- 6. Loans Table
CREATE TABLE loans (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES members(id) ON DELETE RESTRICT,
    member_name TEXT NOT NULL,
    principal NUMERIC(15,2) NOT NULL,
    interest_rate NUMERIC(5,2) NOT NULL,
    term_months INTEGER NOT NULL,
    guarantor_id TEXT,
    guarantor_name TEXT,
    status TEXT NOT NULL, -- 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'repaid'
    collateral TEXT,
    monthly_installment NUMERIC(15,2) NOT NULL,
    outstanding_balance NUMERIC(15,2) NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_loans_member_id ON loans(member_id);

-- 7. Guarantors Table
CREATE TABLE guarantors (
    id TEXT PRIMARY KEY,
    loan_id TEXT REFERENCES loans(id) ON DELETE CASCADE,
    member_id TEXT,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_guarantors_loan_id ON guarantors(loan_id);

-- 8. SMS Templates Table
CREATE TABLE sms_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    event TEXT NOT NULL,
    body TEXT NOT NULL,
    recipient_type TEXT NOT NULL
);

-- 9. SMS Logs Table
CREATE TABLE sms_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    event TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Pending' | 'Sent' | 'Delivered' | 'Failed'
    reference_id TEXT NOT NULL,
    api_used TEXT NOT NULL
);

-- 10. Audit Logs Table
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    record_affected TEXT NOT NULL,
    previous_value TEXT NOT NULL,
    new_value TEXT NOT NULL
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- 11. Chart of Accounts (COA) Table
CREATE TABLE chart_of_accounts (
    account_no INTEGER PRIMARY KEY,
    account_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses'
    balance NUMERIC(15,2) NOT NULL
);

-- 12. Journal Entries Table
CREATE TABLE journal_entries (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    debits JSONB NOT NULL,
    credits JSONB NOT NULL
);

-- 13. Mobile Money Transactions Table
CREATE TABLE momo_transactions (
    id TEXT PRIMARY KEY,
    member_id TEXT,
    member_name TEXT,
    phone_number TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    type TEXT NOT NULL, -- 'collection' | 'payout'
    network TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL, -- 'pending' | 'success' | 'failed'
    timestamp TEXT NOT NULL,
    reference TEXT UNIQUE NOT NULL
);

--------------------------------------------------------------------------------
-- SECURE ROLE-BASED ACCESS CONTROL (RLS) IMPLEMENTATION
--------------------------------------------------------------------------------

-- Security definer lookup helper function to resolve auth user role without policy recursion loops
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text SECURITY DEFINER AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE auth_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE congregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE momo_transactions ENABLE ROW LEVEL SECURITY;

-- 1. users Table Policies
CREATE POLICY "users_select" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_write" ON public.users FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator'));

-- 2. congregations Table Policies
CREATE POLICY "cong_select" ON public.congregations FOR SELECT TO authenticated USING (true);
CREATE POLICY "cong_all" ON public.congregations FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant'));

-- 3. members Table Policies
CREATE POLICY "members_select" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "members_all" ON public.members FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant'));

-- 4. beneficiaries Table Policies
CREATE POLICY "beneficiaries_select" ON public.beneficiaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "beneficiaries_all" ON public.beneficiaries FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant'));

-- 5. transactions Table Policies
CREATE POLICY "tx_select" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "tx_insert" ON public.transactions FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant', 'Collection Officer', 'Collections Officer'));
CREATE POLICY "tx_modify" ON public.transactions FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant'));

-- 6. loans Table Policies
CREATE POLICY "loans_select" ON public.loans FOR SELECT TO authenticated USING (true);
CREATE POLICY "loans_all" ON public.loans FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Loan Officer')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Loan Officer'));

-- 7. guarantors Table Policies
CREATE POLICY "guarantors_select" ON public.guarantors FOR SELECT TO authenticated USING (true);
CREATE POLICY "guarantors_all" ON public.guarantors FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Loan Officer')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Loan Officer'));

-- 8. sms_templates Table Policies
CREATE POLICY "sms_templates_select" ON public.sms_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "sms_templates_all" ON public.sms_templates FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant'));

-- 9. sms_logs Table Policies
CREATE POLICY "sms_logs_select" ON public.sms_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "sms_logs_all" ON public.sms_logs FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant'));

-- 10. audit_logs Table Policies
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "audit_modify" ON public.audit_logs FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin'));

-- 11. chart_of_accounts Table Policies
CREATE POLICY "coa_select" ON public.chart_of_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "coa_all" ON public.chart_of_accounts FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant'));

-- 12. journal_entries Table Policies
CREATE POLICY "journal_select" ON public.journal_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "journal_all" ON public.journal_entries FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant'));

-- 13. momo_transactions Table Policies
CREATE POLICY "momo_select" ON public.momo_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "momo_insert" ON public.momo_transactions FOR INSERT TO authenticated WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant', 'Collection Officer', 'Collections Officer'));
CREATE POLICY "momo_modify" ON public.momo_transactions FOR ALL TO authenticated USING (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant')) WITH CHECK (public.get_user_role() IN ('Super Administrator', 'Super Admin', 'Administrator', 'Accountant'));

-- Seed Default Production Super Administrator Profile
INSERT INTO users (email, full_name, role, status, last_signin, created_at, username, phone_number, auth_id)
VALUES ('mrxmail20@gmail.com', 'Super Admin', 'Super Administrator', 'Active', 'N/A', '2026-07-15T10:21:40Z', 'superadmin', '+233240001100', NULL)
ON CONFLICT (email) DO NOTHING;
