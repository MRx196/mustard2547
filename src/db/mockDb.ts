import type { Member, Beneficiary, Transaction, Loan, SMSLog, SMSTemplate, AuditLog, AccountCOA, JournalEntry, MobileMoneyTransaction, Congregation, Guarantor } from './supabase';

// Generate UUID/IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to format date
const getNowString = () => new Date().toISOString();

// Formats number to SDMS 0001
export const generateAccountNumber = (index: number): string => {
  return `SDMS ${String(index).padStart(4, '0')}`;
};

// Initial Congregations
const INITIAL_CONGREGATIONS: Congregation[] = [
  { id: 'c1', name: 'Sege Central Methodist', created_at: '2026-01-01T00:00:00Z' },
  { id: 'c2', name: 'Sege Presbyterian Church', created_at: '2026-01-01T00:00:00Z' },
  { id: 'c3', name: 'Mustard Seed Assembly of God', created_at: '2026-01-01T00:00:00Z' },
  { id: 'c4', name: 'Catholic Church Sege', created_at: '2026-01-01T00:00:00Z' }
];

// Initial Chart of Accounts structure - strictly matching the requested structure
const INITIAL_COA: AccountCOA[] = [
  { account_no: 1000, account_name: 'Cash', category: 'Assets', balance: 55000 },
  { account_no: 1100, account_name: 'Accounts Receivable', category: 'Assets', balance: 1500 },
  { account_no: 1200, account_name: 'Inventory', category: 'Assets', balance: 5000 },
  { account_no: 1500, account_name: 'Equipment', category: 'Assets', balance: 12000 },
  { account_no: 2000, account_name: 'Accounts Payable', category: 'Liabilities', balance: 800 },
  { account_no: 2100, account_name: 'Loans Payable', category: 'Liabilities', balance: 10000 },
  { account_no: 3000, account_name: "Owner's Capital", category: 'Equity', balance: 50000 },
  { account_no: 3100, account_name: 'Retained Earnings', category: 'Equity', balance: 12700 },
  { account_no: 4000, account_name: 'Sales Revenue', category: 'Revenue', balance: 4200 },
  { account_no: 4100, account_name: 'Service Revenue', category: 'Revenue', balance: 1200 },
  { account_no: 5000, account_name: 'Cost of Goods Sold', category: 'Expenses', balance: 2800 },
  { account_no: 5100, account_name: 'Salaries Expense', category: 'Expenses', balance: 1200 },
  { account_no: 5200, account_name: 'Rent Expense', category: 'Expenses', balance: 350 },
  { account_no: 5300, account_name: 'Utilities Expense', category: 'Expenses', balance: 150 },
  { account_no: 5400, account_name: 'Marketing Expense', category: 'Expenses', balance: 500 }
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
  { id: 'b1', member_id: 'm1', full_name: 'Mary Aku Tetteh', age: 38, percentage: 40, house_number: 'SG-024-1928', marital_status: 'Married', relationship: 'Spouse', phone_number: '+233245667788' },
  { id: 'b2', member_id: 'm1', full_name: 'Isaac Tetteh', age: 15, percentage: 15, house_number: 'SG-024-1928', marital_status: 'Single', relationship: 'Son', phone_number: '+233245667789' },
  { id: 'b3', member_id: 'm1', full_name: 'Grace Tetteh', age: 12, percentage: 15, house_number: 'SG-024-1928', marital_status: 'Single', relationship: 'Daughter', phone_number: 'N/A' },
  { id: 'b4', member_id: 'm1', full_name: 'Daniel Tetteh', age: 8, percentage: 15, house_number: 'SG-024-1928', marital_status: 'Single', relationship: 'Son', phone_number: 'N/A' },
  { id: 'b5', member_id: 'm1', full_name: 'Comfort Tetteh', age: 26, percentage: 15, house_number: 'SG-012-9900', marital_status: 'Single', relationship: 'Sister', phone_number: '+233240099887' },
  { id: 'b6', member_id: 'm2', full_name: 'Samuel Shormey', age: 42, percentage: 60, house_number: 'SG-008-5421', marital_status: 'Married', relationship: 'Spouse', phone_number: '+233209887766' },
  { id: 'b7', member_id: 'm2', full_name: 'Patience Shormey', age: 18, percentage: 40, house_number: 'SG-008-5421', marital_status: 'Single', relationship: 'Daughter', phone_number: '+233501122334' },
  { id: 'b8', member_id: 'm3', full_name: 'Sarah Doku', age: 45, percentage: 50, house_number: 'SG-099-0012', marital_status: 'Married', relationship: 'Spouse', phone_number: '+233271122334' },
  { id: 'b9', member_id: 'm3', full_name: 'Lois Doku', age: 20, percentage: 25, house_number: 'SG-099-0012', marital_status: 'Single', relationship: 'Daughter', phone_number: '+233271122335' },
  { id: 'b10', member_id: 'm3', full_name: 'Eunice Doku', age: 17, percentage: 25, house_number: 'SG-099-0012', marital_status: 'Single', relationship: 'Daughter', phone_number: 'N/A' }
];

