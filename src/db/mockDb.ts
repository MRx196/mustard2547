import type { Member, Beneficiary, Transaction, Loan, SMSLog, SMSTemplate, AuditLog, AccountCOA, JournalEntry, MobileMoneyTransaction } from './supabase';

// Generate UUID/IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to format date
const getNowString = () => new Date().toISOString();

// Formats number to SDMS 0001
export const generateAccountNumber = (index: number): string => {
  return `SDMS ${String(index).padStart(4, '0')}`;
};

// Initial Chart of Accounts structure
const INITIAL_COA: AccountCOA[] = [
  { account_no: 1000, account_name: 'Cash in Hand', category: 'Assets', balance: 45200 },
  { account_no: 1100, account_name: 'Cash at Bank (Hubtel Wallet)', category: 'Assets', balance: 25000 },
  { account_no: 1200, account_name: 'Accounts Receivable', category: 'Assets', balance: 1500 },
  { account_no: 1500, account_name: 'Office Equipment', category: 'Assets', balance: 12000 },
  { account_no: 1600, account_name: 'Outstanding Loan Portfolio', category: 'Assets', balance: 34000 },
  { account_no: 2000, account_name: 'Accounts Payable', category: 'Liabilities', balance: 800 },
  { account_no: 2100, account_name: 'Bank Loans Payable', category: 'Liabilities', balance: 10000 },
  { account_no: 2200, account_name: 'Member Savings Deposits', category: 'Liabilities', balance: 65000 },
  { account_no: 2300, account_name: 'Member Shares', category: 'Liabilities', balance: 35000 },
  { account_no: 3000, account_name: "Owner's Capital", category: 'Equity', balance: 15000 },
  { account_no: 3100, account_name: 'Retained Earnings', category: 'Equity', balance: 5900 },
  { account_no: 4000, account_name: 'Interest Income from Loans', category: 'Revenue', balance: 4200 },
  { account_no: 4100, account_name: 'Membership Fees & Charges', category: 'Revenue', balance: 1200 },
  { account_no: 4200, account_name: 'SMS Fee Revenue', category: 'Revenue', balance: 500 },
  { account_no: 5000, account_name: 'Salaries Expense', category: 'Expenses', balance: 2800 },
  { account_no: 5100, account_name: 'Office Rent Expense', category: 'Expenses', balance: 1200 },
  { account_no: 5200, account_name: 'Utilities Expense', category: 'Expenses', balance: 350 },
  { account_no: 5300, account_name: 'SMS Gateway Expenses', category: 'Expenses', balance: 150 },
  { account_no: 5400, account_name: 'Marketing & Welfare Expenses', category: 'Expenses', balance: 500 }
];

// Initial Members list
const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    account_number: 'SDMS 0001',
    full_name: 'John Kwesi Tetteh',
    gender: 'Male',
    dob: '1982-05-14',
    marital_status: 'Married',
    house_no_gps: 'SG-024-1928',
    landmark: 'Behind Sege Methodist Church',
    congregation: 'Sege Central Methodist',
    email: 'john.tetteh@gmail.com',
    group_name: 'Mustard Seed Joy Fellowship',
    occupation: 'Fisherman & Trader',
    phone_number: '+233244123456',
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'm2',
    account_number: 'SDMS 0002',
    full_name: 'Elizabeth Naa Shormey',
    gender: 'Female',
    dob: '1990-11-23',
    marital_status: 'Married',
    house_no_gps: 'SG-008-5421',
    landmark: 'Opposite Ada District Assembly',
    congregation: 'Sege Presbyterian Church',
    email: 'elishormey@yahoo.com',
    group_name: 'Faithful Women Association',
    occupation: 'Market Retailer',
    phone_number: '+233207654321',
    created_at: '2026-02-15T14:30:00Z'
  },
  {
    id: 'm3',
    account_number: 'SDMS 0003',
    full_name: 'Pastor Abraham Doku',
    gender: 'Male',
    dob: '1975-04-02',
    marital_status: 'Married',
    house_no_gps: 'SG-099-0012',
    landmark: 'Near Sege Health Clinic',
    congregation: 'Mustard Seed Assembly of God',
    email: 'abraham.doku@seedag.org',
    group_name: 'Church Council Group',
    occupation: 'Minister of Religion',
    phone_number: '+233277334455',
    created_at: '2026-03-01T09:15:00Z'
  },
  {
    id: 'm4',
    account_number: 'SDMS 0004',
    full_name: 'Kofi Emmanuel Boakye',
    gender: 'Male',
    dob: '1995-08-30',
    marital_status: 'Single',
    house_no_gps: 'SG-112-9908',
    landmark: 'Sege High School Junction',
    congregation: 'Catholic Church Sege',
    email: 'kofiemma@outlook.com',
    group_name: 'Youth Welfare Fund',
    occupation: 'Teacher',
    phone_number: '+233541223344',
    created_at: '2026-04-12T11:45:00Z'
  }
];

