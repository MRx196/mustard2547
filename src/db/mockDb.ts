import type { Member, Beneficiary, Transaction, Loan, SMSLog, SMSTemplate, AuditLog, AccountCOA, JournalEntry, MobileMoneyTransaction, Congregation, Guarantor, StaffUser } from './supabase';
import { supabase } from './supabase';

const generateId = () => Math.random().toString(36).substring(2, 15);
const getNowString = () => new Date().toISOString();

export const generateAccountNumber = (index: number): string => {
  return `SDMS ${String(index).padStart(4, '0')}`;
};

// Seed Congregations (Empty in Production)
const INITIAL_CONGREGATIONS: Congregation[] = [];

// Seed Chart of Accounts (Balances set to 0 for Production)
const INITIAL_COA: AccountCOA[] = [
  { account_no: 1000, account_name: 'Cash', category: 'Assets', balance: 0 },
  { account_no: 1100, account_name: 'Accounts Receivable', category: 'Assets', balance: 0 },
  { account_no: 1200, account_name: 'Inventory', category: 'Assets', balance: 0 },
  { account_no: 1500, account_name: 'Equipment', category: 'Assets', balance: 0 },
  { account_no: 2000, account_name: 'Accounts Payable', category: 'Liabilities', balance: 0 },
  { account_no: 2100, account_name: 'Loans Payable', category: 'Liabilities', balance: 0 },
  { account_no: 3000, account_name: "Owner's Capital", category: 'Equity', balance: 0 },
  { account_no: 3100, account_name: 'Retained Earnings', category: 'Equity', balance: 0 },
  { account_no: 4000, account_name: 'Sales Revenue', category: 'Revenue', balance: 0 },
  { account_no: 4100, account_name: 'Service Revenue', category: 'Revenue', balance: 0 },
  { account_no: 5000, account_name: 'Cost of Goods Sold', category: 'Expenses', balance: 0 },
  { account_no: 5100, account_name: 'Salaries Expense', category: 'Expenses', balance: 0 },
  { account_no: 5200, account_name: 'Rent Expense', category: 'Expenses', balance: 0 },
  { account_no: 5300, account_name: 'Utilities Expense', category: 'Expenses', balance: 0 },
  { account_no: 5400, account_name: 'Marketing Expense', category: 'Expenses', balance: 0 }
];

// Seed Members (Empty in Production)
const INITIAL_MEMBERS: Member[] = [];

// Seed Beneficiaries (Empty in Production)
const INITIAL_BENEFICIARIES: Beneficiary[] = [];

// Seed Transactions (Empty in Production)
const INITIAL_TRANSACTIONS: Transaction[] = [];

// Seed Loans (Empty in Production)
const INITIAL_LOANS: Loan[] = [];

// Seed SMS Templates (Required System Reference Configurations)
const INITIAL_SMS_TEMPLATES: SMSTemplate[] = [
  { id: 's1', name: 'Deposit Alert', event: 'Deposit Received', body: 'Dear {full_name}, GHS {amount} deposited to your savings. New Balance: GHS {balance}. Acc: {account_number}. Thank you!', recipient_type: 'Member' },
  { id: 's2', name: 'Withdrawal Alert', event: 'Withdrawal Completed', body: 'Dear {full_name}, GHS {amount} withdrawn from your savings. Remaining: GHS {balance}. Acc: {account_number}.', recipient_type: 'Member' },
  { id: 's3', name: 'Loan Request Notice', event: 'Loan Application Submitted', body: 'Hello {full_name}, your loan request of GHS {loan_amount} is submitted. Ref: {account_number}.', recipient_type: 'Member' },
  { id: 's4', name: 'Loan Approved Notice', event: 'Loan Approved', body: 'Dear {full_name}, your loan application of GHS {loan_amount} has been approved.', recipient_type: 'Member' },
  { id: 's5', name: 'Loan Disbursed Alert', event: 'Loan Disbursed', body: 'Dear {full_name}, GHS {loan_amount} disbursed. Monthly installment is GHS {balance} for {interest} months.', recipient_type: 'Member' },
  { id: 's6', name: 'Repayment Receipt Alert', event: 'Loan Repayment Received', body: 'Dear {full_name}, loan repayment of GHS {amount} received. Balance outstanding: GHS {balance}.', recipient_type: 'Member' },
  { id: 's7', name: 'General Message', event: 'Normal Notification', body: 'Dear {full_name}, this is a general broadcast message from Mustard Seed. Acc: {account_number}.', recipient_type: 'Member' }
];

// Seed Staff Users (Only production Super Administrator seeded)
const INITIAL_STAFF: StaffUser[] = [
  { email: 'mrxmail20@gmail.com', full_name: 'Super Admin', role: 'Super Administrator', status: 'Active', last_signin: '2026-07-14T07:00:00Z', created_at: '2026-01-01T00:00:00Z', username: 'superadmin', phone_number: '+233240001100' }
];

