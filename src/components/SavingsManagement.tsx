import React, { useState } from 'react';
import type { Member } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { Search, AlertCircle, CheckCircle, ArrowUpRight } from 'lucide-react';

interface SavingsManagementProps {
  members: Member[];
  onPostTransaction: (txData: { member_id: string; type: 'deposit'; amount: number; description: string; reference?: string; notes?: string }) => void;
  userRole: string;
}

export const SavingsManagement: React.FC<SavingsManagementProps> = ({
  members,
  onPostTransaction,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Deposit Form state
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter members list
  const filteredMembers = members.filter(m => {
    const term = searchTerm.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(term) ||
      m.account_number.toLowerCase().includes(term)
    );
  });

  const handleOpenPopup = (member: Member) => {
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedMember(member);
    setAmount('');
    setReference('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedMember) return;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Deposit amount must be a positive number.');
      return;
    }

    try {
      await onPostTransaction({
        member_id: selectedMember.id,
        type: 'deposit',
        amount: numAmount,
        description: 'Savings Deposit',
        reference,
        notes
      });

      setSuccessMsg('Deposit successfully processed and accounts updated!');
      setAmount('');
      
      setTimeout(() => {
        setSelectedMember(null);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Deposit failed.');
    }
  };

  const isReadOnly = userRole === 'Member' || userRole === 'Auditor';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Header bar */}
      <div>
        <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Deposits Portal</h2>
        <span className="text-muted" style={{ fontSize: '13px' }}>Select a member below to process a savings account deposit.</span>
      </div>

      {/* Search Input */}
      <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', width: '360px' }}>
        <Search size={18} className="text-muted" />
        <input
          type="text"
          placeholder="Search by name, account number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
        />
      </div>

      {/* Directory Grid */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Member Name</th>
              <th>Phone Number</th>
              <th>Congregation</th>
              <th className="text-right">Savings Balance</th>
              {!isReadOnly && <th className="text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(m => {
              const balance = mockDb.getMemberSavingsBalance(m.id);
              return (
                <tr key={m.id}>
                  <td className="bold" style={{ color: 'var(--primary)' }}>{m.account_number}</td>
                  <td className="bold">{m.full_name}</td>
                  <td>{m.phone_number}</td>
                  <td>{m.congregation}</td>
                  <td className="text-right bold" style={{ fontSize: '15px', color: 'var(--success)' }}>
                    GHS {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  {!isReadOnly && (
                    <td className="text-center">
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenPopup(m)}>
                        <ArrowUpRight size={14} style={{ marginRight: '4px' }} /> Deposit
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-16 text-muted">No matching members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Deposit Popup Modal */}
      {selectedMember && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Process Savings Deposit</h2>
              <button className="modal-close" onClick={() => setSelectedMember(null)}>&times;</button>
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
                    <CheckCircle size={18} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="p-16" style={{ background: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px' }}>
                  <div className="flex justify-between">
                    <span className="text-muted">Selected Member:</span>
                    <span className="bold">{selectedMember.full_name}</span>
                  </div>
                  <div className="flex justify-between mt-8">
                    <span className="text-muted">Account Number:</span>
                    <span className="bold" style={{ fontFamily: 'monospace' }}>{selectedMember.account_number}</span>
                  </div>
                  <div className="flex justify-between mt-8" style={{ borderTop: '1px dashed var(--border)', paddingTop: '8px', fontSize: '14px' }}>
                    <span className="text-muted">Current Balance:</span>
                    <span className="bold text-success">
                      GHS {mockDb.getMemberSavingsBalance(selectedMember.id).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Deposit Amount (GHS) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Reference (Optional)</label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="e.g. Teller ID, slip #"
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes (Optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Counter deposit"
                    />
                  </div>
                </div>

              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedMember(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Deposit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
