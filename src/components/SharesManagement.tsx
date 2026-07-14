import React, { useState, useEffect } from 'react';
import type { Member, Transaction } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { TrendingUp, Search, AlertCircle } from 'lucide-react';

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
  
  // Buy Shares Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [manualAccountNumber, setManualAccountNumber] = useState('');
  const [shareAmount, setShareAmount] = useState('');
  const [buyDesc, setBuyDesc] = useState('');

  // Search member input inside selection
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Dividend state
  const [divPercentage, setDivPercentage] = useState('5');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const shareTransactions = transactions.filter(t => t.type === 'share_purchase' || t.type === 'dividend');

  // Filter members list
  const filteredMembers = members.filter(m => {
    const term = searchTerm.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(term) ||
      m.account_number.toLowerCase().includes(term)
    );
  });

  // Handle manual typing of account number
  useEffect(() => {
    if (manualAccountNumber.trim()) {
      const match = members.find(m => m.account_number.toLowerCase() === manualAccountNumber.trim().toLowerCase());
      if (match) {
        setSelectedMemberId(match.id);
        setMemberSearchTerm(match.full_name);
      } else {
        setSelectedMemberId('');
      }
    }
  }, [manualAccountNumber, members]);

  const handleMemberSelect = (m: Member) => {
    setSelectedMemberId(m.id);
    setManualAccountNumber(m.account_number);
    setMemberSearchTerm(m.full_name);
    setShowMemberDropdown(false);
  };

  const handleOpenBuy = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedMemberId('');
    setManualAccountNumber('');
    setShareAmount('');
    setBuyDesc('');
    setMemberSearchTerm('');
    setShowMemberDropdown(false);
    setShowBuyModal(true);
  };

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedMemberId) {
      setErrorMsg('Please select a valid member profile or enter a correct Account Number.');
      return;
    }

    const numAmount = Number(shareAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Amount must be a positive number.');
      return;
    }

    try {
      await onPostTransaction({
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
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Share purchase failed.');
    }
  };

  const handleDividendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const pct = Number(divPercentage);
    if (isNaN(pct) || pct <= 0) {
      setErrorMsg('Dividend percentage must be a positive number.');
      return;
    }

    try {
      await onDistributeDividends(pct);
      setSuccessMsg(`Dividend of ${pct}% successfully distributed to all member savings!`);
      setTimeout(() => {
        setActiveTab('balances');
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Dividend distribution failed.');
    }
  };

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

  // Filter members list based on memberSearchTerm in selection box
  const searchableMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    m.account_number.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

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
              <button className="btn btn-primary" onClick={handleOpenBuy}>
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
                          <td className="text-right bold" style={{ fontSize: '15px', color: 'var(--secondary)' }}>
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
                        <td className="text-right bold" style={{ color: t.type === 'share_purchase' ? 'var(--secondary)' : 'var(--success)' }}>
                          GHS {t.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
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
                  <div className="bold" style={{ fontSize: '14px' }}>Dividend System Rule:</div>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>
                    Dividends are distributed as a percentage of each member's active Share Capital. 
                    The calculated dividends are instantly posted into the members' **Savings account** and 
                    the ledger debits **Retained Earnings (3100)** and credits **Cash (1000)**.
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

            </div>
            
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary w-full">
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

                {/* Option 1: Searchable Select Member */}
                <div className="form-group searchable-select-container">
                  <label>Select Member (Searchable) *</label>
                  <input
                    type="text"
                    className="searchable-select-input"
                    value={memberSearchTerm}
                    onChange={(e) => {
                      setMemberSearchTerm(e.target.value);
                      setShowMemberDropdown(true);
                      if (selectedMemberId) {
                        setSelectedMemberId('');
                        setManualAccountNumber('');
                      }
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

                {/* Option 2: Enter manually */}
                <div className="form-group">
                  <label>Or Enter Account Number Manually</label>
                  <input
                    type="text"
                    value={manualAccountNumber}
                    onChange={(e) => {
                      setManualAccountNumber(e.target.value);
                      if (!e.target.value.trim()) {
                        setSelectedMemberId('');
                        setMemberSearchTerm('');
                      }
                    }}
                    placeholder="e.g. SDMS 0001"
                  />
                  {selectedMemberId && (
                    <span className="text-success bold" style={{ fontSize: '11px', marginTop: '2px', display: 'block' }}>
                      Matched Account Profile: {members.find(x => x.id === selectedMemberId)?.full_name}
                    </span>
                  )}
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
                </div>

                <div className="form-group">
                  <label>Description / Reference</label>
                  <input
                    type="text"
                    value={buyDesc}
                    onChange={(e) => setBuyDesc(e.target.value)}
                    placeholder="e.g. Counter share purchase"
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
