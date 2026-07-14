-- Mustard Seed Welfare Fund (SEGE DISTRICT) - Supabase SQL Schema
-- PostgreSQL database schema definition for the Credit Union Management System

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Members Table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_number VARCHAR(20) UNIQUE NOT NULL, -- Format: SDMS 0001, SDMS 0002
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE NOT NULL,
    marital_status VARCHAR(20) CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
    house_no_gps VARCHAR(50) NOT NULL,
    landmark VARCHAR(150) NOT NULL,
    congregation VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    group_name VARCHAR(150),
    occupation VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for quick lookups on account numbers and phone numbers
CREATE INDEX idx_members_account_number ON members(account_number);
CREATE INDEX idx_members_phone_number ON members(phone_number);

-- 2. Beneficiaries Table (Minimum 5 nominations support)
CREATE TABLE IF NOT EXISTS beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    age INTEGER CHECK (age >= 0),
    percentage NUMERIC(5,2) CHECK (percentage >= 0 AND percentage <= 100),
    house_number VARCHAR(100) NOT NULL,
    marital_status VARCHAR(20),
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching beneficiaries per member
CREATE INDEX idx_beneficiaries_member_id ON beneficiaries(member_id);

-- 3. Transactions Table (Savings, deposits, withdrawals, share purchases)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    account_number VARCHAR(20) NOT NULL,
    type VARCHAR(30) CHECK (type IN ('deposit', 'withdrawal', 'share_purchase', 'dividend', 'loan_disbursement', 'loan_repayment')),
    amount NUMERIC(12,2) CHECK (amount > 0),
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    description TEXT,
    posted_by VARCHAR(100) NOT NULL -- Name/role of officer who posted
);

CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_type ON transactions(type);

-- 4. Loans Table (With guarantor support)
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE RESTRICT,
    member_name VARCHAR(150) NOT NULL,
    principal NUMERIC(12,2) CHECK (principal > 0),
    interest_rate NUMERIC(5,2) CHECK (interest_rate >= 0),
    term_months INTEGER CHECK (term_months > 0),
    guarantor_id UUID REFERENCES members(id) ON DELETE RESTRICT,
    guarantor_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed', 'active', 'repaid')) DEFAULT 'pending',
    collateral TEXT NOT NULL,
    monthly_installment NUMERIC(12,2) NOT NULL,
    outstanding_balance NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_guarantor_id ON loans(guarantor_id);
CREATE INDEX idx_loans_status ON loans(status);

-- 5. Chart of Accounts Table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    account_no INTEGER PRIMARY KEY, -- E.g. 1000, 2000, 3000
    account_name VARCHAR(100) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses')) NOT NULL,
    balance NUMERIC(15,2) DEFAULT 0.00 NOT NULL
);

-- Insert Initial Accounts
INSERT INTO chart_of_accounts (account_no, account_name, category, balance) VALUES
(1000, 'Cash in Hand', 'Assets', 45200.00),
(1100, 'Cash at Bank (Hubtel Wallet)', 'Assets', 25000.00),
(1200, 'Accounts Receivable', 'Assets', 1500.00),
(1500, 'Office Equipment', 'Assets', 12000.00),
(1600, 'Outstanding Loan Portfolio', 'Assets', 34000.00),
(2000, 'Accounts Payable', 'Liabilities', 800.00),
(2100, 'Bank Loans Payable', 'Liabilities', 10000.00),
(2200, 'Member Savings Deposits', 'Liabilities', 65000.00),
(2300, 'Member Shares', 'Liabilities', 35000.00),
(3000, 'Owner''s Capital', 'Equity', 15000.00),
(3100, 'Retained Earnings', 'Equity', 5900.00),
(4000, 'Interest Income from Loans', 'Revenue', 4200.00),
(4100, 'Membership Fees & Charges', 'Revenue', 1200.00),
(4200, 'SMS Fee Revenue', 'Revenue', 500.00),
(5000, 'Salaries Expense', 'Expenses', 2800.00),
(5100, 'Office Rent Expense', 'Expenses', 1200.00),
(5200, 'Utilities Expense', 'Expenses', 350.00),
(5300, 'SMS Gateway Expenses', 'Expenses', 150.00),
(5400, 'Marketing & Welfare Expenses', 'Expenses', 500.00)
ON CONFLICT (account_no) DO NOTHING;

-- 6. Journal Entries Table (Double-entry journal vouchers)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    description TEXT NOT NULL,
    debits JSONB NOT NULL,  -- Format: [{"account_no": 1000, "amount": 100}]
    credits JSONB NOT NULL -- Format: [{"account_no": 2200, "amount": 100}]
);

-- 7. SMS Gateway Logs
CREATE TABLE IF NOT EXISTS sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    recipient VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'delivered', 'failed')) DEFAULT 'pending',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    api_used VARCHAR(20) CHECK (api_used IN ('Hubtel', 'Arkesel', 'Mock')) NOT NULL
);

-- 8. SMS Templates Table
CREATE TABLE IF NOT EXISTS sms_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(30) UNIQUE NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'loan_disbursement', 'loan_repayment', 'dividend', 'reminder')),
    content TEXT NOT NULL
);

INSERT INTO sms_templates (type, content) VALUES
('deposit', 'Dear {{MemberName}}, GHS {{Amount}} deposited to your Mustard Seed Welfare savings. New Balance: GHS {{Balance}}. Acc: {{AccountNumber}}. Thank you!'),
('withdrawal', 'Dear {{MemberName}}, Withdrawal of GHS {{Amount}} from your Mustard Seed savings was successful. Current Balance: GHS {{Balance}}. Acc: {{AccountNumber}}.'),
('loan_disbursement', 'Hello {{MemberName}}, Your loan of GHS {{Amount}} has been approved and disbursed. Monthly installment is GHS {{Installment}} for {{Term}} months. Thank you.'),
('loan_repayment', 'Dear {{MemberName}}, Loan repayment of GHS {{Amount}} received. Your outstanding loan balance is GHS {{LoanBalance}}. Ref: {{AccountNumber}}.'),
('dividend', 'Congratulations {{MemberName}}! Dividend of GHS {{Amount}} has been credited to your savings based on your share balance. Mustard Seed Welfare Fund.'),
('reminder', 'Dear {{MemberName}}, this is a friendly reminder that your loan payment of GHS {{Amount}} is due on {{DueDate}}. Please pay to avoid penalties.')
ON CONFLICT (type) DO NOTHING;

-- 9. Mobile Money Transactions Table
CREATE TABLE IF NOT EXISTS momo_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE RESTRICT,
    member_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) CHECK (type IN ('collection', 'payout')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reference VARCHAR(50) UNIQUE NOT NULL
);

-- 10. Audit Logs Table (For security & compliance audits)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_role VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Enable RLS (Row Level Security) and basic access controls (Optional setup)
-- ALTER TABLE members ENABLE ROW LEVEL SECURITY;
