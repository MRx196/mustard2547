import { useState, useEffect } from 'react';
import { mockDb } from './db/mockDb';
import type { Member, Beneficiary, Transaction, Loan, SMSLog, SMSTemplate, AuditLog, AccountCOA, JournalEntry, MobileMoneyTransaction, Congregation, Guarantor } from './db/supabase';

// Components
import { Dashboard } from './components/Dashboard';
import { CongregationManagement } from './components/CongregationManagement';
import { MemberManagement } from './components/MemberManagement';
import { SavingsManagement } from './components/SavingsManagement';
import { WithdrawalManagement } from './components/WithdrawalManagement';
import { LoanManagement } from './components/LoanManagement';
import { GuarantorManagement } from './components/GuarantorManagement';
import { SharesManagement } from './components/SharesManagement';
import { AccountingFinance } from './components/AccountingFinance';
import { MoMoIntegration } from './components/MoMoIntegration';
import { SMSNotification } from './components/SMSNotification';
import { SecurityAudit } from './components/SecurityAudit';

import { 
  Users, CreditCard, Landmark, TrendingUp, DollarSign, 
  MessageSquare, ShieldCheck, Sun, Moon, Menu, Landmark as BankIcon, 
  ArrowUpRight, ArrowDownRight, UserCheck, ShieldAlert
} from 'lucide-react';

