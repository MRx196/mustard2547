import { useState, useEffect } from 'react';
import { mockDb } from './db/mockDb';
import type { Member, Beneficiary, Transaction, Loan, SMSLog, SMSTemplate, AuditLog, AccountCOA, JournalEntry, MobileMoneyTransaction } from './db/supabase';

// Components
import { Dashboard } from './components/Dashboard';
import { MemberManagement } from './components/MemberManagement';
import { SavingsManagement } from './components/SavingsManagement';
import { LoanManagement } from './components/LoanManagement';
import { SharesManagement } from './components/SharesManagement';
import { AccountingFinance } from './components/AccountingFinance';
import { MoMoIntegration } from './components/MoMoIntegration';
import { SMSNotification } from './components/SMSNotification';
import { SecurityAudit } from './components/SecurityAudit';

import { 
  Users, PiggyBank, Landmark, TrendingUp, DollarSign, 
  MessageSquare, ShieldCheck, Sun, Moon, Menu, Landmark as BankIcon
} from 'lucide-react';

function App() {
  // Theme & Layout State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active Role and Navigation Tab State
  const [userRole, setUserRole] = useState<string>('Super Admin');
  const [selectedTab, setSelectedTab] = useState<string>('dashboard');

  // Database States
  const [members, setMembers] = useState<Member[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
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
    setMembers(mockDb.getMembers());
    setBeneficiaries(mockDb.getBeneficiaries());
    setTransactions(mockDb.getTransactions());
    setLoans(mockDb.getLoans());
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

  // 1. Members mutations
  const handleAddMember = (
    memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>,
    beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[]
  ) => {
    mockDb.saveMember(memberData, beneficiariesData, { role: userRole, name: `${userRole} (Admin)` });
    refreshLocalState();
  };

  // 2. Transaction mutations
  const handlePostTransaction = (txData: { member_id: string; type: 'deposit' | 'withdrawal' | 'share_purchase'; amount: number; description: string }) => {
    mockDb.postTransaction(txData, { role: userRole, name: `${userRole} User` });
    refreshLocalState();
  };

  // 3. Loans mutations
  const handleApplyLoan = (loanData: Omit<Loan, 'id' | 'status' | 'monthly_installment' | 'outstanding_balance' | 'created_at'>) => {
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

  // 4. Shares & Dividends mutations
  const handleDistributeDividends = (percentage: number) => {
    mockDb.distributeDividends(percentage, { role: userRole, name: `${userRole} Accountant` });
    refreshLocalState();
  };

  // 5. Journal posting mutations
  const handlePostJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    mockDb.postJournalVoucher(entry, { role: userRole, name: `${userRole} Accountant` });
    refreshLocalState();
  };

  // 6. MoMo mutations
  const handleCreateMoMo = (tx: Omit<MobileMoneyTransaction, 'id' | 'status' | 'timestamp' | 'reference'>) => {
    const res = mockDb.createMoMoTransaction(tx);
    refreshLocalState();
    return res;
  };

  const handleProcessMoMo = (id: string, success: boolean) => {
    mockDb.processMoMoTransaction(id, success, { role: userRole, name: `${userRole} Operator` });
    refreshLocalState();
  };

  // 7. SMS notifications mutations
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

  // 8. Database reset
  const handleResetDb = () => {
    mockDb.resetDatabase();
    refreshLocalState();
  };

  // Access Control Helpers
  const canAccessTab = (tab: string): boolean => {
    if (userRole === 'Super Admin' || userRole === 'Administrator') return true;
    
    switch (tab) {
      case 'dashboard':
        return true;
      case 'members':
        return true; // All roles can see members, but Member role gets read-only detail views
      case 'savings':
        return true; // Members can see statements, officers can post
      case 'loans':
        return true;
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
      
      {/* 1. Mobile Shell Controls */}
      <div style={{ position: 'fixed', top: 15, left: 15, zIndex: 150, display: 'flex', gap: 10 }}>
        <button className="menu-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={20} />
        </button>
      </div>

      {/* 2. Main Navigation Sidebar */}
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
            className={`sidebar-item ${selectedTab === 'members' ? 'active' : ''}`}
            onClick={() => handleTabClick('members')}
          >
            <Users size={18} /> Member Directory
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'savings' ? 'active' : ''}`}
            onClick={() => handleTabClick('savings')}
          >
            <PiggyBank size={18} /> Savings & Deposits
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'loans' ? 'active' : ''}`}
            onClick={() => handleTabClick('loans')}
          >
            <Landmark size={18} /> Loans & Guarantors
          </div>

          <div 
            className={`sidebar-item ${selectedTab === 'shares' ? 'active' : ''}`}
            onClick={() => handleTabClick('shares')}
          >
            <TrendingUp size={18} /> Share Capital
          </div>

          {canAccessTab('accounting') && (
            <div 
              className={`sidebar-item ${selectedTab === 'accounting' ? 'active' : ''}`}
              onClick={() => handleTabClick('accounting')}
            >
              <DollarSign size={18} /> Accounting ledger
            </div>
          )}

          {canAccessTab('momo') && (
            <div 
              className={`sidebar-item ${selectedTab === 'momo' ? 'active' : ''}`}
              onClick={() => handleTabClick('momo')}
            >
              <DollarSign size={18} /> MoMo integration
            </div>
          )}

          {canAccessTab('sms') && (
            <div 
              className={`sidebar-item ${selectedTab === 'sms' ? 'active' : ''}`}
              onClick={() => handleTabClick('sms')}
            >
              <MessageSquare size={18} /> SMS notifications
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

        {/* Sidebar Footer detailing Active User Profile */}
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

      {/* 3. Main Dashboard Workspace Area */}
      <div className="main-content">
        
        {/* Top Header: System Actions & Settings */}
        <div className="top-header">
          <div className="header-title-section">
            <h1 style={{ fontSize: '24px', margin: 0 }}>Mustard Seed Welfare Fund</h1>
            <p className="m-0" style={{ fontSize: '12px' }}>SEGE DISTRICT CREDIT UNION MANAGEMENT SYSTEM</p>
          </div>

          <div className="header-controls">
            {/* Quick Switch Demo Bar */}
            <div className="flex align-center gap-8" style={{ borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>DEMO ROLE:</span>
              <select 
                value={userRole} 
                onChange={(e) => {
                  setUserRole(e.target.value);
                  // fallback to dashboard if role lost access
                  setSelectedTab('dashboard');
                }}
                style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button className="btn btn-outline btn-icon-only" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {/* 4. Active Tab Component Routing */}
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

          {selectedTab === 'members' && (
            <MemberManagement
              members={members}
              beneficiaries={beneficiaries}
              onAddMember={handleAddMember}
              userRole={userRole}
            />
          )}

          {selectedTab === 'savings' && (
            <SavingsManagement
              members={members}
              transactions={transactions}
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

          {selectedTab === 'shares' && (
            <SharesManagement
              members={members}
              transactions={transactions}
              onPostTransaction={handlePostTransaction}
              onDistributeDividends={handleDistributeDividends}
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

          {selectedTab === 'momo' && canAccessTab('momo') && (
            <MoMoIntegration
              members={members}
              momoTransactions={momoTransactions}
              onCreateTransaction={handleCreateMoMo}
              onProcessTransaction={handleProcessMoMo}
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
