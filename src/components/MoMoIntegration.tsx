import React, { useState } from 'react';
import type { Member, MobileMoneyTransaction } from '../db/supabase';
import { CreditCard, Search, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle, Plus } from 'lucide-react';

interface MoMoIntegrationProps {
  members: Member[];
  momoTransactions: MobileMoneyTransaction[];
  onCreateTransaction: (tx: { direction: 'collection' | 'payout'; network: string; member_id?: string; amount: number; phone_number: string; purpose: string; reference: string }) => void;
  userRole: string;
}

export const MoMoIntegration: React.FC<MoMoIntegrationProps> = ({
  members,
  momoTransactions,
  onCreateTransaction,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Form State
  const [direction, setDirection] = useState<'collection' | 'payout'>('collection');
  const [network, setNetwork] = useState('MTN');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Savings Deposit');
  const [reference, setReference] = useState('');

  // Search member input inside selection
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Calculations
  const collectionsIn = momoTransactions
    .filter(t => t.type === 'collection' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const collectionsOut = momoTransactions
    .filter(t => t.type === 'payout' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCollections = collectionsIn - collectionsOut;

  // Filter Transactions
  const filteredTxs = momoTransactions.filter(t =>
    t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone_number.includes(searchTerm) ||
    (t.member_name && t.member_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleMemberSelect = (m: Member) => {
    setSelectedMemberId(m.id);
    setPhone(m.phone_number);
    setMemberSearchTerm(m.full_name);
    setShowMemberDropdown(false);
  };

  const handleResetForm = () => {
    setDirection('collection');
    setNetwork('MTN');
    setSelectedMemberId('');
    setAmount('');
    setPhone('');
    setPurpose('Savings Deposit');
    setReference('');
    setMemberSearchTerm('');
    setShowMemberDropdown(false);
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Transaction amount must be a positive number.');
      return;
    }

    if (!reference.trim()) {
      setErrorMsg('Please enter a transaction reference.');
      return;
    }

    try {
      onCreateTransaction({
        direction,
        network,
        member_id: selectedMemberId || undefined,
        amount: numAmount,
        phone_number: phone,
        purpose,
        reference
      });

      setSuccessMsg('Mobile Money transaction recorded and balances adjusted!');
      handleResetForm();

      setTimeout(() => {
        setShowRecordModal(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Recording failed.');
    }
  };

  const isReadOnly = userRole === 'Member';

  // Filter members list based on memberSearchTerm in selection box
  const searchableMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    m.account_number.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-16 w-full">
      
      {/* Header bar */}
      <div className="flex justify-between align-center">
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Mobile Money Integration</h2>
          <span className="text-muted" style={{ fontSize: '13px' }}>Monitor digital wallet balances, collections, and payouts.</span>
        </div>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={() => { handleResetForm(); setShowRecordModal(true); }}>
            <Plus size={18} /> Record Transaction
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid-stats">
        <div className="stat-card blue-border">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <ArrowUpRight size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Collections In</span>
            <span className="stat-value">GHS {collectionsIn.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <ArrowDownRight size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Collections Out</span>
            <span className="stat-value">GHS {collectionsOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="stat-card blue-border">
          <div className="stat-icon-wrapper">
            <CreditCard size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Net Collections</span>
            <span className="stat-value" style={{ color: netCollections >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              GHS {netCollections.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex align-center gap-8 mb-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
        <Search size={18} className="text-muted" />
        <input
          type="text"
          placeholder="Search by name, reference..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
        />
      </div>

      {/* Transaction table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Direction</th>
              <th>Member Name</th>
              <th>Network</th>
              <th>Phone Number</th>
              <th>Purpose</th>
              <th className="text-right">Amount</th>
              <th>Reference ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.map(t => (
              <tr key={t.id}>
                <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(t.timestamp).toLocaleDateString()}
                </td>
                <td>
                  <span className={`badge ${t.type === 'collection' ? 'badge-success' : 'badge-danger'}`}>
                    {t.type === 'collection' ? 'In (Collect)' : 'Out (Payout)'}
                  </span>
                </td>
                <td className="bold">{t.member_name || 'Walk-in Client'}</td>
                <td>{t.network}</td>
                <td>{t.phone_number}</td>
                <td>
                  <span className="badge badge-info" style={{ fontSize: '10px' }}>{t.purpose}</span>
                </td>
                <td className="text-right bold" style={{ color: t.type === 'collection' ? 'var(--success)' : 'var(--danger)' }}>
                  GHS {t.amount.toFixed(2)}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{t.reference}</td>
              </tr>
            ))}
            {filteredTxs.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-16 text-muted">No MoMo transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Transaction Popup Modal */}
      {showRecordModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Record MoMo Transaction</h2>
              <button className="modal-close" onClick={() => setShowRecordModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleRecordSubmit}>
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
                    <label>Transaction Direction *</label>
                    <select value={direction} onChange={(e) => setDirection(e.target.value as any)}>
                      <option value="collection">Collection In (Inflow)</option>
                      <option value="payout">Collection Out (Outflow)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Network Provider *</label>
                    <select value={network} onChange={(e) => setNetwork(e.target.value)}>
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Telecel">Telecel Cash</option>
                      <option value="AirtelTigo">AT Money</option>
                    </select>
                  </div>
                </div>

                {/* Searchable Select Member */}
                <div className="form-group searchable-select-container">
                  <label>Select Member (Optional)</label>
                  <input
                    type="text"
                    className="searchable-select-input"
                    value={memberSearchTerm}
                    onChange={(e) => {
                      setMemberSearchTerm(e.target.value);
                      setShowMemberDropdown(true);
                      if (selectedMemberId) setSelectedMemberId('');
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    placeholder="Search by name, account number..."
                  />
                  {showMemberDropdown && memberSearchTerm && (
                    <div className="searchable-select-options">
                      {searchableMembers.map(m => (
                        <div key={m.id} className="searchable-select-option" onClick={() => handleMemberSelect(m)}>
                          {m.account_number} - {m.full_name}
                        </div>
                      ))}
                      {searchableMembers.length === 0 && (
                        <div className="searchable-select-option text-muted">No members found</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-row">
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
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +233..."
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Purpose *</label>
                    <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                      <option value="Savings Deposit">Savings Deposit</option>
                      <option value="Loan Repayment">Loan Repayment</option>
                      <option value="Shares Purchase">Shares Purchase</option>
                      <option value="Payment to Member">Payment to Member</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Reference (Voucher/ID) *</label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. TX-99120"
                      required
                    />
                  </div>
                </div>

              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowRecordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
