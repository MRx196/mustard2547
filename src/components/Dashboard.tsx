import React from 'react';
import type { Member, Loan, Transaction, SMSLog, AccountCOA } from '../db/supabase';
import { Users, Landmark, PiggyBank, Receipt, MessageSquare, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface DashboardProps {
  members: Member[];
  loans: Loan[];
  transactions: Transaction[];
  smsLogs: SMSLog[];
  smsWallet: number;
  coa: AccountCOA[];
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  members,
  loans,
  transactions,
  smsLogs,
  smsWallet,
  coa,
  onNavigate
}) => {
  // 1. Stats Calculations
  const totalMembers = members.length;

  const totalSavings = transactions
    .filter(t => t.type === 'deposit' || t.type === 'dividend')
    .reduce((sum, t) => sum + t.amount, 0) - 
    transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);

  const totalShares = transactions
    .filter(t => t.type === 'share_purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const outstandingLoans = loans
    .filter(l => l.status === 'disbursed' || l.status === 'active')
    .reduce((sum, l) => sum + l.outstanding_balance, 0);

  // Collections this month (July 2026 for simulation)
  const currentMonthStr = '2026-07';
  const monthlyCollections = transactions
    .filter(t => (t.type === 'deposit' || t.type === 'loan_repayment' || t.type === 'share_purchase') && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  // Cash Balance = Cash in Hand (1000) + Cash at Bank (1100)
  const cashInHand = coa.find(a => a.account_no === 1000)?.balance || 0;
  const cashAtBank = coa.find(a => a.account_no === 1100)?.balance || 0;
  const totalCashBalance = cashInHand + cashAtBank;

  // SMS Balance
  const smsBalance = smsWallet;

  // SMS Sent Today
  const todayStr = new Date().toISOString().split('T')[0]; // Current mock date
  const smsSentToday = smsLogs.filter(s => s.timestamp.startsWith(todayStr)).length;

  // Recent Transactions (limit 5)
  const recentTransactions = [...transactions].slice(0, 5);

  // SVG Chart Data - Monthly Savings & Loan distributions (Mock for Jan-Jul)
  const monthlyTrendData = [
    { name: 'Jan', savings: 25000, loans: 15000 },
    { name: 'Feb', savings: 32000, loans: 22000 },
    { name: 'Mar', savings: 41000, loans: 28000 },
    { name: 'Apr', savings: 48000, loans: 31000 },
    { name: 'May', savings: 55000, loans: 32000 },
    { name: 'Jun', savings: 60000, loans: 34000 },
    { name: 'Jul', savings: totalSavings, loans: outstandingLoans }
  ];

  // Find max value to scale chart
  const maxChartVal = Math.max(...monthlyTrendData.flatMap(d => [d.savings, d.loans])) * 1.15;

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* 1. Statistics Row */}
      <div className="grid-stats">
        {/* Total Members */}
        <div className="stat-card" onClick={() => onNavigate('members')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Members</span>
            <span className="stat-value">{totalMembers}</span>
          </div>
        </div>

        {/* Total Savings */}
        <div className="stat-card" onClick={() => onNavigate('savings')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper">
            <PiggyBank size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Savings</span>
            <span className="stat-value">GHS {totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Total Shares */}
        <div className="stat-card gold-border" onClick={() => onNavigate('shares')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper">
            <TrendingUp size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Shares</span>
            <span className="stat-value">GHS {totalShares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Outstanding Loans */}
        <div className="stat-card" onClick={() => onNavigate('loans')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(217, 56, 56, 0.1)', color: 'var(--danger)' }}>
            <Landmark size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Outstanding Loans</span>
            <span className="stat-value">GHS {outstandingLoans.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Monthly Collections */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Monthly Collections</span>
            <span className="stat-value">GHS {monthlyCollections.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="stat-card gold-border" onClick={() => onNavigate('accounting')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper">
            <CreditCard size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Cash Balance</span>
            <span className="stat-value">GHS {totalCashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* SMS Balance */}
        <div className="stat-card" onClick={() => onNavigate('sms')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>
            <MessageSquare size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">SMS Wallet Credits</span>
            <span className="stat-value">{smsBalance} SMS</span>
          </div>
        </div>

        {/* SMS Sent Today */}
        <div className="stat-card gold-border" onClick={() => onNavigate('sms')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper">
            <Receipt size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">SMS Sent Today</span>
            <span className="stat-value">{smsSentToday}</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Graphs and Recent Activity */}
      <div className="grid-2col">
        {/* Trend Chart */}
        <div className="card">
          <div className="card-title">
            <span>Savings vs. Loans Trends (GHS)</span>
            <div className="flex gap-16" style={{ fontSize: '12px' }}>
              <span className="flex align-center gap-8"><span style={{ width: 12, height: 12, background: 'var(--primary)', borderRadius: '2px', display: 'inline-block' }}></span> Savings</span>
              <span className="flex align-center gap-8"><span style={{ width: 12, height: 12, background: 'var(--secondary)', borderRadius: '2px', display: 'inline-block' }}></span> Outstanding Loans</span>
            </div>
          </div>
          
          <div className="simple-bar-chart">
            {monthlyTrendData.map((d, index) => {
              const savingsPct = (d.savings / maxChartVal) * 100;
              const loansPct = (d.loans / maxChartVal) * 100;
              
              return (
                <div key={index} className="chart-bar-container">
                  <div className="flex gap-8" style={{ alignItems: 'flex-end', height: '150px' }}>
                    {/* Savings Bar */}
                    <div 
                      className="chart-bar-fill" 
                      style={{ height: `${savingsPct}%` }}
                      title={`Savings: GHS ${d.savings}`}
                    >
                      <span className="chart-bar-val">GHS {(d.savings/1000).toFixed(0)}k</span>
                    </div>
                    {/* Loans Bar */}
                    <div 
                      className="chart-bar-fill secondary-bar" 
                      style={{ height: `${loansPct}%` }}
                      title={`Loans: GHS ${d.loans}`}
                    >
                      <span className="chart-bar-val">GHS {(d.loans/1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <span className="chart-bar-label">{d.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="card">
          <div className="card-title">
            <span>Recent Activity Feed</span>
            <ArrowUpRight size={18} className="card-title-icon" />
          </div>
          
          <div className="flex flex-col gap-16">
            {recentTransactions.map((t, idx) => {
              const isPositive = t.type === 'deposit' || t.type === 'share_purchase' || t.type === 'loan_repayment' || t.type === 'dividend';
              
              return (
                <div key={idx} className="flex align-center justify-between p-16" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div className="flex align-center gap-8">
                    {isPositive ? (
                      <ArrowUpRight className="text-success" size={20} />
                    ) : (
                      <ArrowDownRight className="text-danger" size={20} />
                    )}
                    <div className="flex flex-col">
                      <span className="bold" style={{ fontSize: '13px' }}>{t.description}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {t.account_number} • {new Date(t.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : '-'} GHS {t.amount.toFixed(2)}
                  </span>
                </div>
              );
            })}

            {recentTransactions.length === 0 && (
              <div className="text-center p-16 text-muted">No recent transactions recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Alerts & Information Section */}
      <div className="grid-3col">
        {/* Pending Loans Section */}
        <div className="card">
          <h3 className="card-title">
            <span>Loans Awaiting Action</span>
            <span className="badge badge-warning">
              {loans.filter(l => l.status === 'pending').length}
            </span>
          </h3>
          <div className="flex flex-col gap-8">
            {loans.filter(l => l.status === 'pending').slice(0, 3).map((l, idx) => (
              <div key={idx} className="flex justify-between align-center p-8" style={{ borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                <div>
                  <div className="bold">{l.member_name}</div>
                  <div className="text-muted">GHS {l.principal.toLocaleString()} ({l.term_months} mos)</div>
                </div>
                <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => onNavigate('loans')}>
                  Review
                </button>
              </div>
            ))}
            {loans.filter(l => l.status === 'pending').length === 0 && (
              <p className="text-center text-muted p-16" style={{ fontSize: '13px' }}>All loans processed.</p>
            )}
          </div>
        </div>

        {/* High Risk Arrears Section */}
        <div className="card">
          <h3 className="card-title">
            <span>Overdue Reminders</span>
            <span className="badge badge-danger">
              {loans.filter(l => l.status === 'disbursed' && l.outstanding_balance > 0).length} Active
            </span>
          </h3>
          <div className="flex flex-col gap-8">
            {loans.filter(l => l.status === 'disbursed' && l.outstanding_balance > 0).slice(0, 3).map((l, idx) => (
              <div key={idx} className="flex justify-between align-center p-8" style={{ borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                <div>
                  <div className="bold">{l.member_name}</div>
                  <div className="text-danger">GHS {l.outstanding_balance.toLocaleString()} outstanding</div>
                </div>
                <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => onNavigate('sms')}>
                  SMS Notice
                </button>
              </div>
            ))}
            {loans.filter(l => l.status === 'disbursed' && l.outstanding_balance > 0).length === 0 && (
              <p className="text-center text-muted p-16" style={{ fontSize: '13px' }}>No active loans with outstanding balances.</p>
            )}
          </div>
        </div>

        {/* Member Congregations */}
        <div className="card">
          <h3 className="card-title">
            <span>Member Distribution</span>
          </h3>
          <div className="flex flex-col gap-8" style={{ fontSize: '13px' }}>
            <div className="flex justify-between align-center p-8" style={{ borderBottom: '1px solid var(--border)' }}>
              <span>Central Methodist</span>
              <span className="bold">{members.filter(m => m.congregation.includes('Methodist')).length} members</span>
            </div>
            <div className="flex justify-between align-center p-8" style={{ borderBottom: '1px solid var(--border)' }}>
              <span>Presbyterian</span>
              <span className="bold">{members.filter(m => m.congregation.includes('Presbyterian')).length} members</span>
            </div>
            <div className="flex justify-between align-center p-8" style={{ borderBottom: '1px solid var(--border)' }}>
              <span>Assembly of God</span>
              <span className="bold">{members.filter(m => m.congregation.includes('Assembly')).length} members</span>
            </div>
            <div className="flex justify-between align-center p-8">
              <span>Other Churches</span>
              <span className="bold">{members.filter(m => !m.congregation.includes('Methodist') && !m.congregation.includes('Presbyterian') && !m.congregation.includes('Assembly')).length} members</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
