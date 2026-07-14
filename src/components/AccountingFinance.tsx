import React, { useState } from 'react';
import type { Member, AccountCOA, JournalEntry } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { Search, Trash2, CheckCircle, AlertCircle, ArrowRightLeft } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'coa' | 'journal' | 'trial' | 'balance_sheet' | 'income' | 'member_stmt'>('coa');
  const [searchTerm, setSearchTerm] = useState('');

  // Manual Journal Entry Form State
  const [jeDescription, setJeDescription] = useState('');
  const [jeDebits, setJeDebits] = useState<{ account_no: number; amount: number }[]>([{ account_no: 1000, amount: 0 }]);
  const [jeCredits, setJeCredits] = useState<{ account_no: number; amount: number }[]>([{ account_no: 2200, amount: 0 }]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Member Statement State
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Filter COA
  const filteredCOA = coa.filter(a =>
    a.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.account_no.toString().includes(searchTerm) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Journal Submit handler
  const handleAddDebitRow = () => setJeDebits([...jeDebits, { account_no: 1000, amount: 0 }]);
  const handleRemoveDebitRow = (idx: number) => setJeDebits(jeDebits.filter((_, i) => i !== idx));
  const handleDebitChange = (idx: number, field: string, val: any) => {
    const updated = [...jeDebits];
    updated[idx] = { ...updated[idx], [field]: Number(val) };
    setJeDebits(updated);
  };

  const handleAddCreditRow = () => setJeCredits([...jeCredits, { account_no: 2200, amount: 0 }]);
  const handleRemoveCreditRow = (idx: number) => setJeCredits(jeCredits.filter((_, i) => i !== idx));
  const handleCreditChange = (idx: number, field: string, val: any) => {
    const updated = [...jeCredits];
    updated[idx] = { ...updated[idx], [field]: Number(val) };
    setJeCredits(updated);
  };

  const handleJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const debitsTotal = jeDebits.reduce((sum, d) => sum + d.amount, 0);
    const creditsTotal = jeCredits.reduce((sum, c) => sum + c.amount, 0);

    if (Math.abs(debitsTotal - creditsTotal) > 0.01) {
      setErrorMsg(`Unbalanced Entry! Total Debits (GHS ${debitsTotal.toFixed(2)}) must equal Total Credits (GHS ${creditsTotal.toFixed(2)}). Diff: GHS ${Math.abs(debitsTotal - creditsTotal).toFixed(2)}`);
      return;
    }

    if (debitsTotal <= 0) {
      setErrorMsg('Transaction amount must be greater than zero.');
      return;
    }

    if (!jeDescription) {
      setErrorMsg('Please enter a description for the journal voucher.');
      return;
    }

    try {
      onPostJournalEntry({
        description: jeDescription,
        debits: jeDebits.filter(d => d.amount > 0),
        credits: jeCredits.filter(c => c.amount > 0)
      });

      setSuccessMsg('Journal voucher posted and accounts updated successfully!');
      setJeDescription('');
      setJeDebits([{ account_no: 1000, amount: 0 }]);
      setJeCredits([{ account_no: 2200, amount: 0 }]);

      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Posting failed.');
    }
  };

  // Financial Reports Math
  const totalDebitsTrial = coa
    .filter(a => a.category === 'Assets' || a.category === 'Expenses')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalCreditsTrial = coa
    .filter(a => a.category === 'Liabilities' || a.category === 'Equity' || a.category === 'Revenue')
    .reduce((sum, a) => sum + a.balance, 0);

  const netIncomeVal = coa
    .filter(a => a.category === 'Revenue')
    .reduce((sum, a) => sum + a.balance, 0) -
    coa.filter(a => a.category === 'Expenses').reduce((sum, a) => sum + a.balance, 0);

  // Member Statement Calculations
  const memberTransactions = selectedMemberId ? mockDb.getTransactions(selectedMemberId) : [];
  const selectedMemberObj = members.find(m => m.id === selectedMemberId);

  // Re-calculate statement running balances
  const getMemberStatementRows = () => {
    let runningBalance = 0;
    // Transactions are chronological, let's reverse to parse forward
    const rows = [...memberTransactions].reverse().map(t => {
      const isCredit = t.type === 'deposit' || t.type === 'dividend' || t.type === 'share_purchase';
      const isDebit = t.type === 'withdrawal' || t.type === 'loan_disbursement';
      
      let amountChange = 0;
      if (t.type === 'deposit' || t.type === 'dividend') amountChange = t.amount;
      else if (t.type === 'withdrawal') amountChange = -t.amount;
      else if (t.type === 'share_purchase') amountChange = t.amount; // share ledger
      else if (t.type === 'loan_repayment') amountChange = -t.amount; // loan ledger

      runningBalance += amountChange;

      return {
        ...t,
        debit: isDebit ? t.amount : 0,
        credit: isCredit ? t.amount : 0,
        balance: runningBalance
      };
    });
    return rows.reverse(); // Return in reverse chronological order for statement display
  };

  const statementRows = getMemberStatementRows();
  const isOfficerOrAccountant = userRole === 'Super Admin' || userRole === 'Administrator' || userRole === 'Accountant' || userRole === 'Loan Officer';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Sub navigation tabs */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'coa' ? 'active' : ''}`} onClick={() => setActiveTab('coa')}>
          Chart of Accounts (COA)
        </button>
        {isOfficerOrAccountant && (
          <button className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>
            Journal Entry Posting
          </button>
        )}
        <button className={`tab-btn ${activeTab === 'trial' ? 'active' : ''}`} onClick={() => setActiveTab('trial')}>
          Trial Balance
        </button>
        <button className={`tab-btn ${activeTab === 'balance_sheet' ? 'active' : ''}`} onClick={() => setActiveTab('balance_sheet')}>
          Balance Sheet
        </button>
        <button className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>
          Income Statement
        </button>
        <button className={`tab-btn ${activeTab === 'member_stmt' ? 'active' : ''}`} onClick={() => setActiveTab('member_stmt')}>
          Member Ledger Statements
        </button>
      </div>

      {activeTab === 'coa' && (
        <div className="flex flex-col gap-16">
          <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
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
                  <th>Account Code</th>
                  <th>Account Name</th>
                  <th>Category Group</th>
                  <th className="text-right">Ledger Balance</th>
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
          {/* Post Journal Form */}
          <div className="card">
            <div className="card-title">
              <span>Post New Journal Entry</span>
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

                <div className="form-group">
                  <label>Journal Entry Description / Narration *</label>
                  <input
                    type="text"
                    value={jeDescription}
                    onChange={(e) => setJeDescription(e.target.value)}
                    placeholder="e.g. Purchase office supplies, manual adjustment"
                    required
                  />
                </div>

                {/* Debits Section */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <div className="flex justify-between align-center">
                    <span className="bold text-success">Debits (Allocation of funds)</span>
                    <button type="button" className="btn btn-outline" style={{ padding: '2px 6px', fontSize: '11px' }} onClick={handleAddDebitRow}>
                      + Add Debit Row
                    </button>
                  </div>
                </div>
                {jeDebits.map((d, idx) => (
                  <div key={idx} className="flex gap-8 align-center">
                    <select value={d.account_no} onChange={(e) => handleDebitChange(idx, 'account_no', e.target.value)} style={{ flexGrow: 2 }}>
                      {coa.map(a => (
                        <option key={a.account_no} value={a.account_no}>{a.account_no} - {a.account_name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={d.amount || ''}
                      onChange={(e) => handleDebitChange(idx, 'amount', e.target.value)}
                      placeholder="0.00"
                      style={{ width: '120px' }}
                      min="0"
                      step="0.01"
                      required
                    />
                    {jeDebits.length > 1 && (
                      <button type="button" className="btn btn-danger" style={{ padding: '8px' }} onClick={() => handleRemoveDebitRow(idx)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Credits Section */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px', marginTop: '8px' }}>
                  <div className="flex justify-between align-center">
                    <span className="bold text-danger">Credits (Source of funds)</span>
                    <button type="button" className="btn btn-outline" style={{ padding: '2px 6px', fontSize: '11px' }} onClick={handleAddCreditRow}>
                      + Add Credit Row
                    </button>
                  </div>
                </div>
                {jeCredits.map((c, idx) => (
                  <div key={idx} className="flex gap-8 align-center">
                    <select value={c.account_no} onChange={(e) => handleCreditChange(idx, 'account_no', e.target.value)} style={{ flexGrow: 2 }}>
                      {coa.map(a => (
                        <option key={a.account_no} value={a.account_no}>{a.account_no} - {a.account_name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={c.amount || ''}
                      onChange={(e) => handleCreditChange(idx, 'amount', e.target.value)}
                      placeholder="0.00"
                      style={{ width: '120px' }}
                      min="0"
                      step="0.01"
                      required
                    />
                    {jeCredits.length > 1 && (
                      <button type="button" className="btn btn-danger" style={{ padding: '8px' }} onClick={() => handleRemoveCreditRow(idx)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Total Check */}
                <div className="flex justify-between p-8 text-center" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                  <div>Debits: <span className="bold text-success">GHS {jeDebits.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</span></div>
                  <div>Credits: <span className="bold text-danger">GHS {jeCredits.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}</span></div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary w-full">Post Balanced Journal Entry</button>
              </div>
            </form>
          </div>

          {/* Ledger logs */}
          <div className="card">
            <div className="card-title">Recent Journal Entries Log</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
              {journalEntries.map((je) => (
                <div key={je.id} className="p-16" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                  <div className="flex justify-between bold">
                    <span>{je.description}</span>
                    <span className="text-muted" style={{ fontSize: '11px' }}>{new Date(je.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="mt-8 flex flex-col gap-4">
                    {je.debits.map((d, i) => (
                      <div key={i} className="flex justify-between text-success">
                        <span>Debit: {coa.find(a => a.account_no === d.account_no)?.account_name} ({d.account_no})</span>
                        <span className="bold">GHS {d.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {je.credits.map((c, i) => (
                      <div key={i} className="flex justify-between text-danger">
                        <span>Credit: {coa.find(a => a.account_no === c.account_no)?.account_name} ({c.account_no})</span>
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
          <div className="card-title">Trial Balance Statement (July 2026)</div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Account Code</th>
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
                <tr style={{ background: 'rgba(15, 107, 63, 0.08)', fontWeight: 'bold' }}>
                  <td colSpan={2}>Balanced Ledger Totals</td>
                  <td className="text-right text-success" style={{ fontSize: '15px' }}>
                    GHS {totalDebitsTrial.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right text-danger" style={{ fontSize: '15px' }}>
                    GHS {totalCreditsTrial.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {Math.abs(totalDebitsTrial - totalCreditsTrial) < 0.05 ? (
            <div className="alert alert-success mt-8" style={{ padding: '10px' }}>
              <CheckCircle size={16} /> Trial balance matches. General ledger is in perfect double-entry alignment.
            </div>
          ) : (
            <div className="alert alert-danger mt-8" style={{ padding: '10px' }}>
              <AlertCircle size={16} /> Ledger mismatch detected. Reconciliation is required.
            </div>
          )}
        </div>
      )}

      {activeTab === 'balance_sheet' && (
        <div className="grid-2col">
          {/* Assets Column */}
          <div className="card">
            <div className="card-title text-success">Assets (What Mustard Seed Owns)</div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Asset Account</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {coa.filter(a => a.category === 'Assets').map(a => (
                    <tr key={a.account_no}>
                      <td>{a.account_name} ({a.account_no})</td>
                      <td className="text-right bold">GHS {a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--bg-main)', fontWeight: 'bold' }}>
                    <td>Total Assets</td>
                    <td className="text-right text-success" style={{ fontSize: '16px' }}>
                      GHS {coa.filter(a => a.category === 'Assets').reduce((sum, a) => sum + a.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Liabilities & Equity Column */}
          <div className="card">
            <div className="card-title text-danger">Liabilities & Equity (What is Owed)</div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Account Profile</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Liabilities */}
                  <tr><td colSpan={2} className="bold text-muted" style={{ background: 'var(--bg-main)', fontSize: '11px' }}>LIABILITIES</td></tr>
                  {coa.filter(a => a.category === 'Liabilities').map(a => (
                    <tr key={a.account_no}>
                      <td>{a.account_name} ({a.account_no})</td>
                      <td className="text-right bold">GHS {a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  
                  {/* Equity */}
                  <tr><td colSpan={2} className="bold text-muted" style={{ background: 'var(--bg-main)', fontSize: '11px' }}>EQUITY</td></tr>
                  {coa.filter(a => a.category === 'Equity').map(a => (
                    <tr key={a.account_no}>
                      <td>{a.account_name} ({a.account_no})</td>
                      <td className="text-right bold">GHS {a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {/* Add net income to equity for balance sheet */}
                  <tr>
                    <td>Current Period Net Income (Retained)</td>
                    <td className="text-right bold text-success">GHS {netIncomeVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>

                  <tr style={{ background: 'var(--bg-main)', fontWeight: 'bold' }}>
                    <td>Total Liabilities & Equity</td>
                    <td className="text-right text-danger" style={{ fontSize: '16px' }}>
                      GHS {(
                        coa.filter(a => a.category === 'Liabilities' || a.category === 'Equity').reduce((sum, a) => sum + a.balance, 0) + netIncomeVal
                      ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'income' && (
        <div className="card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="card-title text-success">Income Statement (Profit & Loss)</div>
          
          <div className="table-container">
            <table>
              <tbody>
                {/* Revenues */}
                <tr style={{ fontWeight: 'bold', background: 'var(--bg-main)' }}><td colSpan={2}>REVENUES (INFLOWS)</td></tr>
                {coa.filter(a => a.category === 'Revenue').map(a => (
                  <tr key={a.account_no}>
                    <td style={{ paddingLeft: '24px' }}>{a.account_name}</td>
                    <td className="text-right bold text-success">GHS {a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold' }}>
                  <td>Total Revenues</td>
                  <td className="text-right text-success" style={{ borderTop: '1px solid var(--border)', fontSize: '15px' }}>
                    GHS {coa.filter(a => a.category === 'Revenue').reduce((sum, a) => sum + a.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* Expenses */}
                <tr style={{ fontWeight: 'bold', background: 'var(--bg-main)' }}><td colSpan={2}>OPERATING EXPENSES (OUTFLOWS)</td></tr>
                {coa.filter(a => a.category === 'Expenses').map(a => (
                  <tr key={a.account_no}>
                    <td style={{ paddingLeft: '24px' }}>{a.account_name}</td>
                    <td className="text-right text-danger">GHS {a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold' }}>
                  <td>Total Expenses</td>
                  <td className="text-right text-danger" style={{ borderTop: '1px solid var(--border)', fontSize: '15px' }}>
                    GHS {coa.filter(a => a.category === 'Expenses').reduce((sum, a) => sum + a.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* Net Profit */}
                <tr style={{ background: 'rgba(15, 107, 63, 0.08)', fontWeight: 'bold', fontSize: '16px' }}>
                  <td>NET SURPLUS / INCOME</td>
                  <td className="text-right text-success">
                    GHS {netIncomeVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                  <div className="text-right">
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>GPS: {selectedMemberObj.house_no_gps}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Landmark: {selectedMemberObj.landmark}</div>
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
                      {statementRows.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center p-16 text-muted">No ledger transactions posted for this profile.</td>
                        </tr>
                      )}
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
