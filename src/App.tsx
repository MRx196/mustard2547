import { useState, useEffect } from 'react';
import { mockDb } from './db/mockDb';
import type { Member, Beneficiary, Transaction, Loan, SMSLog, SMSTemplate, AuditLog, AccountCOA, JournalEntry, MobileMoneyTransaction, Congregation, Guarantor, StaffUser } from './db/supabase';

// Components
import { Login } from './components/Login';
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
import { UserRolesManagement } from './components/UserRolesManagement';
import { SecurityAudit } from './components/SecurityAudit';

import { 
  Users, CreditCard, Landmark, TrendingUp, DollarSign, 
  MessageSquare, ShieldCheck, Sun, Moon, Menu, Landmark as BankIcon, 
  ArrowUpRight, ArrowDownRight, UserCheck, ShieldAlert, Key, LogOut
} from 'lucide-react';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mandatory Authentication Session State
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
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
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [coa, setCOA] = useState<AccountCOA[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [momoTransactions, setMomoTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [smsWallet, setSmsWallet] = useState<number>(0);

  // Initialize DB and fetch local session
  useEffect(() => {
    mockDb.initialize();
    
    // Recover user session
    const stored = localStorage.getItem('current_user');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
    
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
    setStaffUsers(mockDb.getStaffUsers());
    setAuditLogs(mockDb.getAuditLogs());
    setCOA(mockDb.getCOA());
    setJournalEntries(mockDb.getJournalEntries());
    setMomoTransactions(mockDb.getMoMoTransactions());
    setSmsWallet(mockDb.getSMSWallet());
  };

  const getOperatorDetails = () => {
    if (!currentUser) return { name: 'System', email: 'system@mustardseed.org', role: 'Super Administrator' };
    return {
      name: currentUser.full_name,
      email: currentUser.email,
      role: currentUser.role
    };
  };

  // Login/Logout hooks
  const handleLoginSuccess = (profile: StaffUser) => {
    localStorage.setItem('current_user', JSON.stringify(profile));
    setCurrentUser(profile);
    setSelectedTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    setCurrentUser(null);
    setSelectedTab('dashboard');
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // 1. Congregation mutations
  const handleSaveCongregation = (name: string, id?: string) => {
    mockDb.saveCongregation(name, id, getOperatorDetails());
    refreshLocalState();
  };

  const handleDeleteCongregation = (id: string) => {
    mockDb.deleteCongregation(id, getOperatorDetails());
    refreshLocalState();
  };

  // 2. Members mutations
  const handleAddMember = (
    memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>,
    beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[]
  ) => {
    mockDb.saveMember(memberData, beneficiariesData, getOperatorDetails());
    refreshLocalState();
  };

  const handleEditMember = (
    id: string,
    memberData: Omit<Member, 'id' | 'account_number' | 'created_at'>,
    beneficiariesData: Omit<Beneficiary, 'id' | 'member_id'>[]
  ) => {
    mockDb.editMember(id, memberData, beneficiariesData, getOperatorDetails());
    refreshLocalState();
  };

  // 3. Transaction mutations
  const handlePostTransaction = (txData: { member_id: string; type: 'deposit' | 'withdrawal' | 'share_purchase'; amount: number; description: string; reference?: string; notes?: string }) => {
    mockDb.postTransaction(txData, getOperatorDetails());
    refreshLocalState();
  };

  // 4. Loans mutations
  const handleApplyLoan = (loanData: { member_id: string; member_name: string; principal: number; interest_rate: number; term_months: number; purpose: string; collateral: string }) => {
    mockDb.applyForLoan(loanData, getOperatorDetails());
    refreshLocalState();
  };

  const handleUpdateLoanStatus = (id: string, status: 'approved' | 'rejected' | 'disbursed') => {
    mockDb.updateLoanStatus(id, status, getOperatorDetails());
    refreshLocalState();
  };

  const handleRepayLoan = (id: string, amount: number) => {
    mockDb.repayLoan(id, amount, getOperatorDetails());
    refreshLocalState();
  };

  // 5. Guarantor mutations
  const handleAddGuarantor = (guarantorData: { loan_id: string; member_id?: string; full_name: string; phone_number: string; relationship: string; amount: number }) => {
    mockDb.saveGuarantor(guarantorData, getOperatorDetails());
    refreshLocalState();
  };

  // 6. Shares & Dividends mutations
  const handleDistributeDividends = (percentage: number) => {
    mockDb.distributeDividends(percentage, getOperatorDetails());
    refreshLocalState();
  };

  // 7. Journal posting mutations
  const handlePostJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    mockDb.postJournalVoucher(entry, getOperatorDetails());
    refreshLocalState();
  };

  // 8. MoMo mutations
  const handleCreateMoMo = (tx: { direction: 'collection' | 'payout'; network: string; member_id?: string; amount: number; phone_number: string; purpose: string; reference: string }) => {
    mockDb.createMoMoTransaction({
      type: tx.direction,
      network: tx.network,
      member_id: tx.member_id,
      amount: tx.amount,
      phone_number: tx.phone_number,
      purpose: tx.purpose,
      reference: tx.reference
    }, getOperatorDetails());
    refreshLocalState();
  };

  // 9. SMS mutations
  const handleUpdateTemplate = (type: string, content: string) => {
    mockDb.saveSMSTemplate({ name: type + ' Template', event: type, body: content, recipient_type: 'Member' }, undefined, getOperatorDetails());
    refreshLocalState();
  };

  const handleUpdateSettings = (settings: any) => {
    mockDb.saveSMSSettings(settings, getOperatorDetails());
    refreshLocalState();
  };

  const handleTopUpSMSWallet = (amount: number) => {
    mockDb.topUpSMSWallet(amount, getOperatorDetails());
    refreshLocalState();
  };

  // 10. Staff roles assignment
  const handleAssignRole = (profile: { email: string; role: string; full_name?: string; username?: string; phone_number?: string; status?: 'Active' | 'Inactive'; auth_user_id?: string }) => {
    mockDb.assignUserRole(profile, getOperatorDetails());
    refreshLocalState();
  };

  const handleRevokeRole = (email: string) => {
    mockDb.revokeUserRole(email, getOperatorDetails());
    refreshLocalState();
  };

  // 11. Database reset
  const handleResetDb = () => {
    mockDb.resetDatabase();
    refreshLocalState();
  };

  // Access Control authorization verification
  const canAccessTab = (tab: string): boolean => {
    if (!currentUser) return false;
    
    // Super Administrator and Administrator have wide access
    if (currentUser.role === 'Super Administrator' || currentUser.role === 'Super Admin') return true;
    if (currentUser.role === 'Administrator') {
      return tab !== 'staff' && tab !== 'audit'; // cannot reset db or manage user roles
    }
    if (currentUser.role === 'Auditor') {
      return tab !== 'staff'; // read-only access to all modules except user management
    }

    switch (tab) {
      case 'dashboard':
        return true;
      case 'congregations':
      case 'members':
        return currentUser.role === 'Accountant';
      case 'deposits':
      case 'withdrawals':
        return currentUser.role === 'Accountant' || currentUser.role === 'Collection Officer' || currentUser.role === 'Collections Officer';
      case 'loans':
      case 'guarantors':
        return currentUser.role === 'Loan Officer';
      case 'shares':
        return currentUser.role === 'Accountant';
      case 'momo':
        return currentUser.role === 'Accountant' || currentUser.role === 'Collection Officer' || currentUser.role === 'Collections Officer';
      case 'accounting':
        return currentUser.role === 'Accountant';
      case 'sms':
        return currentUser.role === 'Accountant';
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

  // Root authentication guard
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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

          {canAccessTab('congregations') && (
            <div 
              className={`sidebar-item ${selectedTab === 'congregations' ? 'active' : ''}`}
              onClick={() => handleTabClick('congregations')}
            >
              <UserCheck size={18} /> Congregations
            </div>
          )}

          {canAccessTab('members') && (
            <div 
              className={`sidebar-item ${selectedTab === 'members' ? 'active' : ''}`}
              onClick={() => handleTabClick('members')}
            >
              <Users size={18} /> Members
            </div>
          )}

          {canAccessTab('deposits') && (
            <div 
              className={`sidebar-item ${selectedTab === 'deposits' ? 'active' : ''}`}
              onClick={() => handleTabClick('deposits')}
            >
              <ArrowUpRight size={18} /> Deposits
            </div>
          )}

          {canAccessTab('withdrawals') && (
            <div 
              className={`sidebar-item ${selectedTab === 'withdrawals' ? 'active' : ''}`}
              onClick={() => handleTabClick('withdrawals')}
            >
              <ArrowDownRight size={18} /> Withdrawals
            </div>
          )}

          {canAccessTab('loans') && (
            <div 
              className={`sidebar-item ${selectedTab === 'loans' ? 'active' : ''}`}
              onClick={() => handleTabClick('loans')}
            >
              <Landmark size={18} /> Loans
            </div>
          )}

          {canAccessTab('guarantors') && (
            <div 
              className={`sidebar-item ${selectedTab === 'guarantors' ? 'active' : ''}`}
              onClick={() => handleTabClick('guarantors')}
            >
              <ShieldAlert size={18} /> Guarantors
            </div>
          )}

          {canAccessTab('shares') && (
            <div 
              className={`sidebar-item ${selectedTab === 'shares' ? 'active' : ''}`}
              onClick={() => handleTabClick('shares')}
            >
              <TrendingUp size={18} /> Shares & Dividends
            </div>
          )}

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

          {canAccessTab('staff') && (
            <div 
              className={`sidebar-item ${selectedTab === 'staff' ? 'active' : ''}`}
              onClick={() => handleTabClick('staff')}
            >
              <Key size={18} /> Staff User Roles
            </div>
          )}

          {canAccessTab('audit') && (
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
              {currentUser.full_name[0]}
            </div>
            <div className="user-badge-info">
              <span className="user-badge-name">{currentUser.full_name}</span>
              <span className="user-badge-role" style={{ fontSize: '9px' }}>{currentUser.role}</span>
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
              <div style={{ textAlign: 'right' }}>
                <div className="bold" style={{ fontSize: '13px', color: 'var(--text-main)' }}>{currentUser.full_name}</div>
                <div className="text-muted" style={{ fontSize: '10px' }}>{currentUser.role} • {currentUser.email}</div>
              </div>
            </div>

            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleLogout}>
              <LogOut size={14} /> Sign Out
            </button>

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
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'members' && (
            <MemberManagement
              members={members}
              beneficiaries={beneficiaries}
              congregations={congregations}
              onAddMember={handleAddMember}
              onEditMember={handleEditMember}
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'deposits' && (
            <SavingsManagement
              members={members}
              onPostTransaction={handlePostTransaction}
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'withdrawals' && (
            <WithdrawalManagement
              members={members}
              onPostTransaction={handlePostTransaction}
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'loans' && (
            <LoanManagement
              members={members}
              loans={loans}
              onApplyLoan={handleApplyLoan}
              onUpdateStatus={handleUpdateLoanStatus}
              onRepayLoan={handleRepayLoan}
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'guarantors' && (
            <GuarantorManagement
              members={members}
              loans={loans}
              guarantors={guarantors}
              onAddGuarantor={handleAddGuarantor}
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'shares' && (
            <SharesManagement
              members={members}
              transactions={transactions}
              onPostTransaction={handlePostTransaction}
              onDistributeDividends={handleDistributeDividends}
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'momo' && canAccessTab('momo') && (
            <MoMoIntegration
              members={members}
              momoTransactions={momoTransactions}
              onCreateTransaction={handleCreateMoMo}
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'accounting' && canAccessTab('accounting') && (
            <AccountingFinance
              members={members}
              coa={coa}
              journalEntries={journalEntries}
              onPostJournalEntry={handlePostJournalEntry}
              userRole={currentUser.role}
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
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'staff' && (currentUser.role === 'Super Administrator' || currentUser.role === 'Administrator') && (
            <UserRolesManagement
              staffUsers={staffUsers}
              members={members}
              onAssignRole={handleAssignRole}
              onRevokeRole={handleRevokeRole}
              userRole={currentUser.role}
            />
          )}

          {selectedTab === 'audit' && (currentUser.role === 'Super Administrator' || currentUser.role === 'Administrator') && (
            <SecurityAudit
              auditLogs={auditLogs}
              onResetDb={handleResetDb}
              userRole={currentUser.role}
            />
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