// Seed Audit Logs (Empty in Production)
const INITIAL_AUDIT: AuditLog[] = [];

export const mockDb = {
  onSyncCallbacks: [] as (() => void)[],
  registerOnSync: (cb: () => void) => {
    mockDb.onSyncCallbacks.push(cb);
  },
  triggerSyncCallbacks: () => {
    mockDb.onSyncCallbacks.forEach(cb => cb());
  },
  triggerSync: async () => {
    await mockDb.syncFromSupabase();
    mockDb.triggerSyncCallbacks();
  },
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
    if (!localStorage.getItem('sms_wallet')) localStorage.setItem('sms_wallet', '0');
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

  /**
   * Sync from Supabase - Single Source of Truth
   * Automatically populates reference data into remote Supabase database if tables are empty.
   */
  syncFromSupabase: async () => {
    try {
      // 1. Staff users
      let { data: staff } = await supabase.from('users').select('*');
      if (!staff || staff.length === 0) {
        await supabase.from('users').insert(INITIAL_STAFF);
        staff = INITIAL_STAFF;
      }
      localStorage.setItem('staff_users', JSON.stringify(staff));

      // 2. Chart of accounts
      let { data: coa } = await supabase.from('chart_of_accounts').select('*');
      if (!coa || coa.length === 0) {
        await supabase.from('chart_of_accounts').insert(INITIAL_COA);
        coa = INITIAL_COA;
      }
      localStorage.setItem('chart_of_accounts', JSON.stringify(coa));

      // 3. SMS templates
      let { data: templates } = await supabase.from('sms_templates').select('*');
      if (!templates || templates.length === 0) {
        await supabase.from('sms_templates').insert(INITIAL_SMS_TEMPLATES);
        templates = INITIAL_SMS_TEMPLATES;
      }
      localStorage.setItem('sms_templates', JSON.stringify(templates));

      // 4. Congregations
      const { data: congregations } = await supabase.from('congregations').select('*');
      localStorage.setItem('congregations', JSON.stringify(congregations || []));

      // 5. Members
      const { data: members } = await supabase.from('members').select('*');
      localStorage.setItem('members', JSON.stringify(members || []));

      // 6. Beneficiaries
      const { data: beneficiaries } = await supabase.from('beneficiaries').select('*');
      localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries || []));

      // 7. Transactions
      const { data: transactions } = await supabase.from('transactions').select('*');
      localStorage.setItem('transactions', JSON.stringify(transactions || []));

      // 8. Loans
      const { data: loans } = await supabase.from('loans').select('*');
      localStorage.setItem('loans', JSON.stringify(loans || []));

      // 9. Guarantors
      const { data: guarantors } = await supabase.from('guarantors').select('*');
      localStorage.setItem('guarantors', JSON.stringify(guarantors || []));

      // 10. SMS logs
      const { data: smsLogs } = await supabase.from('sms_logs').select('*');
      localStorage.setItem('sms_logs', JSON.stringify(smsLogs || []));

      // 11. Audit logs
      const { data: audit } = await supabase.from('audit_logs').select('*');
      localStorage.setItem('audit_logs', JSON.stringify(audit || []));

      // 12. Journal entries
      const { data: journal } = await supabase.from('journal_entries').select('*');
      localStorage.setItem('journal_entries', JSON.stringify(journal || []));

      // 13. MoMo transactions
      const { data: momo } = await supabase.from('momo_transactions').select('*');
      localStorage.setItem('momo_transactions', JSON.stringify(momo || []));
      
    } catch (e) {
      console.warn("Supabase Database Offline Fallback:", e);
    }
  },

  // Auditing Helper
  logAudit: async (
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

    // Sync to Supabase
    const { error } = await supabase.from('audit_logs').insert(newLog);
    if (error) console.error("Audit log insertion failed:", error.message);
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

  // MUTATIONS (Synced directly to real Supabase database)

  // Congregation CRUD
  saveCongregation: async (name: string, id?: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getCongregations();
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    
    if (id) {
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        const prev = list[idx].name;
        list[idx].name = name;
        localStorage.setItem('congregations', JSON.stringify(list));
        await mockDb.logAudit(activeOperator, 'Edit Congregation', 'Congregations', id, prev, name);
        
        const { error } = await supabase.from('congregations').update({ name }).eq('id', id);
        if (error) throw new Error(`Supabase Error: ${error.message} (Code: ${error.code})`);
      }
    } else {
      const newC: Congregation = {
        id: 'c' + generateId(),
        name,
        created_at: getNowString()
      };
      list.push(newC);
      localStorage.setItem('congregations', JSON.stringify(list));
      await mockDb.logAudit(activeOperator, 'Add Congregation', 'Congregations', newC.id, 'N/A', name);
      
      const { error } = await supabase.from('congregations').insert(newC);
      if (error) throw new Error(`Supabase Error: ${error.message} (Code: ${error.code})`);
    }
    await mockDb.triggerSync();
  },

  deleteCongregation: async (id: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getCongregations();
    const match = list.find(c => c.id === id);
    if (!match) return;

    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem('congregations', JSON.stringify(filtered));
    
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    await mockDb.logAudit(activeOperator, 'Delete Congregation', 'Congregations', id, match.name, 'Deleted');
    
    const { error } = await supabase.from('congregations').delete().eq('id', id);
    if (error) throw new Error(`Supabase Error: ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  // Members CRUD
  saveMember: async (
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

    members.unshift(newM);
    localStorage.setItem('members', JSON.stringify(members));

    // Save beneficiaries locally
    const beneficiariesList: Beneficiary[] = beneficiariesData.map(b => ({
      ...b,
      id: 'b' + generateId(),
      member_id: mId
    }));
    
    const allBens = mockDb.getBeneficiaries();
    localStorage.setItem('beneficiaries', JSON.stringify([...beneficiariesList, ...allBens]));

    await mockDb.logAudit(operator, 'Register Member', 'Members', mId, 'N/A', JSON.stringify(newM));

    // Sync to Supabase
    const { error: mErr } = await supabase.from('members').insert(newM);
    if (mErr) throw new Error(`Supabase Error (Members): ${mErr.message} (Code: ${mErr.code})`);

    if (beneficiariesList.length > 0) {
      const { error: bErr } = await supabase.from('beneficiaries').insert(beneficiariesList);
      if (bErr) throw new Error(`Supabase Error (Beneficiaries): ${bErr.message} (Code: ${bErr.code})`);
    }
    await mockDb.triggerSync();
  },

  editMember: async (
    id: string,
    memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>,
    beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[],
    operator: { name: string; email: string; role: string }
  ) => {
    const members = mockDb.getMembers();
    const idx = members.findIndex(m => m.id === id);
    if (idx === -1) return;

    const prev = { ...members[idx] };
    members[idx] = {
      ...members[idx],
      ...memberData
    };
    localStorage.setItem('members', JSON.stringify(members));

    // Update beneficiaries locally
    const allBens = mockDb.getBeneficiaries().filter(b => b.member_id !== id);
    const newBens: Beneficiary[] = beneficiariesData.map(b => ({
      ...b,
      id: 'b' + generateId(),
      member_id: id
    }));
    localStorage.setItem('beneficiaries', JSON.stringify([...newBens, ...allBens]));

    await mockDb.logAudit(operator, 'Update Member Details', 'Members', id, JSON.stringify(prev), JSON.stringify(members[idx]));

    // Sync to Supabase
    const { error: mErr } = await supabase.from('members').update(memberData).eq('id', id);
    if (mErr) throw new Error(`Supabase Error (Members): ${mErr.message} (Code: ${mErr.code})`);

    const { error: delErr } = await supabase.from('beneficiaries').delete().eq('member_id', id);
    if (delErr) throw new Error(`Supabase Error (Delete Beneficiaries): ${delErr.message} (Code: ${delErr.code})`);

    if (newBens.length > 0) {
      const { error: insErr } = await supabase.from('beneficiaries').insert(newBens);
      if (insErr) throw new Error(`Supabase Error (Beneficiaries): ${insErr.message} (Code: ${insErr.code})`);
    }
    await mockDb.triggerSync();
  },

  // Transactions posting
  postTransaction: async (
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

    // Auto post journal entry
    const entryId = 'j' + generateId();
    const newEntry: JournalEntry = {
      id: entryId,
      date: getNowString(),
      description: `Auto Post: ${txData.type.replace('_', ' ').toUpperCase()} - ${member.full_name}`,
      debits,
      credits
    };

    const entries = mockDb.getJournalEntries();
    entries.unshift(newEntry);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    await mockDb.logAudit(operator, `Post Transaction (${txData.type})`, 'Savings', txId, 'N/A', JSON.stringify(newTx));

    // Sync to Supabase
    const { error: txErr } = await supabase.from('transactions').insert(newTx);
    if (txErr) throw new Error(`Supabase Error (Transactions): ${txErr.message} (Code: ${txErr.code})`);

    const { error: jeErr } = await supabase.from('journal_entries').insert(newEntry);
    if (jeErr) throw new Error(`Supabase Error (Journal Entries): ${jeErr.message} (Code: ${jeErr.code})`);

    await mockDb.triggerSync();
  },

  // Loans Application
  applyForLoan: async (
    loanData: { member_id: string; member_name: string; principal: number; interest_rate: number; term_months: number; purpose: string; collateral: string },
    operator: { name: string; email: string; role: string }
  ) => {
    const lId = 'l' + generateId();
    const monthlyInterest = (loanData.principal * (loanData.interest_rate / 100)) / loanData.term_months;
    const installment = Number(((loanData.principal / loanData.term_months) + monthlyInterest).toFixed(2));

    const newLoan: Loan = {
      id: lId,
      member_id: loanData.member_id,
      member_name: loanData.member_name,
      principal: loanData.principal,
      interest_rate: loanData.interest_rate,
      term_months: loanData.term_months,
      status: 'pending',
      collateral: loanData.collateral,
      monthly_installment: installment,
      outstanding_balance: loanData.principal + (loanData.principal * (loanData.interest_rate / 100)),
      created_at: getNowString()
    };

    const list = mockDb.getLoans();
    list.unshift(newLoan);
    localStorage.setItem('loans', JSON.stringify(list));

    await mockDb.logAudit(operator, 'Apply Loan', 'Loans', lId, 'N/A', JSON.stringify(newLoan));

    // Sync to Supabase
    const { error } = await supabase.from('loans').insert(newLoan);
    if (error) throw new Error(`Supabase Error (Loans): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  updateLoanStatus: async (id: string, status: 'approved' | 'rejected' | 'disbursed', operator: { name: string; email: string; role: string }) => {
    const loans = mockDb.getLoans();
    const idx = loans.findIndex(l => l.id === id);
    if (idx === -1) return;

    const prev = loans[idx].status;
    loans[idx].status = status;
    localStorage.setItem('loans', JSON.stringify(loans));

    // Accounting updates on disbursement
    if (status === 'disbursed') {
      mockDb.updateCOABalance(1100, loans[idx].principal);
      mockDb.updateCOABalance(1000, -loans[idx].principal);

      const debits = [{ account_no: 1100, amount: loans[idx].principal }];
      const credits = [{ account_no: 1000, amount: loans[idx].principal }];
      
      const newEntry: JournalEntry = {
        id: 'j' + generateId(),
        date: getNowString(),
        description: `Loan Disbursement: ${loans[idx].member_name}`,
        debits,
        credits
      };
      
      const entries = mockDb.getJournalEntries();
      entries.unshift(newEntry);
      localStorage.setItem('journal_entries', JSON.stringify(entries));

      // Post transaction
      const tx: Transaction = {
        id: 't' + generateId(),
        member_id: loans[idx].member_id,
        account_number: generateAccountNumber(1),
        type: 'loan_disbursement',
        amount: loans[idx].principal,
        date: getNowString(),
        description: `Loan disbursed: Ref ${id}`,
        posted_by: operator.name
      };
      const txs = mockDb.getTransactions();
      txs.unshift(tx);
      localStorage.setItem('transactions', JSON.stringify(txs));

      const { error: jeErr } = await supabase.from('journal_entries').insert(newEntry);
      if (jeErr) throw new Error(`Supabase Error (Journal Entries): ${jeErr.message} (Code: ${jeErr.code})`);

      const { error: txErr } = await supabase.from('transactions').insert(tx);
      if (txErr) throw new Error(`Supabase Error (Transactions): ${txErr.message} (Code: ${txErr.code})`);
    }

    await mockDb.logAudit(operator, `Update Loan Status to ${status}`, 'Loans', id, prev, status);

    // Sync to Supabase
    const { error } = await supabase.from('loans').update({ status }).eq('id', id);
    if (error) throw new Error(`Supabase Error (Loans): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  repayLoan: async (id: string, amount: number, operator: { name: string; email: string; role: string }) => {
    const loans = mockDb.getLoans();
    const idx = loans.findIndex(l => l.id === id);
    if (idx === -1) return;

    const prevBal = loans[idx].outstanding_balance;
    const newBal = Number(Math.max(0, prevBal - amount).toFixed(2));
    loans[idx].outstanding_balance = newBal;
    
    if (newBal === 0) {
      loans[idx].status = 'repaid';
    }
    localStorage.setItem('loans', JSON.stringify(loans));

    // Ledger posting
    const interestRatio = (loans[idx].interest_rate / 100) / (1 + (loans[idx].interest_rate / 100));
    const interestPaid = Number((amount * interestRatio).toFixed(2));
    const principalPaid = Number((amount - interestPaid).toFixed(2));

    mockDb.updateCOABalance(1000, amount);
    mockDb.updateCOABalance(1100, -principalPaid);
    mockDb.updateCOABalance(4100, interestPaid);

    const debits = [{ account_no: 1000, amount: amount }];
    const credits = [
      { account_no: 1100, amount: principalPaid },
      { account_no: 4100, amount: interestPaid }
    ];

    const newEntry: JournalEntry = {
      id: 'j' + generateId(),
      date: getNowString(),
      description: `Loan Repayment - ${loans[idx].member_name}`,
      debits,
      credits
    };
    const entries = mockDb.getJournalEntries();
    entries.unshift(newEntry);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    // Post transaction log
    const tx: Transaction = {
      id: 't' + generateId(),
      member_id: loans[idx].member_id,
      account_number: generateAccountNumber(1),
      type: 'loan_repayment',
      amount: amount,
      date: getNowString(),
      description: `Loan repayment: Ref ${id}`,
      posted_by: operator.name
    };
    const txs = mockDb.getTransactions();
    txs.unshift(tx);
    localStorage.setItem('transactions', JSON.stringify(txs));

    await mockDb.logAudit(operator, 'Post Loan Repayment', 'Loans', id, prevBal.toString(), newBal.toString());

    // Sync to Supabase
    const { error: lErr } = await supabase.from('loans').update({ outstanding_balance: newBal, status: loans[idx].status }).eq('id', id);
    if (lErr) throw new Error(`Supabase Error (Loans): ${lErr.message} (Code: ${lErr.code})`);

    const { error: jeErr } = await supabase.from('journal_entries').insert(newEntry);
    if (jeErr) throw new Error(`Supabase Error (Journal Entries): ${jeErr.message} (Code: ${jeErr.code})`);

    const { error: txErr } = await supabase.from('transactions').insert(tx);
    if (txErr) throw new Error(`Supabase Error (Transactions): ${txErr.message} (Code: ${txErr.code})`);

    await mockDb.triggerSync();
  },

  // Guarantors mapping
  saveGuarantor: async (
    guarantorData: { loan_id: string; member_id?: string; full_name: string; phone_number: string; relationship: string; amount: number },
    operator: { name: string; email: string; role: string }
  ) => {
    const list = mockDb.getGuarantors();
    const newG: Guarantor = {
      ...guarantorData,
      id: 'g' + generateId(),
      created_at: getNowString()
    };
    list.unshift(newG);
    localStorage.setItem('guarantors', JSON.stringify(list));

    await mockDb.logAudit(operator, 'Map Loan Guarantor', 'Loans', newG.id, 'N/A', JSON.stringify(newG));

    // Sync to Supabase
    const { error } = await supabase.from('guarantors').insert(newG);
    if (error) throw new Error(`Supabase Error (Guarantors): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  // Dividends distribution
  distributeDividends: async (percentage: number, operator: { name: string; email: string; role: string }) => {
    const members = mockDb.getMembers();
    const transactionsList = mockDb.getTransactions();
    
    let totalPaid = 0;
    const newTxs: Transaction[] = [];

    members.forEach(m => {
      const shares = mockDb.getMemberSharesBalance(m.id);
      if (shares > 0) {
        const dividend = Number((shares * (percentage / 100)).toFixed(2));
        totalPaid += dividend;

        const tx: Transaction = {
          id: 't' + generateId(),
          member_id: m.id,
          account_number: m.account_number,
          type: 'dividend',
          amount: dividend,
          date: getNowString(),
          description: `Dividend Pay: ${percentage}% on GHS ${shares} Shares`,
          posted_by: operator.name
        };

        newTxs.push(tx);
        transactionsList.unshift(tx);
      }
    });

    localStorage.setItem('transactions', JSON.stringify(transactionsList));

    // Ledger updates
    mockDb.updateCOABalance(3100, -totalPaid);
    mockDb.updateCOABalance(1000, -totalPaid);

    const debits = [{ account_no: 3100, amount: totalPaid }];
    const credits = [{ account_no: 1000, amount: totalPaid }];

    const newEntry: JournalEntry = {
      id: 'j' + generateId(),
      date: getNowString(),
      description: `Dividend Distribution - ${percentage}%`,
      debits,
      credits
    };
    const entries = mockDb.getJournalEntries();
    entries.unshift(newEntry);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    await mockDb.logAudit(operator, 'Distribute Shares Dividends', 'Shares', 'All Members', 'N/A', `Total Distributed: GHS ${totalPaid}`);

    // Sync to Supabase
    if (newTxs.length > 0) {
      const { error: txErr } = await supabase.from('transactions').insert(newTxs);
      if (txErr) throw new Error(`Supabase Error (Transactions): ${txErr.message} (Code: ${txErr.code})`);
    }
    const { error: jeErr } = await supabase.from('journal_entries').insert(newEntry);
    if (jeErr) throw new Error(`Supabase Error (Journal Entries): ${jeErr.message} (Code: ${jeErr.code})`);
    await mockDb.triggerSync();
  },

  // Journal Voucher Postings
  postJournalVoucher: async (entryData: Omit<JournalEntry, 'id' | 'date'>, operator: { name: string; email: string; role: string }) => {
    const entryId = 'j' + generateId();
    const newEntry: JournalEntry = {
      ...entryData,
      id: entryId,
      date: getNowString()
    };

    const entries = mockDb.getJournalEntries();
    entries.unshift(newEntry);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    // Update balances
    entryData.debits.forEach(d => mockDb.updateCOABalance(d.account_no, d.amount));
    entryData.credits.forEach(c => mockDb.updateCOABalance(c.account_no, -c.amount));

    await mockDb.logAudit(operator, 'Post Manual Journal Voucher', 'Accounting', entryId, 'N/A', JSON.stringify(newEntry));

    // Sync to Supabase
    const { error } = await supabase.from('journal_entries').insert(newEntry);
    if (error) throw new Error(`Supabase Error (Journal Entries): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  // MoMo Transaction logs
  createMoMoTransaction: async (
    txData: Omit<MobileMoneyTransaction, 'id' | 'timestamp' | 'status'>,
    operator: { name: string; email: string; role: string }
  ) => {
    const txId = 'mo' + generateId();
    const newMoMo: MobileMoneyTransaction = {
      ...txData,
      id: txId,
      status: 'success',
      timestamp: getNowString()
    };

    const list = mockDb.getMoMoTransactions();
    list.unshift(newMoMo);
    localStorage.setItem('momo_transactions', JSON.stringify(list));

    // Update Cash Balance
    const amount = txData.amount;
    if (txData.type === 'collection') {
      mockDb.updateCOABalance(1000, amount);
      mockDb.updateCOABalance(3100, amount);
    } else {
      mockDb.updateCOABalance(1000, -amount);
      mockDb.updateCOABalance(3100, -amount);
    }

    await mockDb.logAudit(operator, `Log MoMo Transaction (${txData.type})`, 'MoMo', txId, 'N/A', JSON.stringify(newMoMo));

    // Sync to Supabase
    const { error } = await supabase.from('momo_transactions').insert(newMoMo);
    if (error) throw new Error(`Supabase Error (MoMo Transactions): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  // SMS Notification settings
  saveSMSTemplate: async (template: Omit<SMSTemplate, 'id'>, id?: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getSMSTemplates();
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    
    if (id) {
      const idx = list.findIndex(t => t.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...template };
        localStorage.setItem('sms_templates', JSON.stringify(list));
        await mockDb.logAudit(activeOperator, 'Modify SMS Template', 'SMS', id, 'Template Body', template.body);
        
        const { error } = await supabase.from('sms_templates').update(template).eq('id', id);
        if (error) throw new Error(`Supabase Error (SMS Templates): ${error.message} (Code: ${error.code})`);
      }
    } else {
      const newT: SMSTemplate = {
        ...template,
        id: 's' + generateId()
      };
      list.push(newT);
      localStorage.setItem('sms_templates', JSON.stringify(list));
      await mockDb.logAudit(activeOperator, 'Create SMS Template', 'SMS', newT.id, 'N/A', template.body);
      
      const { error } = await supabase.from('sms_templates').insert(newT);
      if (error) throw new Error(`Supabase Error (SMS Templates): ${error.message} (Code: ${error.code})`);
    }
    await mockDb.triggerSync();
  },

  saveSMSSettings: async (settings: any, operator?: { name: string; email: string; role: string }) => {
    localStorage.setItem('sms_settings', JSON.stringify(settings));
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    await mockDb.logAudit(activeOperator, 'Update SMS API Configuration', 'SMS', 'API Gateways', 'Previous Gateway Settings', JSON.stringify(settings));
    await mockDb.triggerSync();
  },

  topUpSMSWallet: async (amount: number, operator: { name: string; email: string; role: string }) => {
    const current = mockDb.getSMSWallet();
    const next = current + amount;
    localStorage.setItem('sms_wallet', next.toString());

    // Book topup transaction
    mockDb.updateCOABalance(1000, -amount);
    mockDb.updateCOABalance(5300, amount);

    const debits = [{ account_no: 5300, amount }];
    const credits = [{ account_no: 1000, amount }];

    const newEntry: JournalEntry = {
      id: 'j' + generateId(),
      date: getNowString(),
      description: `SMS Wallet Top-Up: ${amount} GHS`,
      debits,
      credits
    };

    const entries = mockDb.getJournalEntries();
    entries.unshift(newEntry);
    localStorage.setItem('journal_entries', JSON.stringify(entries));

    await mockDb.logAudit(operator, 'Top Up SMS Gateway Wallet', 'SMS', 'SMS Wallet', current.toString(), next.toString());

    const { error } = await supabase.from('journal_entries').insert(newEntry);
    if (error) throw new Error(`Supabase Error (Journal Entries): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  deleteSMSLog: async (id: string, operator: { name: string; email: string; role: string }) => {
    const logs = mockDb.getSMSLogs();
    const filtered = logs.filter(l => l.id !== id);
    localStorage.setItem('sms_logs', JSON.stringify(filtered));
    await mockDb.logAudit(operator, 'Delete SMS Delivery Log', 'SMS', id, 'Log Record', 'Deleted');

    const { error } = await supabase.from('sms_logs').delete().eq('id', id);
    if (error) throw new Error(`Supabase Error (SMS Logs): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  // Staff Roles mutations
  assignUserRole: async (
    profile: { email: string; role: string; full_name?: string; username?: string; phone_number?: string; status?: 'Active' | 'Inactive'; auth_id?: string },
    operator?: { name: string; email: string; role: string }
  ) => {
    const list = mockDb.getStaffUsers();
    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };

    const idx = list.findIndex(u => u.email.toLowerCase() === profile.email.toLowerCase());
    if (idx !== -1) {
      const prev = JSON.stringify(list[idx]);
      list[idx] = {
        ...list[idx],
        role: profile.role,
        full_name: profile.full_name || list[idx].full_name,
        username: profile.username || list[idx].username,
        phone_number: profile.phone_number || list[idx].phone_number,
        status: profile.status || list[idx].status,
        auth_id: profile.auth_id || list[idx].auth_id
      };
      localStorage.setItem('staff_users', JSON.stringify(list));
      await mockDb.logAudit(activeOperator, 'Change Staff User Details', 'UserRoles', profile.email, prev, JSON.stringify(list[idx]));
      
      const { error } = await supabase.from('users').update({
        role: profile.role,
        full_name: profile.full_name,
        username: profile.username,
        phone_number: profile.phone_number,
        status: profile.status,
        auth_id: profile.auth_id
      }).eq('email', profile.email);
      if (error) throw new Error(`Supabase Error (Users): ${error.message} (Code: ${error.code})`);
    } else {
      const newU: StaffUser = {
        email: profile.email,
        full_name: profile.full_name || 'New Staff User',
        role: profile.role,
        status: profile.status || 'Active',
        last_signin: 'N/A',
        created_at: getNowString(),
        username: profile.username || profile.email.split('@')[0],
        phone_number: profile.phone_number || '',
        auth_id: profile.auth_id || ''
      };
      list.push(newU);
      localStorage.setItem('staff_users', JSON.stringify(list));
      await mockDb.logAudit(activeOperator, 'Assign Staff User Role', 'UserRoles', profile.email, 'N/A', JSON.stringify(newU));
      
      const { error } = await supabase.from('users').insert(newU);
      if (error) throw new Error(`Supabase Error (Users): ${error.message} (Code: ${error.code})`);
    }
    await mockDb.triggerSync();
  },

  revokeUserRole: async (email: string, operator?: { name: string; email: string; role: string }) => {
    const list = mockDb.getStaffUsers();
    const match = list.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!match) return;

    const filtered = list.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem('staff_users', JSON.stringify(filtered));

    const activeOperator = operator || { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    await mockDb.logAudit(activeOperator, 'Revoke Staff User Access', 'UserRoles', email, match.role, 'Revoked');

    const { error } = await supabase.from('users').delete().eq('email', email);
    if (error) throw new Error(`Supabase Error (Users): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  // LEDGER BALANCES CALCULATORS
  getMemberSavingsBalance: (memberId: string): number => {
    const txs = mockDb.getTransactions(memberId);
    return txs.reduce((bal, t) => {
      if (t.type === 'deposit') return bal + t.amount;
      if (t.type === 'withdrawal') return bal - t.amount;
      return bal;
    }, 0);
  },

  getMemberSharesBalance: (memberId: string): number => {
    const txs = mockDb.getTransactions(memberId);
    return txs.reduce((bal, t) => {
      if (t.type === 'share_purchase') return bal + t.amount;
      return bal;
    }, 0);
  },

  getOutstandingLoansBalance: (memberId: string): number => {
    const loans = mockDb.getLoans(memberId);
    return loans.reduce((bal, l) => {
      if (l.status === 'disbursed' || l.status === 'active') return bal + l.outstanding_balance;
      return bal;
    }, 0);
  },

  getMemberLoansBalance: (memberId: string): number => {
    return mockDb.getOutstandingLoansBalance(memberId);
  },

  sendSMSManual: async (
    memberId: string,
    templateId: string,
    customMsg: string,
    operator: { name: string; email: string; role: string }
  ) => {
    const member = mockDb.getMembers().find(m => m.id === memberId);
    if (!member) throw new Error('Member not found');

    const templatesList = mockDb.getSMSTemplates();
    const template = templatesList.find(t => t.id === templateId || t.name === templateId || t.event === templateId);
    const event = template ? template.event : 'Normal Notification';
    
    let message = customMsg;
    if (!message && template) {
      const balance = mockDb.getMemberSavingsBalance(memberId);
      const loanBal = mockDb.getMemberLoansBalance(memberId);
      message = mockDb.parseSMSPlaceholders(template.body, member, 0, balance, loanBal, 0);
    } else if (!message) {
      message = 'Hello, this is a standard notification from Mustard Seed.';
    }

    const logId = 'sms_log_' + generateId();
    const newLog: SMSLog = {
      id: logId,
      timestamp: getNowString(),
      recipient_name: member.full_name,
      recipient_phone: member.phone_number,
      message,
      event,
      status: 'Delivered',
      reference_id: 'REF_' + Math.floor(100000 + Math.random() * 900000),
      api_used: 'Arkesel Gateway'
    };

    const logs = mockDb.getSMSLogs();
    logs.unshift(newLog);
    localStorage.setItem('sms_logs', JSON.stringify(logs));

    // Deduct 1 SMS credit (0.10 GHS)
    const currentWallet = mockDb.getSMSWallet();
    const nextWallet = Math.max(0, currentWallet - 0.10);
    localStorage.setItem('sms_wallet', nextWallet.toString());

    await mockDb.logAudit(operator, 'Send SMS Notification', 'SMS', logId, 'Wallet Deduction: 0.10 GHS', `Message: "${message}"`);

    // Sync to Supabase
    const { error } = await supabase.from('sms_logs').insert(newLog);
    if (error) throw new Error(`Supabase Error (SMS Logs): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
    return newLog;
  },

  deleteSMSTemplate: async (id: string, operator: { name: string; email: string; role: string }) => {
    const list = mockDb.getSMSTemplates();
    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem('sms_templates', JSON.stringify(filtered));
    await mockDb.logAudit(operator, 'Delete SMS Template', 'SMS', id, 'Template', 'Deleted');

    const { error } = await supabase.from('sms_templates').delete().eq('id', id);
    if (error) throw new Error(`Supabase Error (SMS Templates): ${error.message} (Code: ${error.code})`);
    await mockDb.triggerSync();
  },

  parseSMSPlaceholders: (
    templateBody: string,
    member: Member,
    amount?: number,
    balance?: number,
    loanAmount?: number,
    interest?: number
  ): string => {
    let result = templateBody;
    result = result.replace(/{full_name}/g, member.full_name);
    result = result.replace(/{account_number}/g, member.account_number);
    result = result.replace(/{amount}/g, amount !== undefined ? amount.toFixed(2) : '0.00');
    result = result.replace(/{balance}/g, balance !== undefined ? balance.toFixed(2) : '0.00');
    result = result.replace(/{loan_amount}/g, loanAmount !== undefined ? loanAmount.toFixed(2) : '0.00');
    result = result.replace(/{interest}/g, interest !== undefined ? interest.toString() : '0');
    return result;
  },

  updateCOABalance: async (accountNo: number, amount: number) => {
    const coa = mockDb.getCOA();
    const idx = coa.findIndex(a => a.account_no === accountNo);
    if (idx !== -1) {
      const balance = Number((coa[idx].balance + amount).toFixed(2));
      coa[idx].balance = balance;
      localStorage.setItem('chart_of_accounts', JSON.stringify(coa));

      // Sync to Supabase
      const { error } = await supabase.from('chart_of_accounts').update({ balance }).eq('account_no', accountNo);
      if (error) throw new Error(`Supabase Error (Chart of Accounts): ${error.message} (Code: ${error.code})`);
    }
  },

  resetDatabase: async () => {
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
    
    // Clear Supabase transactional tables
    try {
      await supabase.from('congregations').delete().neq('id', 'placeholder');
      await supabase.from('members').delete().neq('id', 'placeholder');
      await supabase.from('beneficiaries').delete().neq('id', 'placeholder');
      await supabase.from('transactions').delete().neq('id', 'placeholder');
      await supabase.from('loans').delete().neq('id', 'placeholder');
      await supabase.from('guarantors').delete().neq('id', 'placeholder');
      await supabase.from('sms_logs').delete().neq('id', 'placeholder');
      await supabase.from('audit_logs').delete().neq('id', 'placeholder');
      await supabase.from('journal_entries').delete().neq('id', 'placeholder');
      await supabase.from('momo_transactions').delete().neq('id', 'placeholder');
      
      // Reset COA balances to 0 in Supabase
      const coaList = INITIAL_COA;
      for (const item of coaList) {
        await supabase.from('chart_of_accounts').update({ balance: 0 }).eq('account_no', item.account_no);
      }
    } catch (e) {
      console.warn("Supabase Reset Warning:", e);
    }
    
    mockDb.initialize();
    await mockDb.syncFromSupabase();
    mockDb.triggerSyncCallbacks();
  }
};
