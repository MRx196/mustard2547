import React, { useState } from 'react';
import type { Member, Transaction } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { PiggyBank, Search, Plus, Minus, AlertCircle } from 'lucide-react';

interface SavingsManagementProps {
  members: Member[];
  transactions: Transaction[];
  onPostTransaction: (txData: { member_id: string; type: 'deposit' | 'withdrawal'; amount: number; description: string }) => void;
  userRole: string;
}

export const SavingsManagement: React.FC<SavingsManagementProps> = ({
  members,
  transactions,
  onPostTransaction,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  // Form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Get only savings transactions (deposit and withdrawal)
  const savingsTransactions = transactions.filter(t => t.type === 'deposit' || t.type === 'withdrawal');

  // Filter savings records by member search
  const filteredMembers = members.filter(m => {
    const term = searchTerm.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(term) ||
      m.account_number.toLowerCase().includes(term) ||
      m.phone_number.toLowerCase().includes(term)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedMemberId) {
      setErrorMsg('Please select a member.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Amount must be a positive number.');
      return;
    }

    // Validation for withdrawals
    if (txType === 'withdrawal') {
      const balance = mockDb.getMemberSavingsBalance(selectedMemberId);
      if (balance < numAmount) {
        setErrorMsg(`Insufficient funds. Member only has GHS ${balance.toFixed(2)} in savings.`);
        return;
      }
    }

    try {
      onPostTransaction({
        member_id: selectedMemberId,
        type: txType,
        amount: numAmount,
        description: description || `${txType === 'deposit' ? 'Savings Deposit' : 'Savings Withdrawal'}`
      });

      setSuccessMsg('Transaction posted and balanced successfully!');
      setAmount('');
      setDescription('');
      
      setTimeout(() => {
        setShowTransactionModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Transaction posting failed.');
    }
  };

  const isReadOnly = userRole === 'Member';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Search and Action Bar */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
          <Search size={18} className="text-muted" />
          <input
            type="text"
            placeholder="Search savings by name or Acc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
          />
        </div>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={() => setShowTransactionModal(true)}>
            <PiggyBank size={18} /> Post Savings Ledger
          </button>
        )}
      </div>

      <div className="grid-2col">
        {/* Members Savings Summary Balances */}
        <div className="card">
          <div className="card-title">Savings Accounts Balances</div>
          <div className="table-container" style={{ maxHeight: '450px' }}>
            <table>
              <thead>
                <tr>
                  <th>Acc Number</th>
                  <th>Member Name</th>
                  <th>Mobile GPS</th>
                  <th className="text-right">Savings Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => {
                  const balance = mockDb.getMemberSavingsBalance(m.id);
                  return (
                    <tr key={m.id}>
                      <td className="bold" style={{ color: 'var(--primary)' }}>{m.account_number}</td>
                      <td>
                        <div className="bold">{m.full_name}</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.phone_number}</span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{m.house_no_gps}</td>
                      <td className="text-right bold" style={{ fontSize: '15px', color: 'var(--primary-dark)' }}>
                        GHS {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-16 text-muted">No members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="card">
          <div className="card-title">Savings Statement Logs</div>
          <div className="table-container" style={{ maxHeight: '450px' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Acc</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {savingsTransactions.slice(0, 15).map(t => (
                  <tr key={t.id}>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="bold">{t.account_number}</div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }} title={t.description}>
                        {t.description.length > 20 ? t.description.slice(0, 20) + '...' : t.description}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.type === 'deposit' ? 'badge-success' : 'badge-danger'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`text-right bold ${t.type === 'deposit' ? 'text-success' : 'text-danger'}`}>
                      GHS {t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {savingsTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-16 text-muted">No savings history recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Post Transaction</h2>
              <button className="modal-close" onClick={() => setShowTransactionModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-16">
                
                {errorMsg && (
                  <div className="alert alert-danger">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="alert alert-success">
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Select Member *</label>
                  <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} required>
                    <option value="">-- Choose Member --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.account_number} - {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Transaction Type *</label>
                  <div className="flex gap-16" style={{ marginTop: '4px' }}>
                    <label className="flex align-center gap-8" style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="tx_type"
                        checked={txType === 'deposit'}
                        onChange={() => setTxType('deposit')}
                      />
                      <Plus size={16} className="text-success" /> Deposit
                    </label>
                    <label className="flex align-center gap-8" style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="tx_type"
                        checked={txType === 'withdrawal'}
                        onChange={() => setTxType('withdrawal')}
                      />
                      <Minus size={16} className="text-danger" /> Withdrawal
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Amount (GHS) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  {selectedMemberId && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Current Balance: GHS {mockDb.getMemberSavingsBalance(selectedMemberId).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Description / Particulars</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. July Contribution, Counter Deposit"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowTransactionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