// Initial Transactions list (mapping balances locally)
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', member_id: 'm1', account_number: 'SDMS 0001', type: 'deposit', amount: 5000, date: '2026-01-10T11:00:00Z', description: 'Savings Deposit', posted_by: 'Super Admin' },
  { id: 't2', member_id: 'm1', account_number: 'SDMS 0001', type: 'share_purchase', amount: 1500, date: '2026-01-10T11:15:00Z', description: 'Shares Purchase', posted_by: 'Super Admin' },
  { id: 't3', member_id: 'm2', account_number: 'SDMS 0002', type: 'deposit', amount: 3500, date: '2026-02-15T15:00:00Z', description: 'Savings Deposit', posted_by: 'Accountant' },
  { id: 't4', member_id: 'm2', account_number: 'SDMS 0002', type: 'share_purchase', amount: 2000, date: '2026-02-15T15:10:00Z', description: 'Shares Purchase', posted_by: 'Accountant' },
  { id: 't5', member_id: 'm3', account_number: 'SDMS 0003', type: 'deposit', amount: 8000, date: '2026-03-01T10:00:00Z', description: 'Savings Deposit', posted_by: 'Super Admin' },
  { id: 't6', member_id: 'm3', account_number: 'SDMS 0003', type: 'share_purchase', amount: 3000, date: '2026-03-01T10:15:00Z', description: 'Shares Purchase', posted_by: 'Super Admin' },
  { id: 't7', member_id: 'm1', account_number: 'SDMS 0001', type: 'deposit', amount: 1000, date: '2026-03-10T12:00:00Z', description: 'Contribution Deposit', posted_by: 'Collection Officer' },
  { id: 't8', member_id: 'm2', account_number: 'SDMS 0002', type: 'deposit', amount: 800, date: '2026-03-15T16:00:00Z', description: 'Savings Deposit', posted_by: 'Collection Officer' }
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
    status: 'repaid',
    collateral: 'Shop Inventory',
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
    status: 'approved',
    collateral: 'Church Sound System Equipment',
    monthly_installment: 1437.5,
    outstanding_balance: 15000,
    created_at: '2026-07-01T15:00:00Z'
  }
];

// Initial Guarantors linked to loans
const INITIAL_GUARANTORS: Guarantor[] = [
  {
    id: 'g1',
    loan_id: 'l1',
    member_id: 'm2',
    full_name: 'Elizabeth Naa Shormey',
    phone_number: '+233207654321',
    relationship: 'Business Partner',
    amount: 5000,
    created_at: '2026-02-01T09:00:00Z'
  },
  {
    id: 'g2',
    loan_id: 'l2',
    member_id: 'm3',
    full_name: 'Pastor Abraham Doku',
    phone_number: '+233277334455',
    relationship: 'Pastor',
    amount: 2500,
    created_at: '2026-02-20T11:00:00Z'
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
  { id: 'sms2', member_id: 'm1', recipient: '+233244123456', message: 'Dear John Kwesi Tetteh, Loan repayment of GHS 1866.67 received. Your outstanding loan balance is GHS 8133.33. Ref: SDMS 0001.', status: 'delivered', timestamp: '2026-03-01T10:05:00Z', api_used: 'Hubtel' }
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'a1', user_role: 'Super Admin', user_name: 'Eric Kwetey (Admin)', action: 'System Initialized', details: 'Database initialized with standard Chart of Accounts & Seed Members.', timestamp: '2026-07-14T05:00:00Z' }
];

// Initial Journal Entries representing standard transaction entries
const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je1',
    date: '2026-01-10T11:00:00Z',
    description: 'Post initial savings deposit for John Kwesi Tetteh',
    debits: [{ account_no: 1000, amount: 5000 }],
    credits: [{ account_no: 3100, amount: 5000 }] // Retained savings equity
  },
  {
    id: 'je2',
    date: '2026-01-10T11:15:00Z',
    description: 'Post shares purchase for John Kwesi Tetteh',
    debits: [{ account_no: 1000, amount: 1500 }],
    credits: [{ account_no: 3000, amount: 1500 }]
  }
];

