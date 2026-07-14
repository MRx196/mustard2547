import React, { useState } from 'react';
import type { Member, MobileMoneyTransaction } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { CreditCard, Search, AlertCircle, CheckCircle, RefreshCw, Send, Smartphone } from 'lucide-react';

interface MoMoIntegrationProps {
  members: Member[];
  momoTransactions: MobileMoneyTransaction[];
  onCreateTransaction: (tx: Omit<MobileMoneyTransaction, 'id' | 'status' | 'timestamp' | 'reference'>) => MobileMoneyTransaction;
  onProcessTransaction: (id: string, success: boolean) => void;
  userRole: string;
}

export const MoMoIntegration: React.FC<MoMoIntegrationProps> = ({
  members,
  momoTransactions,
  onCreateTransaction,
  onProcessTransaction,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'request'>('transactions');
  const [searchTerm, setSearchTerm] = useState('');

  // Request form state
  const [memberId, setMemberId] = useState('');
  const [momoPhone, setMomoPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [momoType, setMomoType] = useState<'collection' | 'payout'>('collection');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingSim, setPendingSim] = useState<MobileMoneyTransaction | null>(null);

  // Autofill member phone
  const handleMemberChange = (id: string) => {
    setMemberId(id);
    const m = members.find(x => x.id === id);
    if (m) setMomoPhone(m.phone_number);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!memberId) {
      setErrorMsg('Please select a member.');
      return;
    }

    const numAmt = Number(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    // Payout limits check
    if (momoType === 'payout') {
      const balance = mockDb.getMemberSavingsBalance(memberId);
      if (balance < numAmt) {
        setErrorMsg(`Insufficient savings. Available balance: GHS ${balance.toFixed(2)}`);
        return;
      }
    }

    const member = members.find(m => m.id === memberId);
    if (!member) return;

    try {
      const newTx = onCreateTransaction({
        member_id: memberId,
        member_name: member.full_name,
        phone_number: momoPhone,
        amount: numAmt,
        type: momoType
      });

      setPendingSim(newTx);
      setSuccessMsg(`MoMo ${momoType} request initialized. Pending API response callback...`);
      setAmount('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Mobile Money request failed.');
    }
  };

  const handleSimulateResponse = (success: boolean) => {
    if (!pendingSim) return;
    onProcessTransaction(pendingSim.id, success);
    setPendingSim(null);
    setSuccessMsg(`Simulated callback: Transaction was processed as ${success ? 'SUCCESS' : 'FAILED'}.`);
    
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('transactions');
    }, 2000);
  };

  // Filter list
  const filteredTxs = momoTransactions.filter(t =>
    t.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone_number.includes(searchTerm) ||
    t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isReadOnly = userRole === 'Member';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Sub tabs */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
          MoMo Transactions History
        </button>
        {!isReadOnly && (
          <button className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`} onClick={() => setActiveTab('request')}>
            MoMo Deposit/Withdrawal Request
          </button>
        )}
      </div>

      {activeTab === 'transactions' && (
        <div className="flex flex-col gap-16">
          <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search transaction reference..."
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
                  <th>Timestamp</th>
                  <th>Reference ID</th>
                  <th>Member Name</th>
                  <th>Mobile GPS / Phone</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                    <td className="bold" style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {t.reference}
                    </td>
                    <td className="bold">{t.member_name}</td>
                    <td>
                      <div>{t.phone_number}</div>
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        {members.find(m => m.id === t.member_id)?.house_no_gps || ''}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.type === 'collection' ? 'badge-success' : 'badge-danger'}`}>
                        {t.type === 'collection' ? 'MoMo Deposit' : 'MoMo Payout'}
                      </span>
                    </td>
                    <td className="bold">GHS {t.amount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${t.status === 'success' ? 'badge-success' : t.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTxs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-16 text-muted">No Mobile Money transactions recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'request' && (
        <div className="grid-2col">
          {/* Request Form */}
          <div className="card">
            <div className="card-title">
              <span>Initiate MoMo Gateway Request</span>
              <CreditCard size={18} className="card-title-icon" />
            </div>

            <form onSubmit={handleRequestSubmit}>
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
                  <label>Select Member Profile *</label>
                  <select value={memberId} onChange={(e) => handleMemberChange(e.target.value)} required>
                    <option value="">-- Choose Member --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.account_number} - {m.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>MoMo Push Notification Target Mobile *</label>
                  <input
                    type="text"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder="e.g. +233244123456"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Transaction Amount (GHS) *</label>
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
                    <label>MoMo Request Flow *</label>
                    <select value={momoType} onChange={(e) => setMomoType(e.target.value as any)}>
                      <option value="collection">Momo Deposit (Collect from Member)</option>
                      <option value="payout">Momo Withdrawal (Disburse to Member)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full flex align-center justify-center gap-8" disabled={!!pendingSim}>
                  <Send size={16} /> Send MoMo API Push Request
                </button>
              </div>
            </form>
          </div>

          {/* Webhook Callback Simulator Portal (Hubtel Mock Sandbox) */}
          <div className="card" style={{ border: '1px dashed var(--secondary)' }}>
            <div className="card-title text-warning">
              <span>Hubtel Sandbox API Portal</span>
              <Smartphone size={18} />
            </div>

            {pendingSim ? (
              <div className="flex flex-col gap-16">
                <div className="p-16" style={{ background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div className="bold text-success" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={14} className="spin" /> Triggered Hubtel Payment request
                  </div>
                  
                  <div className="mt-8 flex flex-col gap-4" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    <div>Reference: {pendingSim.reference}</div>
                    <div>Target Number: {pendingSim.phone_number}</div>
                    <div>Flow Direction: {pendingSim.type.toUpperCase()}</div>
                    <div>Request Amount: GHS {pendingSim.amount.toFixed(2)}</div>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  A push notification has been mock dispatched to the member's handset. Simulate their security PIN response below.
                </p>

                <div className="flex gap-16">
                  <button className="btn btn-primary w-full" style={{ background: 'var(--success)' }} onClick={() => handleSimulateResponse(true)}>
                    Approve (Callback Success)
                  </button>
                  <button className="btn btn-danger w-full" onClick={() => handleSimulateResponse(false)}>
                    Reject (Callback Fail)
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-24 text-muted flex flex-col align-center justify-center gap-8" style={{ minHeight: '200px' }}>
                <AlertCircle size={28} className="text-muted" />
                <span>No active API push request pending in gateway sandbox.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
