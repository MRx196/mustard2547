import React, { useState } from 'react';
import type { Member, Loan, Guarantor } from '../db/supabase';
import { Plus, Search, CheckCircle, AlertCircle } from 'lucide-react';

interface GuarantorManagementProps {
  members: Member[];
  loans: Loan[];
  guarantors: Guarantor[];
  onAddGuarantor: (guarantorData: { loan_id: string; member_id?: string; full_name: string; phone_number: string; relationship: string; amount: number }) => void;
  userRole: string;
}

export const GuarantorManagement: React.FC<GuarantorManagementProps> = ({
  members,
  loans,
  guarantors,
  onAddGuarantor,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [amount, setAmount] = useState('');

  // Search member input inside selection
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering list
  const filteredGuarantors = guarantors.filter(g => {
    const term = searchTerm.toLowerCase();
    const borrowingMemberName = loans.find(l => l.id === g.loan_id)?.member_name || '';
    return (
      g.full_name.toLowerCase().includes(term) ||
      borrowingMemberName.toLowerCase().includes(term) ||
      g.relationship.toLowerCase().includes(term)
    );
  });

  const handleMemberSelect = (m: Member) => {
    setSelectedMemberId(m.id);
    setFullName(m.full_name);
    setPhoneNumber(m.phone_number);
    setMemberSearchTerm(m.full_name);
    setShowMemberDropdown(false);
  };

  const handleResetForm = () => {
    setSelectedLoanId('');
    setSelectedMemberId('');
    setFullName('');
    setPhoneNumber('');
    setRelationship('Friend');
    setAmount('');
    setMemberSearchTerm('');
    setShowMemberDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedLoanId) {
      setErrorMsg('Please select a loan profile to guarantee.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Guaranteed amount must be a positive number.');
      return;
    }

    // Verify guaranteed amount doesn't exceed loan principal
    const targetLoan = loans.find(l => l.id === selectedLoanId);
    if (targetLoan && numAmount > targetLoan.principal) {
      setErrorMsg(`Guaranteed amount cannot exceed the total loan principal of GHS ${targetLoan.principal.toLocaleString()}.`);
      return;
    }

    // Check borrower is not guarantor
    if (targetLoan && targetLoan.member_id === selectedMemberId) {
      setErrorMsg('A borrower cannot act as a guarantor for their own loan.');
      return;
    }

    try {
      await onAddGuarantor({
        loan_id: selectedLoanId,
        member_id: selectedMemberId || undefined,
        full_name: fullName,
        phone_number: phoneNumber,
        relationship,
        amount: numAmount
      });

      setSuccessMsg('Guarantor linked successfully!');
      handleResetForm();

      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to map guarantor.');
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
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Guarantor Portfolio</h2>
          <span className="text-muted" style={{ fontSize: '13px' }}>Monitor outstanding loan guarantees and co-signer exposure.</span>
        </div>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={() => { handleResetForm(); setShowAddModal(true); }}>
            <Plus size={18} /> Link Guarantor
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
        <Search size={18} className="text-muted" />
        <input
          type="text"
          placeholder="Search guarantors, borrowers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
        />
      </div>

      {/* Guarantors Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Guarantor Name</th>
              <th>Phone Number</th>
              <th>Relationship</th>
              <th>Guaranteed Member (Borrower)</th>
              <th className="text-right">Guaranteed Amount</th>
              <th>Loan Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuarantors.map(g => {
              const loan = loans.find(l => l.id === g.loan_id);
              return (
                <tr key={g.id}>
                  <td className="bold">
                    {g.full_name}
                    {g.member_id && <span className="badge badge-info" style={{ marginLeft: '6px', fontSize: '9px' }}>Registered</span>}
                  </td>
                  <td>{g.phone_number}</td>
                  <td>{g.relationship}</td>
                  <td>
                    {loan ? (
                      <div>
                        <div className="bold">{loan.member_name}</div>
                        <span className="text-muted" style={{ fontSize: '11px' }}>Principal: GHS {loan.principal.toLocaleString()}</span>
                      </div>
                    ) : 'Unknown Loan Profile'}
                  </td>
                  <td className="text-right bold" style={{ color: 'var(--primary-dark)' }}>
                    GHS {g.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    {loan ? (
                      <span className={`badge ${
                        loan.status === 'disbursed' || loan.status === 'active' ? 'badge-danger' :
                        loan.status === 'repaid' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {loan.status === 'repaid' ? 'No Risk (Repaid)' : loan.status === 'disbursed' ? 'Active Exposure' : loan.status}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              );
            })}
            {filteredGuarantors.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-16 text-muted">No guarantor profiles found matching search criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Guarantor Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Link Guarantor to Loan</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
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

                {/* Select Loan */}
                <div className="form-group">
                  <label>Select active Loan Profile *</label>
                  <select value={selectedLoanId} onChange={(e) => setSelectedLoanId(e.target.value)} required>
                    <option value="">-- Choose Loan Profile --</option>
                    {loans.filter(l => l.status !== 'repaid' && l.status !== 'rejected').map(l => (
                      <option key={l.id} value={l.id}>
                        {l.member_name} - GHS {l.principal.toLocaleString()} ({l.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Member (Searchable selection) */}
                <div className="form-group searchable-select-container">
                  <label>Link to Registered Member (Optional)</label>
                  <input
                    type="text"
                    className="searchable-select-input"
                    value={memberSearchTerm}
                    onChange={(e) => {
                      setMemberSearchTerm(e.target.value);
                      setShowMemberDropdown(true);
                      if (selectedMemberId) {
                        setSelectedMemberId('');
                        setFullName('');
                        setPhoneNumber('');
                      }
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    placeholder="Search by name, account code..."
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
                  {selectedMemberId && (
                    <span className="text-success bold" style={{ fontSize: '11px', marginTop: '2px', display: 'block' }}>
                      Linked to member account!
                    </span>
                  )}
                </div>

                {/* Full Name & Phone (Autofilled if member selected, otherwise manual input) */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Guarantor Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter Full Name"
                      required
                      disabled={!!selectedMemberId}
                    />
                  </div>
                  <div className="form-group">
                    <label>Guarantor Phone Number *</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +233..."
                      required
                      disabled={!!selectedMemberId}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Relationship *</label>
                    <select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
                      <option value="Spouse">Spouse</option>
                      <option value="Friend">Friend</option>
                      <option value="Business Partner">Business Partner</option>
                      <option value="Colleague">Colleague</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Pastor">Pastor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Guaranteed Amount (GHS) *</label>
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
                </div>

              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Link Guarantor</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