const INITIAL_MOMO_TRANSACTIONS: MobileMoneyTransaction[] = [
  { id: 'mo1', member_id: 'm1', member_name: 'John Kwesi Tetteh', phone_number: '+233244123456', amount: 500, type: 'collection', network: 'MTN', purpose: 'Savings Deposit', status: 'success', timestamp: '2026-07-10T09:12:00Z', reference: 'MOMO-HT-99812' },
  { id: 'mo2', member_id: 'm2', member_name: 'Elizabeth Naa Shormey', phone_number: '+233207654321', amount: 1500, type: 'payout', network: 'Telecel', purpose: 'Payment to Member', status: 'success', timestamp: '2026-07-12T14:23:00Z', reference: 'MOMO-AK-88712' }
];

export const mockDb = {
  initialize: () => {
    if (!localStorage.getItem('congregations')) localStorage.setItem('congregations', JSON.stringify(INITIAL_CONGREGATIONS));
    if (!localStorage.getItem('members')) localStorage.setItem('members', JSON.stringify(INITIAL_MEMBERS));
    if (!localStorage.getItem('beneficiaries')) localStorage.setItem('beneficiaries', JSON.stringify(INITIAL_BENEFICIARIES));
    if (!localStorage.getItem('transactions')) localStorage.setItem('transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    if (!localStorage.getItem('loans')) localStorage.setItem('loans', JSON.stringify(INITIAL_LOANS));
    if (!localStorage.getItem('guarantors')) localStorage.setItem('guarantors', JSON.stringify(INITIAL_GUARANTORS));
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
  getCongregations: (): Congregation[] => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('congregations') || '[]');
  },

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

  getGuarantors: (loanId?: string): Guarantor[] => {
    mockDb.initialize();
    const all = JSON.parse(localStorage.getItem('guarantors') || '[]');
    if (loanId) {
      return all.filter((g: Guarantor) => g.loan_id === loanId);
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

  // Congregations CRUD
  saveCongregation: (name: string, id?: string, operator?: { role: string; name: string }) => {
    const list = mockDb.getCongregations();
    if (id) {
      // Edit
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        const oldName = list[idx].name;
        list[idx].name = name;
        localStorage.setItem('congregations', JSON.stringify(list));
        if (operator) {
          mockDb.logAudit(operator.role, operator.name, 'Edit Congregation', `Updated congregation from "${oldName}" to "${name}"`);
        }
      }
    } else {
      // Add
      const newC: Congregation = {
        id: 'c' + generateId(),
        name,
        created_at: getNowString()
      };
      list.push(newC);
      localStorage.setItem('congregations', JSON.stringify(list));
      if (operator) {
        mockDb.logAudit(operator.role, operator.name, 'Add Congregation', `Added congregation "${name}"`);
      }
    }
  },

  deleteCongregation: (id: string, operator?: { role: string; name: string }) => {
    const list = mockDb.getCongregations();
    const c = list.find(x => x.id === id);
    if (!c) return;

    const filtered = list.filter(x => x.id !== id);
    localStorage.setItem('congregations', JSON.stringify(filtered));
    if (operator) {
      mockDb.logAudit(operator.role, operator.name, 'Delete Congregation', `Deleted congregation "${c.name}"`);
    }
  },

  // Members CRUD (Supports saving + editing)
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

    mockDb.logAudit(operator.role, operator.name, 'Register Member', `Registered ${newMember.full_name} (${accountNumber}) with ${newBeneficiaries.length} beneficiaries.`);

    return newMember;
  },

  editMember: (id: string, memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>, beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[], operator: { role: string; name: string }) => {
    const members = mockDb.getMembers();
    const idx = members.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Member profile not found');

    const old = members[idx];
    members[idx] = {
      ...old,
      ...memberData
    };
    localStorage.setItem('members', JSON.stringify(members));

    // Update beneficiaries: remove old, insert new
    let beneficiaries = mockDb.getBeneficiaries();
    beneficiaries = beneficiaries.filter(b => b.member_id !== id);
    const newBeneficiaries = beneficiariesData.map((b, i) => ({
      ...b,
      id: 'b' + generateId() + i,
      member_id: id
    }));
    beneficiaries.push(...newBeneficiaries);
    localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));

    mockDb.logAudit(operator.role, operator.name, 'Edit Member', `Updated member profile details for ${old.full_name} (${old.account_number}).`);
  },

  // Transaction mutations
  postTransaction: (txData: { member_id: string; type: 'deposit' | 'withdrawal' | 'share_purchase'; amount: number; description: string; reference?: string; notes?: string }, operator: { role: string; name: string }) => {
    const members = mockDb.getMembers();
    const member = members.find(m => m.id === txData.member_id);
    if (!member) throw new Error('Member not found');

    if (txData.type === 'withdrawal') {
      const balance = mockDb.getMemberSavingsBalance(txData.member_id);
      if (balance < txData.amount) {
        throw new Error(`Insufficient balance. Available: GHS ${balance}`);
      }
    }

    const txId = 't' + generateId();
    const description = `${txData.description}${txData.reference ? ' (Ref: ' + txData.reference + ')' : ''}${txData.notes ? ' - ' + txData.notes : ''}`;
    
    const newTx: Transaction = {
      id: txId,
      member_id: txData.member_id,
      account_number: member.account_number,
      type: txData.type,
      amount: txData.amount,
      date: getNowString(),
      description,
      posted_by: operator.name
    };

    // Save transaction
    const transactions = mockDb.getTransactions();
    transactions.unshift(newTx);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Balanced double entry mapping
    // Deposit: Dr Cash (1000), Cr Retained Earnings (3100) or Owner's Capital
    // Withdrawal: Dr Retained Earnings (3100), Cr Cash (1000)
    // Shares: Dr Cash (1000), Cr Owner's Capital (3000)
    const debits: { account_no: number; amount: number }[] = [];
    const credits: { account_no: number; amount: number }[] = [];

    if (txData.type === 'deposit') {
      debits.push({ account_no: 1000, amount: txData.amount });
      credits.push({ account_no: 3100, amount: txData.amount });

      mockDb.updateCOABalance(1000, txData.amount);
      mockDb.updateCOABalance(3100, txData.amount);
    } else if (txData.type === 'withdrawal') {
      debits.push({ account_no: 3100, amount: txData.amount });
      credits.push({ account_no: 1000, amount: txData.amount });

      mockDb.updateCOABalance(3100, -txData.amount);
      mockDb.updateCOABalance(1000, -txData.amount);
    } else if (txData.type === 'share_purchase') {
      debits.push({ account_no: 1000, amount: txData.amount });
      credits.push({ account_no: 3000, amount: txData.amount });

      mockDb.updateCOABalance(1000, txData.amount);
      mockDb.updateCOABalance(3000, txData.amount);
    }

    // Save journal entry
    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `${txData.type.toUpperCase()}: ${member.full_name} (${member.account_number}) - ${description}`,
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

  // Loans Application
  applyForLoan: (loanData: { member_id: string; member_name: string; principal: number; interest_rate: number; term_months: number; purpose: string; collateral: string }, operator: { role: string; name: string }) => {
    const loanId = 'l' + generateId();
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

    mockDb.logAudit(operator.role, operator.name, 'Loan Application', `Applied for GHS ${loanData.principal} loan for member ${loanData.member_name}. Purpose: ${loanData.purpose}`);

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
      // Disburse Loan: Dr Accounts Receivable (1100), Cr Cash (1000)
      const debits = [{ account_no: 1100, amount: loan.principal }];
      const credits = [{ account_no: 1000, amount: loan.principal }];

      mockDb.updateCOABalance(1100, loan.principal);
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

      // Post transaction
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
    const principalPaid = Number((amount * 0.9).toFixed(2));
    const interestPaid = Number((amount * 0.1).toFixed(2));

    loan.outstanding_balance = Math.max(0, Number((loan.outstanding_balance - principalPaid).toFixed(2)));
    if (loan.outstanding_balance === 0) {
      loan.status = 'repaid';
    }

    const member = mockDb.getMembers().find(m => m.id === loan.member_id);
    const newTx: Transaction = {
      id: 't' + generateId(),
      member_id: loan.member_id,
      account_number: member?.account_number || 'N/A',
      type: 'loan_repayment',
      amount: amount,
      date: getNowString(),
      description: `Loan repayment: principal GHS ${principalPaid}, interest GHS ${interestPaid}`,
      posted_by: operator.name
    };

    const transactions = mockDb.getTransactions();
    transactions.unshift(newTx);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Double entry: Dr Cash (1000), Cr Accounts Receivable (1100) (Principal), Cr Sales/Service Revenue (4100) (Interest)
    const debits = [{ account_no: 1000, amount: amount }];
    const credits = [
      { account_no: 1100, amount: principalPaid },
      { account_no: 4100, amount: interestPaid }
    ];

    mockDb.updateCOABalance(1000, amount);
    mockDb.updateCOABalance(1100, -principalPaid);
    mockDb.updateCOABalance(4100, interestPaid);

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

    if (member) {
      mockDb.triggerSMS(member, 'loan_repayment', amount, loan.outstanding_balance);
    }

    return loan;
  },

  // Guarantors mutations
  saveGuarantor: (guarantorData: { loan_id: string; member_id?: string; full_name: string; phone_number: string; relationship: string; amount: number }, operator?: { role: string; name: string }) => {
    const list = mockDb.getGuarantors();
    let fullName = guarantorData.full_name;
    let phone = guarantorData.phone_number;

    if (guarantorData.member_id) {
      const m = mockDb.getMembers().find(x => x.id === guarantorData.member_id);
      if (m) {
        fullName = m.full_name;
        phone = m.phone_number;
      }
    }

    const newG: Guarantor = {
      ...guarantorData,
      id: 'g' + generateId(),
      full_name: fullName,
      phone_number: phone,
      created_at: getNowString()
    };

    list.unshift(newG);
    localStorage.setItem('guarantors', JSON.stringify(list));

    if (operator) {
      mockDb.logAudit(operator.role, operator.name, 'Add Guarantor', `Linked guarantor ${fullName} to Loan ID ${guarantorData.loan_id.substring(0,8).toUpperCase()} for GHS ${guarantorData.amount}`);
    }
    return newG;
  },

  // Dividends distribution
  distributeDividends: (dividendPercentage: number, operator: { role: string; name: string }) => {
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

        const txId = 't' + generateId();
        const divTx: Transaction = {
          id: txId,
          member_id: member.id,
          account_number: member.account_number,
          type: 'dividend',
          amount: divAmount,
          date: getNowString(),
          description: `${dividendPercentage}% Shares Dividend Payout`,
          posted_by: operator.name
        };
        updatedTransactions.unshift(divTx);

        mockDb.triggerSMS(member, 'dividend', divAmount, mockDb.getMemberSavingsBalance(member.id) + divAmount);
      }
    });

    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    // Double Entry: Dr Retained Earnings (3100), Cr Cash (1000) (paid out from cash to member holdings or credited to cash balances)
    // Usually dividend decreases retained earnings, increases savings liabilities. Under our updated COA, we credit savings deposits (represented inside Cash/Capital accounts).
    // Dr Retained Earnings (3100), Cr Cash (1000)
    const debits = [{ account_no: 3100, amount: totalDividends }];
    const credits = [{ account_no: 1000, amount: totalDividends }];

    mockDb.updateCOABalance(3100, -totalDividends);
    mockDb.updateCOABalance(1000, -totalDividends);

    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `Distributed ${dividendPercentage}% Share Dividend. Total: GHS ${totalDividends.toFixed(2)}`,
      debits,
      credits
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    mockDb.logAudit(operator.role, operator.name, 'Distribute Dividends', `Distributed ${dividendPercentage}% dividend. Total: GHS ${totalDividends.toFixed(2)}`);

    return totalDividends;
  },

  // Manual Journal entry
  postJournalVoucher: (entryData: Omit<JournalEntry, 'id' | 'date'>, operator: { role: string; name: string }) => {
    const totalDebits = entryData.debits.reduce((sum, d) => sum + d.amount, 0);
    const totalCredits = entryData.credits.reduce((sum, c) => sum + c.amount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error(`Ledger entry out of balance. Debits (GHS ${totalDebits}) must equal Credits (GHS ${totalCredits}).`);
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

    mockDb.logAudit(operator.role, operator.name, 'Post Journal Entry', `Manual journal entry posted: ${entryData.description}. Total GHS ${totalDebits}.`);

    return newJe;
  },

  // Mobile Money records (Type, Network, select member, amount, phone, purpose, reference)
  createMoMoTransaction: (txData: { type: 'collection' | 'payout'; network: string; member_id?: string; amount: number; phone_number: string; purpose: string; reference: string }, operator: { role: string; name: string }) => {
    const list = mockDb.getMoMoTransactions();
    
    let mName = '';
    if (txData.member_id) {
      const m = mockDb.getMembers().find(x => x.id === txData.member_id);
      if (m) mName = m.full_name;
    }

    const newTx: MobileMoneyTransaction = {
      id: 'mo' + generateId(),
      member_id: txData.member_id,
      member_name: mName || 'Walk-in Customer',
      phone_number: txData.phone_number,
      amount: txData.amount,
      type: txData.type,
      network: txData.network,
      purpose: txData.purpose,
      status: 'success', // For manual record transactions, post as success immediately
      timestamp: getNowString(),
      reference: txData.reference
    };
    
    list.unshift(newTx);
    localStorage.setItem('momo_transactions', JSON.stringify(list));

    // Post Savings Deposit or Repayment as a Transaction if linked to member
    if (txData.member_id) {
      if (txData.purpose === 'Savings Deposit') {
        mockDb.postTransaction({
          member_id: txData.member_id,
          type: 'deposit',
          amount: txData.amount,
          description: `MoMo Deposit (Ref: ${txData.reference})`
        }, operator);
      } else if (txData.purpose === 'Shares Purchase') {
        mockDb.postTransaction({
          member_id: txData.member_id,
          type: 'share_purchase',
          amount: txData.amount,
          description: `MoMo Share Purchase (Ref: ${txData.reference})`
        }, operator);
      } else if (txData.purpose === 'Loan Repayment') {
        // find a active loan for this member and repay it
        const loan = mockDb.getLoans().find(l => l.member_id === txData.member_id && (l.status === 'disbursed' || l.status === 'active'));
        if (loan) {
          mockDb.repayLoan(loan.id, txData.amount, operator);
        } else {
          // If no active loan, credit savings instead
          mockDb.postTransaction({
            member_id: txData.member_id,
            type: 'deposit',
            amount: txData.amount,
            description: `MoMo Repayment overflow to Savings (Ref: ${txData.reference})`
          }, operator);
        }
      } else if (txData.purpose === 'Payment to Member') {
        mockDb.postTransaction({
          member_id: txData.member_id,
          type: 'withdrawal',
          amount: txData.amount,
          description: `MoMo Payout Withdrawal (Ref: ${txData.reference})`
        }, operator);
      }
    }

    mockDb.logAudit(operator.role, operator.name, 'Record MoMo Transaction', `Recorded MoMo ${txData.type} GHS ${txData.amount} via ${txData.network}. Purpose: ${txData.purpose}`);
    return newTx;
  },

  saveSMSTemplate: (type: string, content: string, operator: { role: string; name: string }) => {
    const templates = mockDb.getSMSTemplates();
    const idx = templates.findIndex(t => t.type === type);
    if (idx !== -1) {
      templates[idx].content = content;
      localStorage.setItem('sms_templates', JSON.stringify(templates));
      mockDb.logAudit(operator.role, operator.name, 'Update SMS Template', `Updated template for ${type}.`);
    }
  },

  saveSMSSettings: (settings: any, operator: { role: string; name: string }) => {
    localStorage.setItem('sms_settings', JSON.stringify(settings));
    mockDb.logAudit(operator.role, operator.name, 'Update SMS Settings', `Switched gateway provider settings.`);
  },

  topUpSMSWallet: (amount: number, operator: { role: string; name: string }) => {
    const cur = mockDb.getSMSWallet();
    const creditsAdded = amount * 10;
    const newVal = cur + creditsAdded;
    localStorage.setItem('sms_wallet', newVal.toString());

    // Dr Utilities Expense (5300), Cr Cash (1000)
    mockDb.updateCOABalance(1000, -amount);
    mockDb.updateCOABalance(5300, amount);

    const debits = [{ account_no: 5300, amount }];
    const credits = [{ account_no: 1000, amount }];

    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `SMS gateway credit purchase - GHS ${amount}`,
      debits,
      credits
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    mockDb.logAudit(operator.role, operator.name, 'SMS Wallet Topup', `Purchased ${creditsAdded} SMS credits.`);
    return newVal;
  },

  // HELPERS

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
    msg = msg.replace('{{DueDate}}', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString());

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

    if (hasCredits) {
      localStorage.setItem('sms_wallet', (wallet - 1).toString());
    }

    const logs = mockDb.getSMSLogs();
    logs.unshift(newLog);
    localStorage.setItem('sms_logs', JSON.stringify(logs));
  },

  resetDatabase: () => {
    localStorage.removeItem('congregations');
    localStorage.removeItem('members');
    localStorage.removeItem('beneficiaries');
    localStorage.removeItem('transactions');
    localStorage.removeItem('loans');
    localStorage.removeItem('guarantors');
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