// Initial Beneficiaries list (At least 5 for John Kwesi Tetteh)
const INITIAL_BENEFICIARIES: Beneficiary[] = [
  // Beneficiaries for SDMS 0001 (5 Beneficiaries)
  {
    id: 'b1',
    member_id: 'm1',
    full_name: 'Mary Aku Tetteh',
    age: 38,
    percentage: 40,
    house_number: 'SG-024-1928',
    marital_status: 'Married',
    relationship: 'Spouse',
    phone_number: '+233245667788'
  },
  {
    id: 'b2',
    member_id: 'm1',
    full_name: 'Isaac Tetteh',
    age: 15,
    percentage: 15,
    house_number: 'SG-024-1928',
    marital_status: 'Single',
    relationship: 'Son',
    phone_number: '+233245667789'
  },
  {
    id: 'b3',
    member_id: 'm1',
    full_name: 'Grace Tetteh',
    age: 12,
    percentage: 15,
    house_number: 'SG-024-1928',
    marital_status: 'Single',
    relationship: 'Daughter',
    phone_number: 'N/A'
  },
  {
    id: 'b4',
    member_id: 'm1',
    full_name: 'Daniel Tetteh',
    age: 8,
    percentage: 15,
    house_number: 'SG-024-1928',
    marital_status: 'Single',
    relationship: 'Son',
    phone_number: 'N/A'
  },
  {
    id: 'b5',
    member_id: 'm1',
    full_name: 'Comfort Tetteh',
    age: 26,
    percentage: 15,
    house_number: 'SG-012-9900',
    marital_status: 'Single',
    relationship: 'Sister',
    phone_number: '+233240099887'
  },
  // Beneficiaries for SDMS 0002
  {
    id: 'b6',
    member_id: 'm2',
    full_name: 'Samuel Shormey',
    age: 42,
    percentage: 60,
    house_number: 'SG-008-5421',
    marital_status: 'Married',
    relationship: 'Spouse',
    phone_number: '+233209887766'
  },
  {
    id: 'b7',
    member_id: 'm2',
    full_name: 'Patience Shormey',
    age: 18,
    percentage: 40,
    house_number: 'SG-008-5421',
    marital_status: 'Single',
    relationship: 'Daughter',
    phone_number: '+233501122334'
  },
  // Beneficiaries for SDMS 0003
  {
    id: 'b8',
    member_id: 'm3',
    full_name: 'Sarah Doku',
    age: 45,
    percentage: 50,
    house_number: 'SG-099-0012',
    marital_status: 'Married',
    relationship: 'Spouse',
    phone_number: '+233271122334'
  },
  {
    id: 'b9',
    member_id: 'm3',
    full_name: 'Lois Doku',
    age: 20,
    percentage: 25,
    house_number: 'SG-099-0012',
    marital_status: 'Single',
    relationship: 'Daughter',
    phone_number: '+233271122335'
  },
  {
    id: 'b10',
    member_id: 'm3',
    full_name: 'Eunice Doku',
    age: 17,
    percentage: 25,
    house_number: 'SG-099-0012',
    marital_status: 'Single',
    relationship: 'Daughter',
    phone_number: 'N/A'
  }
];

// Initial Transactions list
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', member_id: 'm1', account_number: 'SDMS 0001', type: 'deposit', amount: 5000, date: '2026-01-10T11:00:00Z', description: 'Initial Savings Deposit', posted_by: 'Super Admin' },
  { id: 't2', member_id: 'm1', account_number: 'SDMS 0001', type: 'share_purchase', amount: 1500, date: '2026-01-10T11:15:00Z', description: 'Share Capital Purchase', posted_by: 'Super Admin' },
  { id: 't3', member_id: 'm2', account_number: 'SDMS 0002', type: 'deposit', amount: 3500, date: '2026-02-15T15:00:00Z', description: 'Savings Deposit', posted_by: 'Accountant' },
  { id: 't4', member_id: 'm2', account_number: 'SDMS 0002', type: 'share_purchase', amount: 2000, date: '2026-02-15T15:10:00Z', description: 'Share Capital Purchase', posted_by: 'Accountant' },
  { id: 't5', member_id: 'm3', account_number: 'SDMS 0003', type: 'deposit', amount: 8000, date: '2026-03-01T10:00:00Z', description: 'Initial Deposit & Welfare Shares', posted_by: 'Super Admin' },
  { id: 't6', member_id: 'm3', account_number: 'SDMS 0003', type: 'share_purchase', amount: 3000, date: '2026-03-01T10:15:00Z', description: 'Share Capital Purchase', posted_by: 'Super Admin' },
  { id: 't7', member_id: 'm1', account_number: 'SDMS 0001', type: 'deposit', amount: 1000, date: '2026-03-10T12:00:00Z', description: 'Monthly Contribution', posted_by: 'Collection Officer' },
  { id: 't8', member_id: 'm2', account_number: 'SDMS 0002', type: 'deposit', amount: 800, date: '2026-03-15T16:00:00Z', description: 'Weekly Savings Collection', posted_by: 'Collection Officer' }
];

