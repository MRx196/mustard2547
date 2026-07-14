import type { Member, Beneficiary, Transaction, Loan, SMSLog, SMSTemplate, AuditLog, AccountCOA, JournalEntry, MobileMoneyTransaction, Congregation, Guarantor, StaffUser } from './supabase';

const generateId = () => Math.random().toString(36).substring(2, 15);
const getNowString = () => new Date().toISOString();

export const generateAccountNumber = (index: number): string => {
  return `SDMS ${String(index).padStart(4, '0')}`;
};

// Seed Congregations
const INITIAL_CONGREGATIONS: Congregation[] = [
  { id: 'c1', name: 'Sege Central Methodist', created_at: '2026-01-01T00:00:00Z' },
  { id: 'c2', name: 'Sege Presbyterian Church', created_at: '2026-01-01T00:00:00Z' },
  { id: 'c3', name: 'Mustard Seed Assembly of God', created_at: '2026-01-01T00:00:00Z' },
  { id: 'c4', name: 'Catholic Church Sege', created_at: '2026-01-01T00:00:00Z' }
];

// Seed Chart of Accounts
const INITIAL_COA: AccountCOA[] = [
  { account_no: 1000, account_name: 'Cash', category: 'Assets', balance: 75000 },
  { account_no: 1100, account_name: 'Accounts Receivable', category: 'Assets', balance: 1500 },
  { account_no: 1200, account_name: 'Inventory', category: 'Assets', balance: 5000 },
  { account_no: 1500, account_name: 'Equipment', category: 'Assets', balance: 12000 },
  { account_no: 2000, account_name: 'Accounts Payable', category: 'Liabilities', balance: 800 },
  { account_no: 2100, account_name: 'Loans Payable', category: 'Liabilities', balance: 10000 },
  { account_no: 3000, account_name: "Owner's Capital", category: 'Equity', balance: 60000 },
  { account_no: 3100, account_name: 'Retained Earnings', category: 'Equity', balance: 22700 },
  { account_no: 4000, account_name: 'Sales Revenue', category: 'Revenue', balance: 4200 },
  { account_no: 4100, account_name: 'Service Revenue', category: 'Revenue', balance: 1200 },
  { account_no: 5000, account_name: 'Cost of Goods Sold', category: 'Expenses', balance: 2800 },
  { account_no: 5100, account_name: 'Salaries Expense', category: 'Expenses', balance: 1200 },
  { account_no: 5200, account_name: 'Rent Expense', category: 'Expenses', balance: 350 },
  { account_no: 5300, account_name: 'Utilities Expense', category: 'Expenses', balance: 150 },
  { account_no: 5400, account_name: 'Marketing Expense', category: 'Expenses', balance: 500 }
];

// Seed Members
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
  }
];

// Seed Beneficiaries
const INITIAL_BENEFICIARIES: Beneficiary[] = [
  { id: 'b1', member_id: 'm1', full_name: 'Mary Aku Tetteh', age: 38, percentage: 40, house_number: 'SG-024-1928', marital_status: 'Married', relationship: 'Spouse', phone_number: '+233245667788' },
  { id: 'b2', member_id: 'm1', full_name: 'Isaac Tetteh', age: 15, percentage: 15, house_number: 'SG-024-1928', marital_status: 'Single', relationship: 'Son', phone_number: '+233245667789' },
  { id: 'b3', member_id: 'm1', full_name: 'Grace Tetteh', age: 12, percentage: 15, house_number: 'SG-024-1928', marital_status: 'Single', relationship: 'Daughter', phone_number: 'N/A' },
  { id: 'b4', member_id: 'm1', full_name: 'Daniel Tetteh', age: 8, percentage: 15, house_number: 'SG-024-1928', marital_status: 'Single', relationship: 'Son', phone_number: 'N/A' },
  { id: 'b5', member_id: 'm1', full_name: 'Comfort Tetteh', age: 26, percentage: 15, house_number: 'SG-012-9900', marital_status: 'Single', relationship: 'Sister', phone_number: '+233240099887' }
];

