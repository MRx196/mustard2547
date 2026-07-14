-- Mustard Seed Welfare Fund (SEGE DISTRICT) - Corrected Supabase SQL Schema
-- Aligning database columns and types exactly with the application's React state and mockDb requirements.

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
DROP TABLE IF EXISTS staff_users CASCADE;
DROP TABLE IF EXISTS congregations CASCADE;

-- 1. Congregations Table
CREATE TABLE congregations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- 2. Staff Users Table
CREATE TABLE staff_users (
    email TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Active' | 'Inactive'
    last_signin TEXT NOT NULL,
    created_at TEXT NOT NULL,
    username TEXT,
    phone_number TEXT,
    auth_user_id TEXT
);

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

-- Index for quick lookups on account numbers and phone numbers
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