// Initial Loans list
const INITIAL_LOANS: Loan[] = [
  {
    id: 'l1',
    member_id: 'm1',
    member_name: 'John Kwesi Tetteh',
    principal: 10000,
    interest_rate: 12,
    term_months: 6,
    guarantor_id: 'm2',
    guarantor_name: 'Elizabeth Naa Shormey',
    status: 'disbursed',
    collateral: 'Outboard Fishing Motor Serial #108A77B',
    monthly_installment: 1866.67,
    outstanding_balance: 6400,
    created_at: '2026-02-01T09:00:00Z'
  },
  {
    id: 'l2',
    member_id: 'm2',
    member_name: 'Elizabeth Naa Shormey',
    principal: 5000,
    interest_rate: 10,
    term_months: 4,
    guarantor_id: 'm3',
    guarantor_name: 'Pastor Abraham Doku',
    status: 'repaid',
    collateral: 'Shop Inventory (10 crates canned milk, cooking oil)',
    monthly_installment: 1375,
    outstanding_balance: 0,
    created_at: '2026-02-20T11:00:00Z'
  },
  {
    id: 'l3',
    member_id: 'm3',
    member_name: 'Pastor Abraham Doku',
    principal: 15000,
    interest_rate: 15,
    term_months: 12,
    guarantor_id: 'm1',
    guarantor_name: 'John Kwesi Tetteh',
    status: 'approved',
    collateral: 'Church Sound System Equipment',
    monthly_installment: 1437.5,
    outstanding_balance: 15000,
    created_at: '2026-07-01T15:00:00Z'
  },
  {
    id: 'l4',
    member_id: 'm4',
    member_name: 'Kofi Emmanuel Boakye',
    principal: 3000,
    interest_rate: 10,
    term_months: 3,
    guarantor_id: 'm2',
    guarantor_name: 'Elizabeth Naa Shormey',
    status: 'pending',
    collateral: 'Personal Laptop HP ProBook & TV Screen',
    monthly_installment: 1100,
    outstanding_balance: 3000,
    created_at: '2026-07-10T14:00:00Z'
  }
];

// Initial Custom SMS templates
const INITIAL_SMS_TEMPLATES: SMSTemplate[] = [
  { id: 's1', type: 'deposit', content: 'Dear {{MemberName}}, GHS {{Amount}} deposited to your Mustard Seed Welfare savings. New Balance: GHS {{Balance}}. Acc: {{AccountNumber}}. Thank you!' },
  { id: 's2', type: 'withdrawal', content: 'Dear {{MemberName}}, Withdrawal of GHS {{Amount}} from your Mustard Seed savings was successful. Current Balance: GHS {{Balance}}. Acc: {{AccountNumber}}.' },
  { id: 's3', type: 'loan_disbursement', content: 'Hello {{MemberName}}, Your loan of GHS {{Amount}} has been approved and disbursed. Monthly installment is GHS {{Installment}} for {{Term}} months. Thank you.' },
  { id: 's4', type: 'loan_repayment', content: 'Dear {{MemberName}}, Loan repayment of GHS {{Amount}} received. Your outstanding loan balance is GHS {{LoanBalance}}. Ref: {{AccountNumber}}.' },
  { id: 's5', type: 'dividend', content: 'Congratulations {{MemberName}}! Dividend of GHS {{Amount}} has been credited to your savings based on your share balance. Mustard Seed Welfare Fund.' },
  { id: 's6', type: 'reminder', content: 'Dear {{MemberName}}, this is a friendly reminder that your loan payment of GHS {{Amount}} is due on {{DueDate}}. Please pay to avoid penalties.' }
];

// Initial SMS logs
const INITIAL_SMS_LOGS: SMSLog[] = [
  { id: 'sms1', member_id: 'm1', recipient: '+233244123456', message: 'Dear John Kwesi Tetteh, GHS 5000.00 deposited to your Mustard Seed Welfare savings. New Balance: GHS 5000.00. Acc: SDMS 0001. Thank you!', status: 'delivered', timestamp: '2026-01-10T11:00:05Z', api_used: 'Hubtel' },
  { id: 'sms2', member_id: 'm1', recipient: '+233244123456', message: 'Dear John Kwesi Tetteh, Loan repayment of GHS 1866.67 received. Your outstanding loan balance is GHS 8133.33. Ref: SDMS 0001.', status: 'delivered', timestamp: '2026-03-01T10:05:00Z', api_used: 'Hubtel' },
  { id: 'sms3', member_id: 'm2', recipient: '+233207654321', message: 'Dear Elizabeth Naa Shormey, GHS 3500.00 deposited to your Mustard Seed Welfare savings. New Balance: GHS 3500.00. Acc: SDMS 0002. Thank you!', status: 'delivered', timestamp: '2026-02-15T15:00:08Z', api_used: 'Arkesel' },
  { id: 'sms4', member_id: 'm3', recipient: '+233277334455', message: 'Dear Pastor Abraham Doku, GHS 8000.00 deposited to your Mustard Seed Welfare savings. New Balance: GHS 8000.00. Acc: SDMS 0003. Thank you!', status: 'delivered', timestamp: '2026-03-01T10:00:10Z', api_used: 'Hubtel' }
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'a1', user_role: 'Super Admin', user_name: 'Eric Kwetey (Admin)', action: 'System Initialized', details: 'Database initialized with standard Chart of Accounts & Seed Members.', timestamp: '2026-07-14T05:00:00Z' },
  { id: 'a2', user_role: 'Accountant', user_name: 'Theresa Mensah (Accountant)', action: 'View Ledger', details: 'Accountant logged in and generated Q2 Financial Statement.', timestamp: '2026-07-14T05:10:00Z' },
  { id: 'a3', user_role: 'Loan Officer', user_name: 'Daniel Lartey (Loan Officer)', action: 'Review Loan', details: 'Reviewed Loan Application l4 for Kofi Emmanuel Boakye.', timestamp: '2026-07-14T05:25:00Z' }
];