// Seed Transactions
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', member_id: 'm1', account_number: 'SDMS 0001', type: 'deposit', amount: 5000, date: '2026-01-10T11:00:00Z', description: 'Savings Deposit', posted_by: 'Eric Kwetey (Admin)' },
  { id: 't2', member_id: 'm1', account_number: 'SDMS 0001', type: 'share_purchase', amount: 1500, date: '2026-01-10T11:15:00Z', description: 'Shares Purchase', posted_by: 'Eric Kwetey (Admin)' },
  { id: 't3', member_id: 'm2', account_number: 'SDMS 0002', type: 'deposit', amount: 3500, date: '2026-02-15T15:00:00Z', description: 'Savings Deposit', posted_by: 'Jane Mensah' },
  { id: 't4', member_id: 'm2', account_number: 'SDMS 0002', type: 'share_purchase', amount: 2000, date: '2026-02-15T15:10:00Z', description: 'Shares Purchase', posted_by: 'Jane Mensah' }
];

// Seed Loans
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
  }
];

// Seed SMS Templates
const INITIAL_SMS_TEMPLATES: SMSTemplate[] = [
  { id: 's1', name: 'Deposit Alert', event: 'Deposit Received', body: 'Dear {full_name}, GHS {amount} deposited to your savings. New Balance: GHS {balance}. Acc: {account_number}. Thank you!', recipient_type: 'Member' },
  { id: 's2', name: 'Withdrawal Alert', event: 'Withdrawal Completed', body: 'Dear {full_name}, GHS {amount} withdrawn from your savings. Remaining: GHS {balance}. Acc: {account_number}.', recipient_type: 'Member' },
  { id: 's3', name: 'Loan Request Notice', event: 'Loan Application Submitted', body: 'Hello {full_name}, your loan request of GHS {loan_amount} is submitted. Ref: {account_number}.', recipient_type: 'Member' },
  { id: 's4', name: 'Loan Approved Notice', event: 'Loan Approved', body: 'Dear {full_name}, your loan application of GHS {loan_amount} has been approved.', recipient_type: 'Member' },
  { id: 's5', name: 'Loan Disbursed Alert', event: 'Loan Disbursed', body: 'Dear {full_name}, GHS {loan_amount} disbursed. Monthly installment is GHS {balance} for {interest} months.', recipient_type: 'Member' },
  { id: 's6', name: 'Repayment Receipt Alert', event: 'Loan Repayment Received', body: 'Dear {full_name}, loan repayment of GHS {amount} received. Balance outstanding: GHS {balance}.', recipient_type: 'Member' },
  { id: 's7', name: 'General Message', event: 'Normal Notification', body: 'Dear {full_name}, this is a general broadcast message from Mustard Seed. Acc: {account_number}.', recipient_type: 'Member' }
];

// Seed Staff Users
const INITIAL_STAFF: StaffUser[] = [
  { email: 'admin@mustardseed.org', full_name: 'Eric Kwetey (Admin)', role: 'Super Administrator', status: 'Active', last_signin: '2026-07-14T07:00:00Z', created_at: '2026-01-01T00:00:00Z' },
  { email: 'accountant@mustardseed.org', full_name: 'Jane Mensah', role: 'Accountant', status: 'Active', last_signin: '2026-07-14T07:15:00Z', created_at: '2026-01-05T00:00:00Z' },
  { email: 'loans@mustardseed.org', full_name: 'Thomas Addo', role: 'Loan Officer', status: 'Active', last_signin: '2026-07-14T06:50:00Z', created_at: '2026-01-10T00:00:00Z' },
  { email: 'momo@mustardseed.org', full_name: 'Mercy Osei', role: 'Collections Officer', status: 'Active', last_signin: '2026-07-14T07:22:00Z', created_at: '2026-01-12T00:00:00Z' }
];

// Seed Audit Logs
const INITIAL_AUDIT: AuditLog[] = [
  { id: 'a1', timestamp: '2026-07-14T05:00:00Z', user_name: 'System', user_email: 'system@mustardseed.org', user_role: 'Super Administrator', action: 'System Setup completed', module: 'System', record_affected: 'Database init', previous_value: 'N/A', new_value: 'Chart of Accounts configured' }
];

