import React, { useState } from 'react';
import type { Member, Transaction } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { TrendingUp, Search, Percent, AlertCircle } from 'lucide-react';

interface SharesManagementProps {
  members: Member[];
  transactions: Transaction[];
  onPostTransaction: (txData: { member_id: string; type: 'share_purchase'; amount: number; description: string }) => void;
  onDistributeDividends: (percentage: number) => void;
  userRole: string;
}

export const SharesManagement: React.FC<SharesManagementProps> = ({
  members,
  transactions,
  onPostTransaction,
  onDistributeDividends,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'balances' | 'dividend'>('balances');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Buy Shares state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [shareAmount, setShareAmount] = useState('');
  const [buyDesc, setBuyDesc] = useState('');

  // Dividend state
  const [divPercentage, setDivPercentage] = useState('5'); // Default 5%
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const shareTransactions = transactions.filter(t => t.type === 'share_purchase' || t.type === 'dividend');

  // Filtering
  const filteredMembers = members.filter(m => {
    const term = searchTerm.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(term) ||
      m.account_number.toLowerCase().includes(term)
    );
  });

  const handleBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedMemberId) {
      setErrorMsg('Please select a member.');
      return;
    }

    const numAmount = Number(shareAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Amount must be a positive number.');
      return;
    }

    try {
      onPostTransaction({
        member_id: selectedMemberId,
        type: 'share_purchase',
        amount: numAmount,
        description: buyDesc || 'Purchase of Share Capital'
      });

      setSuccessMsg('Share purchase posted and balanced successfully!');
      setShareAmount('');
      setBuyDesc('');

      setTimeout(() => {
        setShowBuyModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Share posting failed.');
    }
  };

  const handleDividendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const pct = Number(divPercentage);
    if (isNaN(pct) || pct <= 0) {
      setErrorMsg('Dividend percentage must be a positive number.');
      return;
    }

    try {
      onDistributeDividends(pct);
      setSuccessMsg(`Dividend of ${pct}% successfully distributed to all member savings!`);
      setTimeout(() => {
        setActiveTab('balances');
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Dividend distribution failed.');
    }
  };

  // Estimate dividend payout
  const calculateTotalShares = () => {
    return members.reduce((sum, m) => sum + mockDb.getMemberSharesBalance(m.id), 0);
  };

  const estimatePayout = () => {
    const totalShares = calculateTotalShares();
    const pct = Number(divPercentage) || 0;
    return (totalShares * (pct / 100));
  };

  const isReadOnly = userRole === 'Member';
  const isAccountantOrAdmin = userRole === 'Super Admin' || userRole === 'Administrator' || userRole === 'Accountant';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Sub tabs */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'balances' ? 'active' : ''}`} onClick={() => setActiveTab('balances')}>
          Shares Ledger Balances
        </button>
        {isAccountantOrAdmin && (
          <button className={`tab-btn ${activeTab === 'dividend' ? 'active' : ''}`} onClick={() => setActiveTab('dividend')}>
            Dividend Distribution Tool
          </button>
        )}
      </div>

      {activeTab === 'balances' && (
        <div className="flex flex-col gap-16">
          <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search share registers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
              />
            </div>
            {!isReadOnly && (
              <button className="btn btn-primary" onClick={() => setShowBuyModal(true)}>
                <TrendingUp size={18} /> Buy Share Capital
              </button>
            )}
          </div>

          <div className="grid-2col">
            {/* Share Balances list */}
            <div className="card">
              <div className="card-title">Member Share capital accounts</div>
              <div className="table-container" style={{ maxHeight: '450px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Member Name</th>
                      <th>Fellowship Group</th>
                      <th className="text-right">Shares Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(m => {
                      const balance = mockDb.getMemberSharesBalance(m.id);
                      return (
                        <tr key={m.id}>
                          <td className="bold" style={{ color: 'var(--primary)' }}>{m.account_number}</td>
                          <td className="bold">{m.full_name}</td>
                          <td>{m.group_name || 'N/A'}</td>
                          <td className="text-right bold" style={{ fontSize: '15px', color: 'var(--secondary-dark)' }}>
                            GHS {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Share transaction ledger */}
            <div className="card">
              <div className="card-title">Shares & Dividend Statements</div>
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
                    {shareTransactions.slice(0, 15).map(t => (
                      <tr key={t.id}>
                        <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="bold">{t.account_number}</div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.description}</span>
                        </td>
                        <td>
                          <span className={`badge ${t.type === 'share_purchase' ? 'badge-success' : 'badge-info'}`}>
                            {t.type === 'share_purchase' ? 'Purchase' : 'Dividend'}
                          </span>
                        </td>
                        <td className="text-right bold" style={{ color: t.type === 'share_purchase' ? 'var(--secondary-dark)' : 'var(--success)' }}>
                          GHS {t.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {shareTransactions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center p-16 text-muted">No shares transaction history.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dividend' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-title">
            <span>Dividend Distribution Wizard</span>
            <Percent size={18} className="card-title-icon" />
          </div>
          
          <form onSubmit={handleDividendSubmit}>
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

              <div className="alert alert-info">
                <AlertCircle size={22} style={{ flexShrink: 0 }} />
                <div>
                  <div className="bold" style={{ fontSize: '14px' }}>How Dividend Posting Works:</div>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>
                    Dividends are distributed as a percentage of each member's total active Share Capital. 
                    The calculated dividends are instantly posted into the members' **Savings account** and 
                    the ledger debits **Retained Earnings (3100)** and credits **Savings deposits (2200)**. 
                    This ensures double entry systems stay in check. All members receive auto SMS notifications.
                  </p>
                </div>
              </div>

              <div className="form-group">
                <label>Dividend Distribution Rate (%) *</label>
                <input
                  type="number"
                  value={divPercentage}
                  onChange={(e) => setDivPercentage(e.target.value)}
                  placeholder="e.g. 5"
                  min="0.1"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className="p-16" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                <div className="flex justify-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span>Total Capital Pool:</span>
                  <span className="bold">GHS {calculateTotalShares().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between mt-8" style={{ fontSize: '15px' }}>
                  <span>Total Payout Estimate:</span>
                  <span className="bold text-success">
                    GHS {estimatePayout().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex align-center gap-8" style={{ color: 'var(--danger)', fontSize: '11px' }}>
                <AlertCircle size={14} />
                <span>Caution: This operation is batch executed and will run ledger transactions for all members.</span>
              </div>

            </div>
            
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary w-full" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%)', color: 'var(--primary-dark)' }}>
                Execute Dividend Distribution
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buy Shares Modal */}
      {showBuyModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Purchase Share Capital</h2>
              <button className="modal-close" onClick={() => setShowBuyModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleBuySubmit}>
              <div className="flex flex-col gap-16">
                
                {errorMsg && (
                  <div className="alert alert-danger">
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
                  <label>Share Capital Amount (GHS) *</label>
                  <input
                    type="number"
                    value={shareAmount}
                    onChange={(e) => setShareAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  {selectedMemberId && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Current Share Balance: GHS {mockDb.getMemberSharesBalance(selectedMemberId).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Description / Reference</label>
                  <input
                    type="text"
                    value={buyDesc}
                    onChange={(e) => setBuyDesc(e.target.value)}
                    placeholder="e.g. Purchase of 100 shares, counter purchase"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowBuyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Complete Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