// Initial Journal Entries representing standard transaction entries
const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je1',
    date: '2026-01-10T11:00:00Z',
    description: 'Post initial savings deposit for John Kwesi Tetteh',
    debits: [{ account_no: 1000, amount: 5000 }],
    credits: [{ account_no: 2200, amount: 5000 }]
  },
  {
    id: 'je2',
    date: '2026-01-10T11:15:00Z',
    description: 'Post shares purchase for John Kwesi Tetteh',
    debits: [{ account_no: 1000, amount: 1500 }],
    credits: [{ account_no: 2300, amount: 1500 }]
  },
  {
    id: 'je3',
    date: '2026-02-15T15:00:00Z',
    description: 'Post savings deposit for Elizabeth Naa Shormey',
    debits: [{ account_no: 1000, amount: 3500 }],
    credits: [{ account_no: 2200, amount: 3500 }]
  },
  {
    id: 'je4',
    date: '2026-02-15T15:10:00Z',
    description: 'Post shares purchase for Elizabeth Naa Shormey',
    debits: [{ account_no: 1000, amount: 2000 }],
    credits: [{ account_no: 2300, amount: 2000 }]
  },
  {
    id: 'je5',
    date: '2026-03-01T10:00:00Z',
    description: 'Post initial savings deposit for Pastor Abraham Doku',
    debits: [{ account_no: 1000, amount: 8000 }],
    credits: [{ account_no: 2200, amount: 8000 }]
  },
  {
    id: 'je6',
    date: '2026-03-01T10:15:00Z',
    description: 'Post shares purchase for Pastor Abraham Doku',
    debits: [{ account_no: 1000, amount: 3000 }],
    credits: [{ account_no: 2300, amount: 3000 }]
  },
  {
    id: 'je7',
    date: '2026-03-10T12:00:00Z',
    description: 'Collection deposit for SDMS 0001',
    debits: [{ account_no: 1000, amount: 1000 }],
    credits: [{ account_no: 2200, amount: 1000 }]
  },
  {
    id: 'je8',
    date: '2026-03-15T16:00:00Z',
    description: 'Collection deposit for SDMS 0002',
    debits: [{ account_no: 1000, amount: 800 }],
    credits: [{ account_no: 2200, amount: 800 }]
  }
];

const INITIAL_MOMO_TRANSACTIONS: MobileMoneyTransaction[] = [
  { id: 'mo1', member_id: 'm1', member_name: 'John Kwesi Tetteh', phone_number: '+233244123456', amount: 500, type: 'collection', status: 'success', timestamp: '2026-07-10T09:12:00Z', reference: 'MOMO-HT-99812' },
  { id: 'mo2', member_id: 'm2', member_name: 'Elizabeth Naa Shormey', phone_number: '+233207654321', amount: 1500, type: 'payout', status: 'success', timestamp: '2026-07-12T14:23:00Z', reference: 'MOMO-AK-88712' },
  { id: 'mo3', member_id: 'm3', member_name: 'Pastor Abraham Doku', phone_number: '+233277334455', amount: 1000, type: 'collection', status: 'pending', timestamp: '2026-07-14T05:30:00Z', reference: 'MOMO-HT-12349' }
];