export const mockDb = {
  initialize: () => {
    if (!localStorage.getItem('congregations')) localStorage.setItem('congregations', JSON.stringify(INITIAL_CONGREGATIONS));
    if (!localStorage.getItem('members')) localStorage.setItem('members', JSON.stringify(INITIAL_MEMBERS));
    if (!localStorage.getItem('beneficiaries')) localStorage.setItem('beneficiaries', JSON.stringify(INITIAL_BENEFICIARIES));
    if (!localStorage.getItem('transactions')) localStorage.setItem('transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    if (!localStorage.getItem('loans')) localStorage.setItem('loans', JSON.stringify(INITIAL_LOANS));
    if (!localStorage.getItem('guarantors')) localStorage.setItem('guarantors', '[]');
    if (!localStorage.getItem('sms_templates')) localStorage.setItem('sms_templates', JSON.stringify(INITIAL_SMS_TEMPLATES));
    if (!localStorage.getItem('sms_logs')) localStorage.setItem('sms_logs', '[]');
    if (!localStorage.getItem('staff_users')) localStorage.setItem('staff_users', JSON.stringify(INITIAL_STAFF));
    if (!localStorage.getItem('audit_logs')) localStorage.setItem('audit_logs', JSON.stringify(INITIAL_AUDIT));
    if (!localStorage.getItem('chart_of_accounts')) localStorage.setItem('chart_of_accounts', JSON.stringify(INITIAL_COA));
    if (!localStorage.getItem('journal_entries')) localStorage.setItem('journal_entries', '[]');
    if (!localStorage.getItem('sms_wallet')) localStorage.setItem('sms_wallet', '5000');
    if (!localStorage.getItem('sms_settings')) {
      localStorage.setItem('sms_settings', JSON.stringify({
        selected_provider: 'Arkesel',
        sender_id: 'M-SEED',
        api_url: 'https://api.arkesel.com/v1/sms/send',
        api_key: 'ark_mock_key_998231',
        api_secret: ''
      }));
    }
    if (!localStorage.getItem('momo_transactions')) localStorage.setItem('momo_transactions', '[]');
  },

  // Auditing Helper
  logAudit: (
    operator: { name: string; email: string; role: string },
    action: string,
    module: string,
    recordAffected: string,
    previousValue: string,
    newValue: string
  ) => {
    mockDb.initialize();
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const newLog: AuditLog = {
      id: 'a' + generateId(),
      timestamp: getNowString(),
      user_name: operator.name,
      user_email: operator.email,
      user_role: operator.role,
      action,
      module,
      record_affected: recordAffected,
      previous_value: previousValue,
      new_value: newValue
    };
    logs.unshift(newLog);
    localStorage.setItem('audit_logs', JSON.stringify(logs.slice(0, 500)));
  },

  // READERS
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
    if (memberId) return all.filter((b: Beneficiary) => b.member_id === memberId);
    return all;
  },
  getTransactions: (memberId?: string): Transaction[] => {
    mockDb.initialize();
    const all = JSON.parse(localStorage.getItem('transactions') || '[]');
    if (memberId) return all.filter((t: Transaction) => t.member_id === memberId);
    return all;
  },
  getLoans: (memberId?: string): Loan[] => {
    mockDb.initialize();
    const all = JSON.parse(localStorage.getItem('loans') || '[]');
    if (memberId) return all.filter((l: Loan) => l.member_id === memberId);
    return all;
  },
  getGuarantors: (loanId?: string): Guarantor[] => {
    mockDb.initialize();
    const all = JSON.parse(localStorage.getItem('guarantors') || '[]');
    if (loanId) return all.filter((g: Guarantor) => g.loan_id === loanId);
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
  getStaffUsers: (): StaffUser[] => {
    mockDb.initialize();
    return JSON.parse(localStorage.getItem('staff_users') || '[]');
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

  // Congregation CRUD
  saveCongregation: (name: string, id?: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getCongregations();
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    
    if (id) {
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        const prev = list[idx].name;
        list[idx].name = name;
        localStorage.setItem('congregations', JSON.stringify(list));
        mockDb.logAudit(activeOperator, 'Edit Congregation', 'Congregations', id, prev, name);
      }
    } else {
      const newC: Congregation = {
        id: 'c' + generateId(),
        name,
        created_at: getNowString()
      };
      list.push(newC);
      localStorage.setItem('congregations', JSON.stringify(list));
      mockDb.logAudit(activeOperator, 'Add Congregation', 'Congregations', newC.id, 'N/A', name);
    }
  },

  deleteCongregation: (id: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getCongregations();
    const match = list.find(c => c.id === id);
    if (!match) return;

    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem('congregations', JSON.stringify(filtered));
    
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    mockDb.logAudit(activeOperator, 'Delete Congregation', 'Congregations', id, match.name, 'Deleted');
  },

  // Members CRUD
  saveMember: (
    memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>,
    beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[],
    operator: { name: string; email: string; role: string }
  ) => {
    const members = mockDb.getMembers();
    const acc = generateAccountNumber(members.length + 1);
    const mId = 'm' + generateId();

    const newM: Member = {
      ...memberData,
      id: mId,
      account_number: acc,
      created_at: getNowString()
    };
    members.push(newM);
    localStorage.setItem('members', JSON.stringify(members));

    const beneficiaries = mockDb.getBeneficiaries();
    const newBs = beneficiariesData.map((b, idx) => ({
      ...b,
      id: 'b' + generateId() + idx,
      member_id: mId
    }));
    beneficiaries.push(...newBs);
    localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));

    mockDb.logAudit(operator, 'Register Member', 'Members', mId, 'N/A', JSON.stringify(newM));
    return newM;
  },

  editMember: (
    id: string,
    memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>,
    beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[],
    operator: { name: string; email: string; role: string }
  ) => {
    const members = mockDb.getMembers();
    const idx = members.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Member not found');

    const prev = members[idx];
    members[idx] = {
      ...prev,
      ...memberData
    };
    localStorage.setItem('members', JSON.stringify(members));

    let beneficiaries = mockDb.getBeneficiaries();
    beneficiaries = beneficiaries.filter(b => b.member_id !== id);
    const newBs = beneficiariesData.map((b, i) => ({
      ...b,
      id: 'b' + generateId() + i,
      member_id: id
    }));
    beneficiaries.push(...newBs);
    localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));

    mockDb.logAudit(operator, 'Update Member Details', 'Members', id, JSON.stringify(prev), JSON.stringify(members[idx]));
  },

  // Transactions posting
  postTransaction: (
    txData: { member_id: string; type: 'deposit' | 'withdrawal' | 'share_purchase'; amount: number; description: string; reference?: string; notes?: string },
    operator: { name: string; email: string; role: string }
  ) => {
    const members = mockDb.getMembers();
    const member = members.find(m => m.id === txData.member_id);
    if (!member) throw new Error('Member not found');

    if (txData.type === 'withdrawal') {
      const bal = mockDb.getMemberSavingsBalance(txData.member_id);
      if (bal < txData.amount) throw new Error(`Insufficient funds. Available: GHS ${bal}`);
    }

    const txId = 't' + generateId();
    const desc = `${txData.description}${txData.reference ? ' (Ref: ' + txData.reference + ')' : ''}`;

    const newTx: Transaction = {
      id: txId,
      member_id: txData.member_id,
      account_number: member.account_number,
      type: txData.type,
      amount: txData.amount,
      date: getNowString(),
      description: desc,
      posted_by: operator.name
    };

    const txs = mockDb.getTransactions();
    txs.unshift(newTx);
    localStorage.setItem('transactions', JSON.stringify(txs));

    // COA accounting double entry update
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

    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `Auto Post ${txData.type.toUpperCase()}: ${member.full_name} (${member.account_number})`,
      debits,
      credits
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    // Audit Log
    mockDb.logAudit(operator, `Post Transaction (${txData.type})`, 'Transactions', txId, 'N/A', `Amount: GHS ${txData.amount}`);

    // Trigger SMS with placeholders evaluation
    const updatedBal = txData.type === 'share_purchase' ? mockDb.getMemberSharesBalance(member.id) : mockDb.getMemberSavingsBalance(member.id);
    const eventType = txData.type === 'deposit' ? 'Deposit Received' : txData.type === 'withdrawal' ? 'Withdrawal Completed' : 'Normal Notification';
    mockDb.triggerSMSByEvent(eventType, member, txData.amount, updatedBal);

    return newTx;
  },

  // Loans Application & Statuses
  applyForLoan: (
    loanData: { member_id: string; member_name: string; principal: number; interest_rate: number; term_months: number; purpose: string; collateral: string },
    operator: { name: string; email: string; role: string }
  ) => {
    const loanId = 'l' + generateId();
    const totalRepay = loanData.principal * (1 + (loanData.interest_rate / 100));
    const monthlyInstallment = Number((totalRepay / loanData.term_months).toFixed(2));

    const newL: Loan = {
      ...loanData,
      id: loanId,
      status: 'pending',
      monthly_installment: monthlyInstallment,
      outstanding_balance: loanData.principal,
      created_at: getNowString()
    };

    const loans = mockDb.getLoans();
    loans.unshift(newL);
    localStorage.setItem('loans', JSON.stringify(loans));

    mockDb.logAudit(operator, 'Apply for Loan', 'Loans', loanId, 'N/A', `Principal: GHS ${loanData.principal}`);

    const member = mockDb.getMembers().find(m => m.id === loanData.member_id);
    if (member) {
      mockDb.triggerSMSByEvent('Loan Application Submitted', member, loanData.principal, loanData.principal, loanData.principal, loanData.interest_rate);
    }

    return newL;
  },

  updateLoanStatus: (id: string, status: 'approved' | 'rejected' | 'disbursed', operator: { name: string; email: string; role: string }) => {
    const loans = mockDb.getLoans();
    const idx = loans.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Loan profile not found');

    const prev = loans[idx].status;
    loans[idx].status = status;

    if (status === 'disbursed') {
      // Dr Accounts Receivable (1100), Cr Cash (1000)
      mockDb.updateCOABalance(1100, loans[idx].principal);
      mockDb.updateCOABalance(1000, -loans[idx].principal);

      const entries = mockDb.getJournalEntries();
      const newJe: JournalEntry = {
        id: 'je' + generateId(),
        date: getNowString(),
        description: `Disbursement of Loan ID: ${id} to ${loans[idx].member_name}`,
        debits: [{ account_no: 1100, amount: loans[idx].principal }],
        credits: [{ account_no: 1000, amount: loans[idx].principal }]
      };
      entries.unshift(newJe);
      localStorage.setItem('journal_entries', JSON.stringify(entries));

      // Trigger SMS Alert
      const member = mockDb.getMembers().find(m => m.id === loans[idx].member_id);
      if (member) {
        mockDb.triggerSMSByEvent('Loan Disbursed', member, loans[idx].principal, loans[idx].monthly_installment, loans[idx].principal, loans[idx].term_months);
      }
    } else if (status === 'approved') {
      const member = mockDb.getMembers().find(m => m.id === loans[idx].member_id);
      if (member) {
        mockDb.triggerSMSByEvent('Loan Approved', member, loans[idx].principal, loans[idx].principal, loans[idx].principal);
      }
    }

    localStorage.setItem('loans', JSON.stringify(loans));
    mockDb.logAudit(operator, `Update Loan Status to ${status}`, 'Loans', id, prev, status);

    return loans[idx];
  },

  repayLoan: (id: string, amount: number, operator: { name: string; email: string; role: string }) => {
    const loans = mockDb.getLoans();
    const idx = loans.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Loan not found');

    const loan = loans[idx];
    const principalPaid = Number((amount * 0.9).toFixed(2));
    const interestPaid = Number((amount * 0.1).toFixed(2));

    const prev = loan.outstanding_balance;
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
      description: `Loan payment: principal GHS ${principalPaid}, interest GHS ${interestPaid}`,
      posted_by: operator.name
    };

    const transactions = mockDb.getTransactions();
    transactions.unshift(newTx);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Double entry bookkeeping mapping
    mockDb.updateCOABalance(1000, amount);
    mockDb.updateCOABalance(1100, -principalPaid);
    mockDb.updateCOABalance(4100, interestPaid);

    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `Loan Repayment from ${loan.member_name} (Loan Ref: ${id})`,
      debits: [{ account_no: 1000, amount }],
      credits: [
        { account_no: 1100, amount: principalPaid },
        { account_no: 4100, amount: interestPaid }
      ]
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    localStorage.setItem('loans', JSON.stringify(loans));
    mockDb.logAudit(operator, 'Post Loan Repayment', 'Loans', id, `Outstanding: GHS ${prev}`, `Outstanding: GHS ${loan.outstanding_balance}`);

    if (member) {
      mockDb.triggerSMSByEvent('Loan Repayment Received', member, amount, loan.outstanding_balance);
    }

    return loan;
  },

  // Guarantors CRUD
  saveGuarantor: (
    gData: { loan_id: string; member_id?: string; full_name: string; phone_number: string; relationship: string; amount: number },
    operator: { name: string; email: string; role: string }
  ) => {
    const list = mockDb.getGuarantors();
    let name = gData.full_name;
    let tel = gData.phone_number;

    if (gData.member_id) {
      const m = mockDb.getMembers().find(x => x.id === gData.member_id);
      if (m) {
        name = m.full_name;
        tel = m.phone_number;
      }
    }

    const newG: Guarantor = {
      ...gData,
      id: 'g' + generateId(),
      full_name: name,
      phone_number: tel,
      created_at: getNowString()
    };
    list.unshift(newG);
    localStorage.setItem('guarantors', JSON.stringify(list));

    mockDb.logAudit(operator, 'Link Guarantor', 'Loans', newG.id, 'N/A', `Guaranteed: GHS ${gData.amount} for Loan ID ${gData.loan_id}`);
    return newG;
  },

  // Dividends Allocation
  distributeDividends: (percentage: number, operator: { name: string; email: string; role: string }) => {
    const members = mockDb.getMembers();
    const transactions = mockDb.getTransactions();
    const entries = mockDb.getJournalEntries();
    let totalPaid = 0;

    const updatedTxs = [...transactions];

    members.forEach(m => {
      const shareBal = mockDb.getMemberSharesBalance(m.id);
      if (shareBal > 0) {
        const divAmt = Number((shareBal * (percentage / 100)).toFixed(2));
        totalPaid += divAmt;

        const newTx: Transaction = {
          id: 't' + generateId(),
          member_id: m.id,
          account_number: m.account_number,
          type: 'dividend',
          amount: divAmt,
          date: getNowString(),
          description: `${percentage}% Share Dividends allocation`,
          posted_by: operator.name
        };
        updatedTxs.unshift(newTx);

        // SMS notification trigger
        mockDb.triggerSMSByEvent('Deposit Received', m, divAmt, mockDb.getMemberSavingsBalance(m.id) + divAmt);
      }
    });

    localStorage.setItem('transactions', JSON.stringify(updatedTxs));

    mockDb.updateCOABalance(3100, -totalPaid);
    mockDb.updateCOABalance(1000, -totalPaid);

    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `Auto Post Dividend: Distributed ${percentage}% dividend pool.`,
      debits: [{ account_no: 3100, amount: totalPaid }],
      credits: [{ account_no: 1000, amount: totalPaid }]
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    mockDb.logAudit(operator, 'Distribute Dividends Pool', 'Shares', 'All Accounts', 'N/A', `Total Distributed: GHS ${totalPaid}`);
    return totalPaid;
  },

  // Manual ledger journal voucher
  postJournalVoucher: (entryData: Omit<JournalEntry, 'id' | 'date'>, operator: { name: string; email: string; role: string }) => {
    const dSum = entryData.debits.reduce((s, d) => s + d.amount, 0);
    const cSum = entryData.credits.reduce((s, c) => s + c.amount, 0);

    if (Math.abs(dSum - cSum) > 0.01) {
      throw new Error(`Ledger entry out of balance. Debits (GHS ${dSum}) must equal Credits (GHS ${cSum}).`);
    }

    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      ...entryData,
      id: 'je' + generateId(),
      date: getNowString()
    };

    entryData.debits.forEach(d => mockDb.updateCOABalance(d.account_no, d.amount));
    entryData.credits.forEach(c => mockDb.updateCOABalance(c.account_no, -c.amount));

    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    mockDb.logAudit(operator, 'Post Manual Journal Entry', 'Accounting', newJe.id, 'N/A', entryData.description);
    return newJe;
  },

  // Mobile Money integration transactions
  createMoMoTransaction: (
    txData: { type: 'collection' | 'payout'; network: string; member_id?: string; amount: number; phone_number: string; purpose: string; reference: string },
    operator: { name: string; email: string; role: string }
  ) => {
    const list = mockDb.getMoMoTransactions();
    let mName = 'Walk-in Client';

    if (txData.member_id) {
      const m = mockDb.getMembers().find(x => x.id === txData.member_id);
      if (m) mName = m.full_name;
    }

    const newTx: MobileMoneyTransaction = {
      id: 'mo' + generateId(),
      member_id: txData.member_id,
      member_name: mName,
      phone_number: txData.phone_number,
      amount: txData.amount,
      type: txData.type,
      network: txData.network,
      purpose: txData.purpose,
      status: 'success',
      timestamp: getNowString(),
      reference: txData.reference
    };
    list.unshift(newTx);
    localStorage.setItem('momo_transactions', JSON.stringify(list));

    // Audit Log
    mockDb.logAudit(operator, 'Record MoMo Transaction', 'MobileMoney', newTx.id, 'N/A', `Amount: GHS ${txData.amount} (${txData.type})`);

    // Side trigger transaction posting
    if (txData.member_id) {
      if (txData.purpose === 'Savings Deposit') {
        mockDb.postTransaction({
          member_id: txData.member_id,
          type: 'deposit',
          amount: txData.amount,
          description: `Mobile Money Collection (Ref: ${txData.reference})`
        }, operator);
      } else if (txData.purpose === 'Shares Purchase') {
        mockDb.postTransaction({
          member_id: txData.member_id,
          type: 'share_purchase',
          amount: txData.amount,
          description: `Mobile Money Share purchase (Ref: ${txData.reference})`
        }, operator);
      } else if (txData.purpose === 'Loan Repayment') {
        const loan = mockDb.getLoans().find(l => l.member_id === txData.member_id && (l.status === 'disbursed' || l.status === 'active'));
        if (loan) {
          mockDb.repayLoan(loan.id, txData.amount, operator);
        }
      }
    }

    return newTx;
  },

  // Templates Management CRUD
  saveSMSTemplate: (templateData: { name: string; event: string; body: string; recipient_type: string }, id?: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getSMSTemplates();
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };

    if (id) {
      const idx = list.findIndex(t => t.id === id);
      if (idx !== -1) {
        const prev = list[idx].body;
        list[idx] = { ...list[idx], ...templateData };
        localStorage.setItem('sms_templates', JSON.stringify(list));
        mockDb.logAudit(activeOperator, 'Edit SMS Template', 'SMS', id, prev, templateData.body);
      }
    } else {
      const newT: SMSTemplate = {
        id: 's' + generateId(),
        ...templateData
      };
      list.push(newT);
      localStorage.setItem('sms_templates', JSON.stringify(list));
      mockDb.logAudit(activeOperator, 'Create SMS Template', 'SMS', newT.id, 'N/A', templateData.body);
    }
  },

  deleteSMSTemplate: (id: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getSMSTemplates();
    const match = list.find(t => t.id === id);
    if (!match) return;

    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem('sms_templates', JSON.stringify(filtered));
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    mockDb.logAudit(activeOperator, 'Delete SMS Template', 'SMS', id, match.name, 'Deleted');
  },

  saveSMSSettings: (settings: any, operator: { name: string; email: string; role: string }) => {
    localStorage.setItem('sms_settings', JSON.stringify(settings));
    mockDb.logAudit(operator, 'Update Gateway settings', 'SMS', 'Settings Config', 'N/A', `Provider: ${settings.selected_provider}`);
  },

  topUpSMSWallet: (amount: number, operator: { name: string; email: string; role: string }) => {
    const cur = mockDb.getSMSWallet();
    const credits = amount * 10;
    const newVal = cur + credits;
    localStorage.setItem('sms_wallet', newVal.toString());

    // Expense double entries
    mockDb.updateCOABalance(1000, -amount);
    mockDb.updateCOABalance(5300, amount);

    const entries = mockDb.getJournalEntries();
    const newJe: JournalEntry = {
      id: 'je' + generateId(),
      date: getNowString(),
      description: `SMS Wallet Top-up: GHS ${amount}`,
      debits: [{ account_no: 5300, amount }],
      credits: [{ account_no: 1000, amount }]
    };
    entries.unshift(newJe);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    mockDb.logAudit(operator, 'Topup SMS Credits Wallet', 'SMS', 'Wallet Balance', `Credits: ${cur}`, `Credits: ${newVal}`);
    return newVal;
  },

  // Manual Compose sendSMS triggers
  sendSMSManual: (
    memberId: string,
    templateId: string,
    customMessage: string,
    operator: { name: string; email: string; role: string }
  ) => {
    const members = mockDb.getMembers();
    const member = members.find(m => m.id === memberId);
    if (!member) throw new Error('Member profile not found');

    let bodyText = customMessage;
    let eventName = 'Normal Notification';

    if (templateId) {
      const templates = mockDb.getSMSTemplates();
      const match = templates.find(t => t.id === templateId);
      if (match) {
        eventName = match.event;
        if (!bodyText.trim()) {
          bodyText = match.body;
        }
      }
    }

    // Substitute placeholders
    const valAmount = 0;
    const valBalance = mockDb.getMemberSavingsBalance(member.id);
    const parsedText = mockDb.parseSMSPlaceholders(bodyText, member, valAmount, valBalance);

    const wallet = mockDb.getSMSWallet();
    const settings = mockDb.getSMSSettings();
    const hasCredits = wallet > 0;

    const newLog: SMSLog = {
      id: 'sms' + generateId(),
      timestamp: getNowString(),
      recipient_name: member.full_name,
      recipient_phone: member.phone_number,
      message: parsedText,
      event: eventName,
      status: hasCredits ? 'Delivered' : 'Failed',
      reference_id: 'REF-' + Math.floor(100000 + Math.random() * 900000),
      api_used: settings.selected_provider || 'Mock'
    };

    if (hasCredits) {
      localStorage.setItem('sms_wallet', (wallet - 1).toString());
    }

    const logs = mockDb.getSMSLogs();
    logs.unshift(newLog);
    localStorage.setItem('sms_logs', JSON.stringify(logs));

    // Audit log
    mockDb.logAudit(operator, 'Send Compose SMS', 'SMS', newLog.id, 'N/A', `Recipient: ${member.full_name}`);
  },

  // Delete SMS delivery log record
  deleteSMSLog: (id: string, operator: { name: string; email: string; role: string }) => {
    const logs = mockDb.getSMSLogs();
    const filtered = logs.filter(l => l.id !== id);
    localStorage.setItem('sms_logs', JSON.stringify(filtered));
    mockDb.logAudit(operator, 'Delete SMS Delivery Log', 'SMS', id, 'Log Record', 'Deleted');
  },

  // Staff Roles mutations
  assignUserRole: (email: string, roleName: string, fullName?: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getStaffUsers();
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };

    const idx = list.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      const prev = list[idx].role;
      list[idx].role = roleName;
      localStorage.setItem('staff_users', JSON.stringify(list));
      mockDb.logAudit(activeOperator, 'Change Staff User Role', 'UserRoles', email, prev, roleName);
    } else {
      const newU: StaffUser = {
        email,
        full_name: fullName || 'New Staff User',
        role: roleName,
        status: 'Active',
        last_signin: 'N/A',
        created_at: getNowString()
      };
      list.push(newU);
      localStorage.setItem('staff_users', JSON.stringify(list));
      mockDb.logAudit(activeOperator, 'Assign Staff User Role', 'UserRoles', email, 'N/A', roleName);
    }
  },

  revokeUserRole: (email: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getStaffUsers();
    const filtered = list.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem('staff_users', JSON.stringify(filtered));
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    mockDb.logAudit(activeOperator, 'Revoke Staff User Role', 'UserRoles', email, 'Assigned Role', 'Revoked/Removed');
  },

  // SMS Placeholders evaluator
  parseSMSPlaceholders: (body: string, member: Member, amount: number, balance: number, loanAmount?: number, term?: number): string => {
    let result = body;
    result = result.replace(/{full_name}/g, member.full_name);
    result = result.replace(/{account_number}/g, member.account_number);
    result = result.replace(/{amount}/g, amount.toFixed(2));
    result = result.replace(/{balance}/g, balance.toLocaleString(undefined, { minimumFractionDigits: 2 }));
    result = result.replace(/{loan_amount}/g, (loanAmount || 0).toFixed(2));
    result = result.replace(/{interest}/g, (term || 0).toString());
    result = result.replace(/{date}/g, new Date().toLocaleDateString());
    return result;
  },

  // Automate sms triggers by event
  triggerSMSByEvent: (event: string, member: Member, amount: number, balance: number, loanAmount?: number, term?: number) => {
    const templates = mockDb.getSMSTemplates();
    const template = templates.find(t => t.event === event);
    if (!template) return;

    const msg = mockDb.parseSMSPlaceholders(template.body, member, amount, balance, loanAmount, term);
    
    const wallet = mockDb.getSMSWallet();
    const settings = mockDb.getSMSSettings();
    const hasCredits = wallet > 0;

    const newLog: SMSLog = {
      id: 'sms' + generateId(),
      timestamp: getNowString(),
      recipient_name: member.full_name,
      recipient_phone: member.phone_number,
      message: msg,
      event,
      status: hasCredits ? 'Delivered' : 'Failed',
      reference_id: 'REF-' + Math.floor(100000 + Math.random() * 900000),
      api_used: settings.selected_provider || 'Mock'
    };

    if (hasCredits) {
      localStorage.setItem('sms_wallet', (wallet - 1).toString());
    }

    const logs = mockDb.getSMSLogs();
    logs.unshift(newLog);
    localStorage.setItem('sms_logs', JSON.stringify(logs));
  },

  // General helpers
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

  resetDatabase: () => {
    localStorage.removeItem('congregations');
    localStorage.removeItem('members');
    localStorage.removeItem('beneficiaries');
    localStorage.removeItem('transactions');
    localStorage.removeItem('loans');
    localStorage.removeItem('guarantors');
    localStorage.removeItem('sms_templates');
    localStorage.removeItem('sms_logs');
    localStorage.removeItem('staff_users');
    localStorage.removeItem('audit_logs');
    localStorage.removeItem('chart_of_accounts');
    localStorage.removeItem('journal_entries');
    localStorage.removeItem('sms_wallet');
    localStorage.removeItem('sms_settings');
    localStorage.removeItem('momo_transactions');
    mockDb.initialize();
  }
};
