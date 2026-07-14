import React, { useState } from 'react';
import type { Member, AccountCOA, JournalEntry } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { Search, CheckCircle, AlertCircle, ArrowRightLeft } from 'lucide-react';

interface AccountingFinanceProps {
  members: Member[];
  coa: AccountCOA[];
  journalEntries: JournalEntry[];
  onPostJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  userRole: string;
}

export const AccountingFinance: React.FC<AccountingFinanceProps> = ({
  members,
  coa,
  journalEntries,
  onPostJournalEntry,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'coa' | 'journal' | 'trial' | 'member_stmt'>('coa');
  const [searchTerm, setSearchTerm] = useState('');

  // Manual Journal Entry Form State
  const [jeDate, setJeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [jeDescription, setJeDescription] = useState('');
  const [debitAccount, setDebitAccount] = useState<number>(1000);
  const [creditAccount, setCreditAccount] = useState<number>(3000);
  const [jeAmount, setJeAmount] = useState('');
  const [jeReference, setJeReference] = useState('');

  const [selectedMemberId, setSelectedMemberId] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter COA
  const filteredCOA = coa.filter(a =>
    a.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.account_no.toString().includes(searchTerm)
  );

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const amt = Number(jeAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Transaction amount must be a positive number.');
      return;
    }

    if (debitAccount === creditAccount) {
      setErrorMsg('Debit and Credit accounts must be different.');
      return;
    }

    if (!jeDescription.trim()) {
      setErrorMsg('Please enter a description.');
      return;
    }

    try {
      // Validate: Total Debits = Total Credits (since it's a single entry, amt = amt, always balances!)
      onPostJournalEntry({
        description: `${jeDescription.trim()}${jeReference ? ' (Ref: ' + jeReference + ')' : ''}`,
        debits: [{ account_no: debitAccount, amount: amt }],
        credits: [{ account_no: creditAccount, amount: amt }]
      });

      setSuccessMsg('Journal entry successfully posted and ledger balances updated!');
      setJeDescription('');
      setJeAmount('');
      setJeReference('');

      setTimeout(() => setSuccessMsg(''), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Journal posting failed.');
    }
  };

  // Helper calculation for member statements
  const memberTransactions = selectedMemberId ? mockDb.getTransactions(selectedMemberId) : [];
  const selectedMemberObj = members.find(m => m.id === selectedMemberId);

  const getMemberStatementRows = () => {
    let runningBalance = 0;
    const rows = [...memberTransactions].reverse().map(t => {
      const isCredit = t.type === 'deposit' || t.type === 'dividend' || t.type === 'share_purchase';
      const isDebit = t.type === 'withdrawal' || t.type === 'loan_disbursement';
      
      let amountChange = 0;
      if (t.type === 'deposit' || t.type === 'dividend') amountChange = t.amount;
      else if (t.type === 'withdrawal') amountChange = -t.amount;
      else if (t.type === 'share_purchase') amountChange = t.amount;
      else if (t.type === 'loan_repayment') amountChange = -t.amount;

      runningBalance += amountChange;

      return {
        ...t,
        debit: isDebit ? t.amount : 0,
        credit: isCredit ? t.amount : 0,
        balance: runningBalance
      };
    });
    return rows.reverse();
  };

  const statementRows = getMemberStatementRows();
  const isOfficerOrAccountant = userRole === 'Super Admin' || userRole === 'Administrator' || userRole === 'Accountant' || userRole === 'Loan Officer';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Sub tabs */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'coa' ? 'active' : ''}`} onClick={() => setActiveTab('coa')}>
          Chart of Accounts (COA)
        </button>
        {isOfficerOrAccountant && (
          <button className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>
            Journal Entry
          </button>
        )}
        <button className={`tab-btn ${activeTab === 'trial' ? 'active' : ''}`} onClick={() => setActiveTab('trial')}>
          Trial Balance
        </button>
        <button className={`tab-btn ${activeTab === 'member_stmt' ? 'active' : ''}`} onClick={() => setActiveTab('member_stmt')}>
          Member Statement
        </button>
      </div>

      {activeTab === 'coa' && (
        <div className="flex flex-col gap-16">
          <div className="flex justify-between align-center">
            <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search accounts catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
              />
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Account Name</th>
                  <th>Category</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredCOA.map(a => (
                  <tr key={a.account_no}>
                    <td className="bold" style={{ color: 'var(--primary)' }}>{a.account_no}</td>
                    <td className="bold">{a.account_name}</td>
                    <td>
                      <span className={`badge ${
                        a.category === 'Assets' ? 'badge-success' :
                        a.category === 'Liabilities' ? 'badge-danger' :
                        a.category === 'Equity' ? 'badge-info' :
                        a.category === 'Revenue' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {a.category}
                      </span>
                    </td>
                    <td className="text-right bold">
                      GHS {a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="grid-2col">
          {/* New Journal Entry Form */}
          <div className="card">
            <div className="card-title">
              <span>Create Journal Entry</span>
              <ArrowRightLeft size={18} className="card-title-icon" />
            </div>

            <form onSubmit={handleJournalSubmit}>
              <div className="flex flex-col gap-16">
                
                {errorMsg && (
                  <div className="alert alert-danger">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="alert alert-success">
                    <CheckCircle size={18} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={jeDate}
                      onChange={(e) => setJeDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Reference (Optional)</label>
                    <input
                      type="text"
                      value={jeReference}
                      onChange={(e) => setJeReference(e.target.value)}
                      placeholder="e.g. JV-001"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <input
                    type="text"
                    value={jeDescription}
                    onChange={(e) => setJeDescription(e.target.value)}
                    placeholder="Describe transaction details"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Debit Account (Funds Allocation) *</label>
                    <select value={debitAccount} onChange={(e) => setDebitAccount(Number(e.target.value))} required>
                      {coa.map(a => (
                        <option key={a.account_no} value={a.account_no}>
                          {a.account_no} - {a.account_name} ({a.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Credit Account (Funds Source) *</label>
                    <select value={creditAccount} onChange={(e) => setCreditAccount(Number(e.target.value))} required>
                      {coa.map(a => (
                        <option key={a.account_no} value={a.account_no}>
                          {a.account_no} - {a.account_name} ({a.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Amount (GHS) *</label>
                  <input
                    type="number"
                    value={jeAmount}
                    onChange={(e) => setJeAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                {/* Validation Indicator */}
                <div className="p-16 flex justify-between" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                  <span>Debit Value: <span className="bold text-success">GHS {Number(jeAmount) || 0}</span></span>
                  <span>Credit Value: <span className="bold text-danger">GHS {Number(jeAmount) || 0}</span></span>
                  <span className="bold text-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Balanced <CheckCircle size={14} style={{ display: 'inline' }} />
                  </span>
                </div>

              </div>
              <div className="modal-footer" style={{ padding: 0, marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary w-full">Submit Journal Voucher</button>
              </div>
            </form>
          </div>

          {/* Journal Logs list */}
          <div className="card">
            <div className="card-title">Recent Postings Logs</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {journalEntries.map((je) => (
                <div key={je.id} className="p-16" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                  <div className="flex justify-between bold">
                    <span>{je.description}</span>
                    <span className="text-muted" style={{ fontSize: '11px' }}>{new Date(je.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="mt-8 flex flex-col gap-4">
                    {je.debits.map((d, i) => (
                      <div key={i} className="flex justify-between text-success">
                        <span>Dr: {coa.find(a => a.account_no === d.account_no)?.account_name} ({d.account_no})</span>
                        <span className="bold">GHS {d.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {je.credits.map((c, i) => (
                      <div key={i} className="flex justify-between text-danger">
                        <span>Cr: {coa.find(a => a.account_no === c.account_no)?.account_name} ({c.account_no})</span>
                        <span className="bold">GHS {c.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trial' && (
        <div className="card">
          <div className="card-title">Trial Balance Ledger</div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Account Name</th>
                  <th className="text-right">Debit Balance (GHS)</th>
                  <th className="text-right">Credit Balance (GHS)</th>
                </tr>
              </thead>
              <tbody>
                {coa.map(a => {
                  const isDebit = a.category === 'Assets' || a.category === 'Expenses';
                  return (
                    <tr key={a.account_no}>
                      <td>{a.account_no}</td>
                      <td className="bold">{a.account_name}</td>
                      <td className="text-right text-success bold">
                        {isDebit ? `GHS ${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="text-right text-danger bold">
                        {!isDebit ? `GHS ${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ background: 'rgba(59, 130, 246, 0.08)', fontWeight: 'bold' }}>
                  <td colSpan={2}>Balanced Ledger Totals</td>
                  <td className="text-right text-success" style={{ fontSize: '15px' }}>
                    GHS {coa.filter(a => a.category === 'Assets' || a.category === 'Expenses').reduce((sum, a) => sum + a.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right text-danger" style={{ fontSize: '15px' }}>
                    GHS {coa.filter(a => a.category === 'Liabilities' || a.category === 'Equity' || a.category === 'Revenue').reduce((sum, a) => sum + a.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'member_stmt' && (
        <div className="flex flex-col gap-16">
          <div className="card">
            <div className="form-group">
              <label>Select Member Ledger Profile *</label>
              <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
                <option value="">-- Select Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.account_number} - {m.full_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMemberObj && (
              <div className="flex flex-col gap-16 mt-8">
                <div className="flex justify-between align-center" style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
                  <div>
                    <h3 className="m-0" style={{ color: 'var(--primary)' }}>{selectedMemberObj.full_name}</h3>
                    <span className="text-muted">{selectedMemberObj.account_number} • {selectedMemberObj.phone_number}</span>
                  </div>
                </div>

                <div className="grid-3col" style={{ gap: '16px' }}>
                  <div className="p-16" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div className="text-muted" style={{ fontSize: '12px' }}>SAVINGS BALANCE</div>
                    <div className="bold" style={{ fontSize: '20px', color: 'var(--primary)' }}>
                      GHS {mockDb.getMemberSavingsBalance(selectedMemberObj.id).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="p-16" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div className="text-muted" style={{ fontSize: '12px' }}>SHARE CAPITAL</div>
                    <div className="bold" style={{ fontSize: '20px', color: 'var(--secondary-dark)' }}>
                      GHS {mockDb.getMemberSharesBalance(selectedMemberObj.id).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="p-16" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div className="text-muted" style={{ fontSize: '12px' }}>OUTSTANDING LOAN</div>
                    <div className="bold" style={{ fontSize: '20px', color: 'var(--danger)' }}>
                      GHS {mockDb.getMemberLoansBalance(selectedMemberObj.id).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="bold mt-8" style={{ fontSize: '14px' }}>Statement Ledger Details</div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Narration / Activity</th>
                        <th>Type</th>
                        <th className="text-right">Debit Out (GHS)</th>
                        <th className="text-right">Credit In (GHS)</th>
                        <th className="text-right">Cum Balance (GHS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statementRows.map(row => (
                        <tr key={row.id}>
                          <td>{new Date(row.date).toLocaleDateString()}</td>
                          <td>{row.description}</td>
                          <td>
                            <span className="badge badge-info" style={{ fontSize: '10px' }}>{row.type}</span>
                          </td>
                          <td className="text-right text-danger">
                            {row.debit > 0 ? `GHS ${row.debit.toFixed(2)}` : '-'}
                          </td>
                          <td className="text-right text-success">
                            {row.credit > 0 ? `GHS ${row.credit.toFixed(2)}` : '-'}
                          </td>
                          <td className="text-right bold">
                            GHS {row.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