export const mockDb = {
  initialize: () => {
    if (!localStorage.getItem('members')) localStorage.setItem('members', JSON.stringify(INITIAL_MEMBERS));
    if (!localStorage.getItem('beneficiaries')) localStorage.setItem('beneficiaries', JSON.stringify(INITIAL_BENEFICIARIES));
    if (!localStorage.getItem('transactions')) localStorage.setItem('transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    if (!localStorage.getItem('loans')) localStorage.setItem('loans', JSON.stringify(INITIAL_LOANS));
    if (!localStorage.getItem('sms_templates')) localStorage.setItem('sms_templates', JSON.stringify(INITIAL_SMS_TEMPLATES));
    if (!localStorage.getItem('sms_logs')) localStorage.setItem('sms_logs', JSON.stringify(INITIAL_SMS_LOGS));
    if (!localStorage.getItem('audit_logs')) localStorage.setItem('audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
    if (!localStorage.getItem('chart_of_accounts')) localStorage.setItem('chart_of_accounts', JSON.stringify(INITIAL_COA));
    if (!localStorage.getItem('journal_entries')) localStorage.setItem('journal_entries', JSON.stringify(INITIAL_JOURNAL_ENTRIES));
    if (!localStorage.getItem('sms_wallet')) localStorage.setItem('sms_wallet', '4250');
    if (!localStorage.getItem('sms_settings')) {
      localStorage.setItem('sms_settings', JSON.stringify({
        selected_provider: 'Mock',
        hubtel_client_id: '',
        hubtel_client_secret: '',
        hubtel_sender_id: 'M-SEED',
        arkesel_api_key: '',
        arkesel_sender_id: 'MSEED'
      }));
    }
    if (!localStorage.getItem('momo_transactions')) localStorage.setItem('momo_transactions', JSON.stringify(INITIAL_MOMO_TRANSACTIONS));
  },

  // GETTERS
  getMembers: (): Member[] => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('members') || '[]');
  },

  getBeneficiaries: (memberId?: string): Beneficiary[] => {
    mockDb.initialize();
    const all = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
    if (memberId) {
      return all.filter((b: Beneficiary) => b.member_id === memberId);
    }
    return all;
  },

  getTransactions: (memberId?: string): Transaction[] => {
    mockDb.initialize();
    const all = JSON.parse(localStorage.getItem('transactions') || '[]');
    if (memberId) {
      return all.filter((t: Transaction) => t.member_id === memberId);
    }
    return all;
  },

  getLoans: (memberId?: string): Loan[] => {
    mockDb.initialize();
    const all = JSON.parse(localStorage.getItem('loans') || '[]');
    if (memberId) {
      return all.filter((l: Loan) => l.member_id === memberId);
    }
    return all;
  },

  getSMSTemplates: (): SMSTemplate[] => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('sms_templates') || '[]');
  },

  getSMSLogs: (): SMSLog[] => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('sms_logs') || '[]');
  },

  getAuditLogs: (): AuditLog[] => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('audit_logs') || '[]');
  },

  getCOA: (): AccountCOA[] => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('chart_of_accounts') || '[]');
  },

  getJournalEntries: (): JournalEntry[] => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('journal_entries') || '[]');
  },

  getSMSWallet: (): number => {
    mockDb.initialize();
    return parseInt(localStorage.getItem('sms_wallet') || '0', 10);
  },

  getSMSSettings: () => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('sms_settings') || '{}');
  },

  getMoMoTransactions: (): MobileMoneyTransaction[] => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('momo_transactions') || '[]');
  },

  // MUTATIONS

  // Log audit activity helper
  logAudit: (userRole: string, userName: string, action: string, details: string) => {
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const newLog: AuditLog = {
      id: 'a' + generateId(),
      user_role: userRole,
      user_name: userName,
      action,
      details,
      timestamp: getNowString()
    };
    logs.unshift(newLog);
    localStorage.setItem('audit_logs', JSON.stringify(logs.slice(0, 100))); // keep last 100
  },

  saveMember: (memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>, beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[], operator: { role: string; name: string }) => {
    const members = mockDb.getMembers();
    const count = members.length;
    const accountNumber = generateAccountNumber(count + 1);
    const memberId = 'm' + generateId();
    
    const newMember: Member = {
      ...memberData,
      id: memberId,
      account_number: accountNumber,
      created_at: getNowString()
    };
    
    // Save member
    members.push(newMember);
    localStorage.setItem('members', JSON.stringify(members));

    // Save beneficiaries
    const beneficiaries = mockDb.getBeneficiaries();
    const newBeneficiaries = beneficiariesData.map((b, idx) => ({
      ...b,
      id: 'b' + generateId() + idx,
      member_id: memberId
    }));
    beneficiaries.push(...newBeneficiaries);
    localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));

    // Update Chart of Accounts: Create a ledger profile implicitly or update Member Savings/Shares.
    // For a new member, they usually pay registration fee of, say, GHS 50. Let's make that optional or just audit register.
    mockDb.logAudit(operator.role, operator.name, 'Register Member', `Registered ${newMember.full_name} (${accountNumber}) with ${newBeneficiaries.length} beneficiaries.`);

    return newMember;
  },

  postTransaction: (txData: { member_id: string; type: 'deposit' | 'withdrawal' | 'share_purchase'; amount: number; description: string }, operator: { role: string; name: string }) => {
    const members = mockDb.getMembers();
    const member = members.find(m => m.id === txData.member_id);
    if (!member) throw new Error('Member not found');

    // For withdrawals, check if sufficient savings balance exists
    if (txData.type === 'withdrawal') {
      const balance = mockDb.getMemberSavingsBalance(txData.member_id);
      if (balance < txData.amount) {
        throw new Error(`Insufficient savings balance. Available: GHS ${balance}`);
      }
    }

    const txId = 't' + generateId();
    const newTx: Transaction = {
      id: txId,
      member_id: txData.member_id,
      account_number: member.account_number,
      type: txData.type,
      amount: txData.amount,
      date: getNowString(),
      description: txData.description,
      posted_by: operator.name
    };

    // Save transaction
    const transactions = mockDb.getTransactions();
    transactions.unshift(newTx);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // double-entry accounting posting
    const debits: { account_no: number; amount: number }[] = [];
    const credits: { account_no: number; amount: number }[] = [];

    if (txData.type === 'deposit') {
      // Savings Deposit: Debit Cash, Credit Savings Deposits
      debits.push({ account_no: 1000, amount: txData.amount });
      credits.push({ account_no: 2200, amount: txData.amount });

      // Update balances in COA
      mockDb.updateCOABalance(1000, txData.amount);
      mockDb.updateCOABalance(2200, txData.amount);
    } else if (txData.type === 'withdrawal') {
      // Savings Withdrawal: Debit Savings Deposits, Credit Cash
      debits.push({ account_no: 2200, amount: txData.amount });
      credits.push({ account_no: 1000, amount: txData.amount });

      mockDb.updateCOABalance(2200, -txData.amount);
      mockDb.updateCOABalance(1000, -txData.amount);
    } else if (txData.type === 'share_purchase') {
      // Share Purchase: Debit Cash, Credit Member Shares
      debits.push({ account_no: 1000, amount: txData.amount });
      credits.push({ account_no: 2300, amount: txData.amount });

      mockDb.updateCOABalance(1000, txData.amount);
      mockDb.updateCOABalance(2300, txData.amount);
    }

    // Save journal entry
    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `${txData.type.toUpperCase()} for ${member.full_name} (${member.account_number}) - ${txData.description}`,
      debits,
      credits
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    // Audit Log
    mockDb.logAudit(operator.role, operator.name, `Post ${txData.type.replace('_', ' ')}`, `${txData.type.toUpperCase()} of GHS ${txData.amount} for member ${member.full_name} (${member.account_number}).`);

    // Trigger SMS Notification
    mockDb.triggerSMS(member, txData.type, txData.amount, txData.type === 'share_purchase' ? mockDb.getMemberSharesBalance(member.id) : mockDb.getMemberSavingsBalance(member.id));

    return newTx;
  },

  applyForLoan: (loanData: Omit<Loan, 'id' | 'status' | 'monthly_installment' | 'outstanding_balance' | 'created_at'>, operator: { role: string; name: string }) => {
    const loanId = 'l' + generateId();
    // Monthly installment calculation: principal * (1 + (interest / 100)) / months
    const totalRepayable = loanData.principal * (1 + (loanData.interest_rate / 100));
    const monthlyInstallment = Number((totalRepayable / loanData.term_months).toFixed(2));

    const newLoan: Loan = {
      ...loanData,
      id: loanId,
      status: 'pending',
      monthly_installment: monthlyInstallment,
      outstanding_balance: loanData.principal,
      created_at: getNowString()
    };

    const loans = mockDb.getLoans();
    loans.unshift(newLoan);
    localStorage.setItem('loans', JSON.stringify(loans));

    mockDb.logAudit(operator.role, operator.name, 'Loan Application', `Applied for GHS ${loanData.principal} loan for member ${loanData.member_name} guaranteed by ${loanData.guarantor_name}.`);

    return newLoan;
  },

  updateLoanStatus: (loanId: string, status: 'approved' | 'rejected' | 'disbursed', operator: { role: string; name: string }) => {
    const loans = mockDb.getLoans();
    const loanIndex = loans.findIndex(l => l.id === loanId);
    if (loanIndex === -1) throw new Error('Loan not found');

    const loan = loans[loanIndex];
    const prevStatus = loan.status;
    loan.status = status;

    if (status === 'disbursed') {
      // Disburse Loan: Debit Loan Portfolio, Credit Cash (disbursed out of cash)
      const debits = [{ account_no: 1600, amount: loan.principal }];
      const credits = [{ account_no: 1000, amount: loan.principal }];

      mockDb.updateCOABalance(1600, loan.principal);
      mockDb.updateCOABalance(1000, -loan.principal);

      const entries = mockDb.getJournalEntries();
      const newJe: JournalEntry = {
        id: 'je' + generateId(),
        date: getNowString(),
        description: `Loan Disbursement to ${loan.member_name} (Loan Ref: ${loan.id})`,
        debits,
        credits
      };
      entries.unshift(newJe);
      localStorage.setItem('journal_entries', JSON.stringify(entries));

      // Post in transactions table as loan_disbursement
      const newTx: Transaction = {
        id: 't' + generateId(),
        member_id: loan.member_id,
        account_number: mockDb.getMembers().find(m => m.id === loan.member_id)?.account_number || 'N/A',
        type: 'loan_disbursement',
        amount: loan.principal,
        date: getNowString(),
        description: `Disbursed loan ${loan.id}`,
        posted_by: operator.name
      };
      const transactions = mockDb.getTransactions();
      transactions.unshift(newTx);
      localStorage.setItem('transactions', JSON.stringify(transactions));

      // Trigger SMS
      const member = mockDb.getMembers().find(m => m.id === loan.member_id);
      if (member) {
        mockDb.triggerSMS(member, 'loan_disbursement', loan.principal, loan.principal, loan.monthly_installment, loan.term_months);
      }
    }

    localStorage.setItem('loans', JSON.stringify(loans));
    mockDb.logAudit(operator.role, operator.name, `Update Loan Status`, `Loan ${loanId} for ${loan.member_name} updated from ${prevStatus} to ${status}.`);

    return loan;
  },

  repayLoan: (loanId: string, amount: number, operator: { role: string; name: string }) => {
    const loans = mockDb.getLoans();
    const loanIndex = loans.findIndex(l => l.id === loanId);
    if (loanIndex === -1) throw new Error('Loan not found');

    const loan = loans[loanIndex];
    if (loan.status !== 'disbursed' && loan.status !== 'active') {
      throw new Error(`Cannot repay a loan that is in ${loan.status} status.`);
    }

    // Split repayment: 90% goes to Principal repayment, 10% to Interest Income
    const principalPaid = Number((amount * 0.9).toFixed(2));
    const interestPaid = Number((amount * 0.1).toFixed(2));

    loan.outstanding_balance = Math.max(0, Number((loan.outstanding_balance - principalPaid).toFixed(2)));
    if (loan.outstanding_balance === 0) {
      loan.status = 'repaid';
    }

    // Create Transaction Log
    const member = mockDb.getMembers().find(m => m.id === loan.member_id);
    const txId = 't' + generateId();
    const newTx: Transaction = {
      id: txId,
      member_id: loan.member_id,
      account_number: member?.account_number || 'N/A',
      type: 'loan_repayment',
      amount: amount,
      date: getNowString(),
      description: `Loan payment of GHS ${amount} (Principal GHS ${principalPaid}, Interest GHS ${interestPaid})`,
      posted_by: operator.name
    };

    const transactions = mockDb.getTransactions();
    transactions.unshift(newTx);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Double-entry posting: Debit Cash, Credit Loan Portfolio (Principal), Credit Interest Income (Interest)
    const debits = [{ account_no: 1000, amount: amount }];
    const credits = [
      { account_no: 1600, amount: principalPaid },
      { account_no: 4000, amount: interestPaid }
    ];

    mockDb.updateCOABalance(1000, amount);
    mockDb.updateCOABalance(1600, -principalPaid);
    mockDb.updateCOABalance(4000, interestPaid);

    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `Loan Repayment from ${loan.member_name} (Loan Ref: ${loan.id})`,
      debits,
      credits
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    localStorage.setItem('loans', JSON.stringify(loans));
    mockDb.logAudit(operator.role, operator.name, 'Loan Repayment', `Loan payment of GHS ${amount} posted for member ${loan.member_name}.`);

    // Trigger SMS
    if (member) {
      mockDb.triggerSMS(member, 'loan_repayment', amount, loan.outstanding_balance);
    }

    return loan;
  },

  distributeDividends: (dividendPercentage: number, operator: { role: string; name: string }) => {
    // Distribute dividend based on member shares. E.g. member with GHS 1000 shares gets 1000 * (pct/100) savings deposit.
    const members = mockDb.getMembers();
    const transactions = mockDb.getTransactions();
    const entries = mockDb.getJournalEntries();
    let totalDividends = 0;

    const updatedTransactions: Transaction[] = [...transactions];

    members.forEach(member => {
      const shareBalance = mockDb.getMemberSharesBalance(member.id);
      if (shareBalance > 0) {
        const divAmount = Number((shareBalance * (dividendPercentage / 100)).toFixed(2));
        totalDividends += divAmount;

        // Post savings deposit transaction
        const txId = 't' + generateId();
        const divTx: Transaction = {
          id: txId,
          member_id: member.id,
          account_number: member.account_number,
          type: 'dividend',
          amount: divAmount,
          date: getNowString(),
          description: `${dividendPercentage}% Share Dividend Payout`,
          posted_by: operator.name
        };
        updatedTransactions.unshift(divTx);

        // Send SMS
        mockDb.triggerSMS(member, 'dividend', divAmount, mockDb.getMemberSavingsBalance(member.id) + divAmount);
      }
    });

    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    // Double Entry Journal: Debit Retained Earnings (3100), Credit Member Savings Deposits (2200)
    const debits = [{ account_no: 3100, amount: totalDividends }];
    const credits = [{ account_no: 2200, amount: totalDividends }];

    mockDb.updateCOABalance(3100, -totalDividends);
    mockDb.updateCOABalance(2200, totalDividends);

    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `Distributed ${dividendPercentage}% Share Capital Dividend to members. Total payout: GHS ${totalDividends.toFixed(2)}`,
      debits,
      credits
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    mockDb.logAudit(operator.role, operator.name, 'Distribute Dividends', `Distributed ${dividendPercentage}% dividend. Total: GHS ${totalDividends.toFixed(2)}`);

    return totalDividends;
  },

  postJournalVoucher: (entryData: Omit<JournalEntry, 'id' | 'date'>, operator: { role: string; name: string }) => {
    // Custom double-entry journal entry check debits = credits
    const totalDebits = entryData.debits.reduce((sum, d) => sum + d.amount, 0);
    const totalCredits = entryData.credits.reduce((sum, c) => sum + c.amount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error(`Ledger entry is out of balance. Debits (GHS ${totalDebits}) must equal Credits (GHS ${totalCredits}).`);
    }

    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      ...entryData,
      id: 'je' + generateId(),
      date: getNowString()
    };

    // Update balances
    entryData.debits.forEach(d => {
      mockDb.updateCOABalance(d.account_no, d.amount);
    });
    entryData.credits.forEach(c => {
      mockDb.updateCOABalance(c.account_no, -c.amount);
    });

    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    mockDb.logAudit(operator.role, operator.name, 'Post Journal Entry', `Manual journal voucher posted: ${entryData.description}. Total GHS ${totalDebits}.`);

    return newJe;
  },

  createMoMoTransaction: (txData: Omit<MobileMoneyTransaction, 'id' | 'status' | 'timestamp' | 'reference'>) => {
    const list = mockDb.getMoMoTransactions();
    const reference = 'MOMO-' + (txData.type === 'collection' ? 'HT' : 'AK') + '-' + Math.floor(10000 + Math.random() * 90000);
    const newTx: MobileMoneyTransaction = {
      ...txData,
      id: 'mo' + generateId(),
      status: 'pending',
      timestamp: getNowString(),
      reference
    };
    list.unshift(newTx);
    localStorage.setItem('momo_transactions', JSON.stringify(list));
    return newTx;
  },

  processMoMoTransaction: (id: string, success: boolean, operator: { role: string; name: string }) => {
    const list = mockDb.getMoMoTransactions();
    const txIdx = list.findIndex(t => t.id === id);
    if (txIdx === -1) return null;

    const tx = list[txIdx];
    tx.status = success ? 'success' : 'failed';
    localStorage.setItem('momo_transactions', JSON.stringify(list));

    if (success) {
      // If collection, it is a savings deposit!
      if (tx.type === 'collection') {
        mockDb.postTransaction({
          member_id: tx.member_id,
          type: 'deposit',
          amount: tx.amount,
          description: `Mobile Money Deposit (Ref: ${tx.reference})`
        }, operator);
      } else {
        // payout is savings withdrawal!
        mockDb.postTransaction({
          member_id: tx.member_id,
          type: 'withdrawal',
          amount: tx.amount,
          description: `Mobile Money Payout Withdrawal (Ref: ${tx.reference})`
        }, operator);
      }
    }

    mockDb.logAudit(operator.role, operator.name, 'MoMo Processing', `Processed Mobile Money ${tx.type} reference ${tx.reference} as ${tx.status.toUpperCase()}.`);
    return tx;
  },

  saveSMSTemplate: (type: string, content: string, operator: { role: string; name: string }) => {
    const templates = mockDb.getSMSTemplates();
    const idx = templates.findIndex(t => t.type === type);
    if (idx !== -1) {
      templates[idx].content = content;
      localStorage.setItem('sms_templates', JSON.stringify(templates));
      mockDb.logAudit(operator.role, operator.name, 'Update SMS Template', `Updated custom template for ${type}.`);
    }
  },

  saveSMSSettings: (settings: any, operator: { role: string; name: string }) => {
    localStorage.setItem('sms_settings', JSON.stringify(settings));
    mockDb.logAudit(operator.role, operator.name, 'Update SMS Settings', `Switched gateway provider or keys modified.`);
  },

  topUpSMSWallet: (amount: number, operator: { role: string; name: string }) => {
    const cur = mockDb.getSMSWallet();
    const creditsAdded = amount * 10; // e.g. GHS 1 buys 10 SMS credits
    const newVal = cur + creditsAdded;
    localStorage.setItem('sms_wallet', newVal.toString());

    // accounting entry: debit Cash at Bank, credit Cash in hand, debit SMS Gateway expense? Or just log
    mockDb.updateCOABalance(1000, -amount);
    mockDb.updateCOABalance(5300, amount); // SMS expenses

    const debits = [{ account_no: 5300, amount }];
    const credits = [{ account_no: 1000, amount }];

    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `SMS gateway credit wallet purchase - GHS ${amount}`,
      debits,
      credits
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    mockDb.logAudit(operator.role, operator.name, 'SMS Wallet Topup', `Purchased ${creditsAdded} SMS credits with GHS ${amount}.`);
    return newVal;
  },

  // HELPERS FOR DYNAMIC CALCS

  getMemberSavingsBalance: (memberId: string): number => {
    const txs = mockDb.getTransactions(memberId);
    return txs.reduce((bal, tx) => {
      if (tx.type === 'deposit' || tx.type === 'dividend') return bal + tx.amount;
      if (tx.type === 'withdrawal') return bal - tx.amount;
      return bal;
    }, 0);
  },

  getMemberSharesBalance: (memberId: string): number => {
    const txs = mockDb.getTransactions(memberId);
    return txs.reduce((bal, tx) => {
      if (tx.type === 'share_purchase') return bal + tx.amount;
      return bal;
    }, 0);
  },

  getMemberLoansBalance: (memberId: string): number => {
    const loans = mockDb.getLoans(memberId);
    return loans.reduce((bal, l) => {
      if (l.status === 'disbursed' || l.status === 'active') return bal + l.outstanding_balance;
      return bal;
    }, 0);
  },

  updateCOABalance: (accountNo: number, amount: number) => {
    const coa = mockDb.getCOA();
    const idx = coa.findIndex(a => a.account_no === accountNo);
    if (idx !== -1) {
      coa[idx].balance = Number((coa[idx].balance + amount).toFixed(2));
      localStorage.setItem('chart_of_accounts', JSON.stringify(coa));
    }
  },

  // TRIGGER AUTOMATIC SMS SMS LOGGING WITH PLACEHOLDERS
  triggerSMS: (member: Member, type: string, amount: number, balance: number, installment?: number, term?: number) => {
    const templates = mockDb.getSMSTemplates();
    const template = templates.find(t => t.type === type);
    if (!template) return;

    let msg = template.content;
    msg = msg.replace('{{MemberName}}', member.full_name);
    msg = msg.replace('{{Amount}}', amount.toFixed(2));
    msg = msg.replace('{{Balance}}', balance.toFixed(2));
    msg = msg.replace('{{AccountNumber}}', member.account_number);
    if (installment) msg = msg.replace('{{Installment}}', installment.toFixed(2));
    if (term) msg = msg.replace('{{Term}}', term.toString());
    msg = msg.replace('{{LoanBalance}}', amount.toFixed(2));
    msg = msg.replace('{{DueDate}}', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()); // 30 days out

    // Check if SMS credits are available
    const wallet = mockDb.getSMSWallet();
    const settings = mockDb.getSMSSettings();
    const hasCredits = wallet > 0;
    
    const newLog: SMSLog = {
      id: 'sms' + generateId(),
      member_id: member.id,
      recipient: member.phone_number,
      message: msg,
      status: hasCredits ? 'delivered' : 'failed',
      timestamp: getNowString(),
      api_used: settings.selected_provider
    };

    // Deduct 1 credit from SMS wallet
    if (hasCredits) {
      localStorage.setItem('sms_wallet', (wallet - 1).toString());
    }

    const logs = mockDb.getSMSLogs();
    logs.unshift(newLog);
    localStorage.setItem('sms_logs', JSON.stringify(logs));
  },

  // RESET DATABASE CONTROL
  resetDatabase: () => {
    localStorage.removeItem('members');
    localStorage.removeItem('beneficiaries');
    localStorage.removeItem('transactions');
    localStorage.removeItem('loans');
    localStorage.removeItem('sms_templates');
    localStorage.removeItem('sms_logs');
    localStorage.removeItem('audit_logs');
    localStorage.removeItem('chart_of_accounts');
    localStorage.removeItem('journal_entries');
    localStorage.removeItem('sms_wallet');
    localStorage.removeItem('sms_settings');
    localStorage.removeItem('momo_transactions');
    mockDb.initialize();
  }
};