function App() {
  // Theme & Layout State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active Role and Navigation Tab State
  const [userRole, setUserRole] = useState<string>('Super Admin');
  const [selectedTab, setSelectedTab] = useState<string>('dashboard');

  // Database States
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [coa, setCOA] = useState<AccountCOA[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [momoTransactions, setMomoTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [smsWallet, setSmsWallet] = useState<number>(0);

  // Initialize DB and fetch local state
  useEffect(() => {
    mockDb.initialize();
    refreshLocalState();
  }, []);

  const refreshLocalState = () => {
    setCongregations(mockDb.getCongregations());
    setMembers(mockDb.getMembers());
    setBeneficiaries(mockDb.getBeneficiaries());
    setTransactions(mockDb.getTransactions());
    setLoans(mockDb.getLoans());
    setGuarantors(mockDb.getGuarantors());
    setTemplates(mockDb.getSMSTemplates());
    setSmsLogs(mockDb.getSMSLogs());
    setAuditLogs(mockDb.getAuditLogs());
    setCOA(mockDb.getCOA());
    setJournalEntries(mockDb.getJournalEntries());
    setMomoTransactions(mockDb.getMoMoTransactions());
    setSmsWallet(mockDb.getSMSWallet());
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // 1. Congregation mutations
  const handleSaveCongregation = (name: string, id?: string) => {
    mockDb.saveCongregation(name, id, { role: userRole, name: `${userRole} (Admin)` });
    refreshLocalState();
  };

  const handleDeleteCongregation = (id: string) => {
    mockDb.deleteCongregation(id, { role: userRole, name: `${userRole} (Admin)` });
    refreshLocalState();
  };

  // 2. Members mutations
  const handleAddMember = (
    memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>,
    beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[]
  ) => {
    mockDb.saveMember(memberData, beneficiariesData, { role: userRole, name: `${userRole} (Admin)` });
    refreshLocalState();
  };

  const handleEditMember = (
    id: string,
    memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>,
    beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[]
  ) => {
    mockDb.editMember(id, memberData, beneficiariesData, { role: userRole, name: `${userRole} (Admin)` });
    refreshLocalState();
  };

  // 3. Transaction mutations (deposit, withdrawal, share_purchase)
  const handlePostTransaction = (txData: { member_id: string; type: 'deposit' | 'withdrawal' | 'share_purchase'; amount: number; description: string; reference?: string; notes?: string }) => {
    mockDb.postTransaction(txData, { role: userRole, name: `${userRole} Operator` });
    refreshLocalState();
  };

  // 4. Loans mutations
  const handleApplyLoan = (loanData: { member_id: string; member_name: string; principal: number; interest_rate: number; term_months: number; purpose: string; collateral: string }) => {
    mockDb.applyForLoan(loanData, { role: userRole, name: `${userRole} User` });
    refreshLocalState();
  };

  const handleUpdateLoanStatus = (id: string, status: 'approved' | 'rejected' | 'disbursed') => {
    mockDb.updateLoanStatus(id, status, { role: userRole, name: `${userRole} Approver` });
    refreshLocalState();
  };

  const handleRepayLoan = (id: string, amount: number) => {
    mockDb.repayLoan(id, amount, { role: userRole, name: `${userRole} User` });
    refreshLocalState();
  };

  // 5. Guarantor mutations
  const handleAddGuarantor = (guarantorData: { loan_id: string; member_id?: string; full_name: string; phone_number: string; relationship: string; amount: number }) => {
    mockDb.saveGuarantor(guarantorData, { role: userRole, name: `${userRole} Operator` });
    refreshLocalState();
  };

  // 6. Shares & Dividends mutations
  const handleDistributeDividends = (percentage: number) => {
    mockDb.distributeDividends(percentage, { role: userRole, name: `${userRole} Accountant` });
    refreshLocalState();
  };

  // 7. Journal posting mutations
  const handlePostJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    mockDb.postJournalVoucher(entry, { role: userRole, name: `${userRole} Accountant` });
    refreshLocalState();
  };

  const handleCreateMoMo = (tx: { direction: 'collection' | 'payout'; network: string; member_id?: string; amount: number; phone_number: string; purpose: string; reference: string }) => {
    mockDb.createMoMoTransaction({
      type: tx.direction,
      network: tx.network,
      member_id: tx.member_id,
      amount: tx.amount,
      phone_number: tx.phone_number,
      purpose: tx.purpose,
      reference: tx.reference
    }, { role: userRole, name: `${userRole} Operator` });
    refreshLocalState();
  };

  // 9. SMS notifications mutations
  const handleUpdateTemplate = (type: string, content: string) => {
    mockDb.saveSMSTemplate(type, content, { role: userRole, name: `${userRole} Operator` });
    refreshLocalState();
  };

  const handleUpdateSettings = (settings: any) => {
    mockDb.saveSMSSettings(settings, { role: userRole, name: `${userRole} Operator` });
    refreshLocalState();
  };

  const handleTopUpSMSWallet = (amount: number) => {
    mockDb.topUpSMSWallet(amount, { role: userRole, name: `${userRole} Operator` });
    refreshLocalState();
  };

  // 10. Database reset
  const handleResetDb = () => {
    mockDb.resetDatabase();
    refreshLocalState();
  };

  // Access Control Helpers
  const canAccessTab = (tab: string): boolean => {
    if (userRole === 'Super Admin' || userRole === 'Administrator') return true;
    
    switch (tab) {
      case 'dashboard':
      case 'congregations':
      case 'members':
      case 'deposits':
      case 'withdrawals':
      case 'loans':
      case 'guarantors':
      case 'shares':
        return true;
      case 'accounting':
        return userRole === 'Accountant';
      case 'momo':
        return userRole === 'Accountant' || userRole === 'Collection Officer';
      case 'sms':
        return userRole === 'Accountant' || userRole === 'Administrator' || userRole === 'Super Admin';
      case 'audit':
        return false; // locked to Admins
      default:
        return false;
    }
  };

  const handleTabClick = (tab: string) => {
    if (canAccessTab(tab)) {
      setSelectedTab(tab);
      setSidebarOpen(false);
    }
  };

  const roles = ['Super Admin', 'Administrator', 'Accountant', 'Loan Officer', 'Collection Officer', 'Member'];

  return (
    <div className="app-container">
      
      {/* Mobile Shell Controls */}
      <div style={{ position: 'fixed', top: 15, left: 15, zIndex: 150, display: 'flex', gap: 10 }}>
        <button className="menu-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={20} />
        </button>
      </div>

      {/* Main Navigation Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">MS</div>
          <div className="sidebar-logo-text">
            MUSTARD SEED
            <span className="sidebar-logo-sub">WELFARE FUND</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <div 
            className={`sidebar-item ${selectedTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            <BankIcon size={18} /> Dashboard
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'congregations' ? 'active' : ''}`}
            onClick={() => handleTabClick('congregations')}
          >
            <UserCheck size={18} /> Congregations
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'members' ? 'active' : ''}`}
            onClick={() => handleTabClick('members')}
          >
            <Users size={18} /> Members
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'deposits' ? 'active' : ''}`}
            onClick={() => handleTabClick('deposits')}
          >
            <ArrowUpRight size={18} /> Deposits
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'withdrawals' ? 'active' : ''}`}
            onClick={() => handleTabClick('withdrawals')}
          >
            <ArrowDownRight size={18} /> Withdrawals
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'loans' ? 'active' : ''}`}
            onClick={() => handleTabClick('loans')}
          >
            <Landmark size={18} /> Loans
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'guarantors' ? 'active' : ''}`}
            onClick={() => handleTabClick('guarantors')}
          >
            <ShieldAlert size={18} /> Guarantors
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'shares' ? 'active' : ''}`}
            onClick={() => handleTabClick('shares')}
          >
            <TrendingUp size={18} /> Shares & Dividends
          </div>

          {canAccessTab('momo') && (
            <div 
              className={`sidebar-item ${selectedTab === 'momo' ? 'active' : ''}`}
              onClick={() => handleTabClick('momo')}
            >
              <CreditCard size={18} /> Mobile Money
            </div>
          )}

          {canAccessTab('accounting') && (
            <div 
              className={`sidebar-item ${selectedTab === 'accounting' ? 'active' : ''}`}
              onClick={() => handleTabClick('accounting')}
            >
              <DollarSign size={18} /> Chart of Accounts
            </div>
          )}

          {canAccessTab('sms') && (
            <div 
              className={`sidebar-item ${selectedTab === 'sms' ? 'active' : ''}`}
              onClick={() => handleTabClick('sms')}
            >
              <MessageSquare size={18} /> SMS Notifications
            </div>
          )}

          {(userRole === 'Super Admin' || userRole === 'Administrator') && (
            <div 
              className={`sidebar-item ${selectedTab === 'audit' ? 'active' : ''}`}
              onClick={() => handleTabClick('audit')}
            >
              <ShieldCheck size={18} /> Compliance & Audits
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-badge-avatar">
              {userRole[0]}
            </div>
            <div className="user-badge-info">
              <span className="user-badge-name">Mustard Seed Staff</span>
              <span className="user-badge-role">{userRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="main-content">
        
        {/* Top Header */}
        <div className="top-header">
          <div className="header-title-section">
            <h1 style={{ fontSize: '24px', margin: 0 }}>Mustard Seed Welfare Fund</h1>
            <p className="m-0" style={{ fontSize: '12px' }}>SEGE DISTRICT CREDIT UNION MANAGEMENT SYSTEM</p>
          </div>

          <div className="header-controls">
            <div className="flex align-center gap-8" style={{ borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>DEMO ROLE:</span>
              <select 
                value={userRole} 
                onChange={(e) => {
                  setUserRole(e.target.value);
                  setSelectedTab('dashboard');
                }}
                style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <button className="btn btn-outline btn-icon-only" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {/* Tab Routing */}
        <div className="flex w-full">
          {selectedTab === 'dashboard' && (
            <Dashboard
              members={members}
              loans={loans}
              transactions={transactions}
              smsLogs={smsLogs}
              smsWallet={smsWallet}
              coa={coa}
              onNavigate={(tab) => {
                if (canAccessTab(tab)) setSelectedTab(tab);
              }}
            />
          )}

          {selectedTab === 'congregations' && (
            <CongregationManagement
              congregations={congregations}
              onSaveCongregation={handleSaveCongregation}
              onDeleteCongregation={handleDeleteCongregation}
              userRole={userRole}
            />
          )}

          {selectedTab === 'members' && (
            <MemberManagement
              members={members}
              beneficiaries={beneficiaries}
              congregations={congregations}
              onAddMember={handleAddMember}
              onEditMember={handleEditMember}
              userRole={userRole}
            />
          )}

          {selectedTab === 'deposits' && (
            <SavingsManagement
              members={members}
              onPostTransaction={handlePostTransaction}
              userRole={userRole}
            />
          )}

          {selectedTab === 'withdrawals' && (
            <WithdrawalManagement
              members={members}
              onPostTransaction={handlePostTransaction}
              userRole={userRole}
            />
          )}

          {selectedTab === 'loans' && (
            <LoanManagement
              members={members}
              loans={loans}
              onApplyLoan={handleApplyLoan}
              onUpdateStatus={handleUpdateLoanStatus}
              onRepayLoan={handleRepayLoan}
              userRole={userRole}
            />
          )}

          {selectedTab === 'guarantors' && (
            <GuarantorManagement
              members={members}
              loans={loans}
              guarantors={guarantors}
              onAddGuarantor={handleAddGuarantor}
              userRole={userRole}
            />
          )}

          {selectedTab === 'shares' && (
            <SharesManagement
              members={members}
              transactions={transactions}
              onPostTransaction={handlePostTransaction}
              onDistributeDividends={handleDistributeDividends}
              userRole={userRole}
            />
          )}

          {selectedTab === 'momo' && canAccessTab('momo') && (
            <MoMoIntegration
              members={members}
              momoTransactions={momoTransactions}
              onCreateTransaction={handleCreateMoMo}
              userRole={userRole}
            />
          )}

          {selectedTab === 'accounting' && canAccessTab('accounting') && (
            <AccountingFinance
              members={members}
              coa={coa}
              journalEntries={journalEntries}
              onPostJournalEntry={handlePostJournalEntry}
              userRole={userRole}
            />
          )}

          {selectedTab === 'sms' && canAccessTab('sms') && (
            <SMSNotification
              templates={templates}
              smsLogs={smsLogs}
              smsWallet={smsWallet}
              onUpdateTemplate={handleUpdateTemplate}
              onUpdateSettings={handleUpdateSettings}
              onTopUpWallet={handleTopUpSMSWallet}
              userRole={userRole}
            />
          )}

          {selectedTab === 'audit' && (userRole === 'Super Admin' || userRole === 'Administrator') && (
            <SecurityAudit
              auditLogs={auditLogs}
              onResetDb={handleResetDb}
              userRole={userRole}
            />
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
