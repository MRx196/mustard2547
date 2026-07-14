import React, { useState } from 'react';
import type { Member, Loan } from '../db/supabase';
import { Plus, Search, Check, X, AlertCircle, CheckCircle } from 'lucide-react';

interface LoanManagementProps {
  members: Member[];
  loans: Loan[];
  onApplyLoan: (loanData: { member_id: string; member_name: string; principal: number; interest_rate: number; term_months: number; purpose: string; collateral: string }) => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected' | 'disbursed') => void;
  onRepayLoan: (id: string, amount: number) => void;
  userRole: string;
}

export const LoanManagement: React.FC<LoanManagementProps> = ({
  members,
  loans,
  onApplyLoan,
  onUpdateStatus,
  onRepayLoan,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState<Loan | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Apply Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [principal, setPrincipal] = useState('');
  const [term, setTerm] = useState('6');
  const [interest, setInterest] = useState('10');
  const [purpose, setPurpose] = useState('');
  const [collateral, setCollateral] = useState('');

  // Search member input inside selection
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Repay Form State
  const [repayAmount, setRepayAmount] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter Loans
  const filteredLoans = loans.filter(l =>
    l.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberSelect = (m: Member) => {
    setSelectedMemberId(m.id);
    setMemberSearchTerm(m.full_name);
    setShowMemberDropdown(false);
  };

  const handleOpenApply = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSelectedMemberId('');
    setPrincipal('');
    setTerm('6');
    setInterest('10');
    setPurpose('');
    setCollateral('');
    setMemberSearchTerm('');
    setShowMemberDropdown(false);
    setShowApplyModal(true);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedMemberId) {
      setErrorMsg('Please select a member.');
      return;
    }

    const principalVal = Number(principal);
    const interestVal = Number(interest);
    const termVal = Number(term);

    if (isNaN(principalVal) || principalVal <= 0) {
      setErrorMsg('Loan principal must be a positive number.');
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    onApplyLoan({
      member_id: selectedMemberId,
      member_name: member.full_name,
      principal: principalVal,
      interest_rate: interestVal,
      term_months: termVal,
      purpose,
      collateral: collateral || 'None'
    });

    setSuccessMsg('Loan application submitted successfully!');
    setTimeout(() => {
      setShowApplyModal(false);
      setSuccessMsg('');
    }, 1200);
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!showRepayModal) return;

    const amountVal = Number(repayAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setErrorMsg('Enter a valid positive repayment amount.');
      return;
    }

    if (amountVal > showRepayModal.outstanding_balance) {
      setErrorMsg(`Repayment amount exceeds outstanding balance of GHS ${showRepayModal.outstanding_balance.toLocaleString()}.`);
      return;
    }

    onRepayLoan(showRepayModal.id, amountVal);
    setSuccessMsg('Loan repayment posted successfully!');
    setRepayAmount('');

    setTimeout(() => {
      setShowRepayModal(null);
      setSuccessMsg('');
    }, 1200);
  };

  const generateAmortization = (loan: Loan) => {
    const flatInterestPerMonth = (loan.principal * (loan.interest_rate / 100)) / loan.term_months;
    const principalPerMonth = loan.principal / loan.term_months;
    const monthlyInstallment = loan.monthly_installment;

    const schedule = [];
    let remainingPrincipal = loan.principal;

    for (let i = 1; i <= loan.term_months; i++) {
      const closing = Math.max(0, remainingPrincipal - principalPerMonth);
      schedule.push({
        month: i,
        opening: remainingPrincipal,
        installment: monthlyInstallment,
        interest: flatInterestPerMonth,
        principal: principalPerMonth,
        closing
      });
      remainingPrincipal = closing;
    }
    return schedule;
  };

  const canApprove = userRole === 'Super Administrator' || userRole === 'Super Admin' || userRole === 'Administrator';
  const isMemberRole = userRole === 'Member' || userRole === 'Auditor';

  // Filter members list based on memberSearchTerm in selection box
  const searchableMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    m.account_number.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Header section */}
      <div className="flex justify-between align-center">
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Loans Ledger</h2>
          <span className="text-muted" style={{ fontSize: '13px' }}>Monitor loan disbursements, outstanding balances, and terms.</span>
        </div>
        {!isMemberRole && (
          <button className="btn btn-primary" onClick={handleOpenApply}>
            <Plus size={18} /> New Loan
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
          <Search size={18} className="text-muted" />
          <input
            type="text"
            placeholder="Search loans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
          />
        </div>
      </div>

      {/* Loans Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Loan Amount</th>
              <th>Interest</th>
              <th className="text-right">Amount Paid</th>
              <th className="text-right">Outstanding Balance</th>
              <th>Status</th>
              <th>Date Granted</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map(l => {
              const totalRepayable = l.principal * (1 + (l.interest_rate / 100));
              const amountPaid = Math.max(0, totalRepayable - l.outstanding_balance);
              return (
                <tr key={l.id}>
                  <td className="bold">{l.member_name}</td>
                  <td className="bold">GHS {l.principal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td>{l.interest_rate}% ({l.term_months} mos)</td>
                  <td className="text-right text-success bold">
                    GHS {amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right text-danger bold">
                    GHS {l.outstanding_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={`badge ${
                      l.status === 'disbursed' || l.status === 'active' ? 'badge-danger' :
                      l.status === 'pending' ? 'badge-warning' :
                      l.status === 'approved' ? 'badge-info' :
                      l.status === 'repaid' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-center">
                    <div className="flex gap-8 justify-center">
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setSelectedLoan(l)}>
                        Plan
                      </button>
                      {l.status === 'pending' && canApprove && (
                        <>
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--success)' }} onClick={() => onUpdateStatus(l.id, 'approved')}>
                            <Check size={14} /> Approve
                          </button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => onUpdateStatus(l.id, 'rejected')}>
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}
                      {l.status === 'approved' && canApprove && (
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => onUpdateStatus(l.id, 'disbursed')}>
                          Disburse
                        </button>
                      )}
                      {(l.status === 'disbursed' || l.status === 'active') && !isMemberRole && (
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setShowRepayModal(l)}>
                          Repay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredLoans.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-16 text-muted">No loans found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Loan Application Modal (with searchable member selection dropdown) */}
      {showApplyModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">New Loan Application</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleApplySubmit}>
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

                {/* Searchable Select Borrower */}
                <div className="form-group searchable-select-container">
                  <label>Select Member (Searchable) *</label>
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
                    required
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
                    <label>Principal Amount (GHS) *</label>
                    <input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '120px' }}>
                    <label>Term (Months) *</label>
                    <select value={term} onChange={(e) => setTerm(e.target.value)}>
                      <option value="3">3 Mos</option>
                      <option value="4">4 Mos</option>
                      <option value="6">6 Mos</option>
                      <option value="12">12 Mos</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ maxWidth: '120px' }}>
                    <label>Interest Rate (%) *</label>
                    <select value={interest} onChange={(e) => setInterest(e.target.value)}>
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                      <option value="12">12%</option>
                      <option value="15">15%</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Purpose of Loan *</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Purchase agricultural fertilizer, store inventory expansion"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Collateral Description *</label>
                  <textarea
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                    placeholder="Provide details about items pledged (e.g., equipment serial codes)"
                    rows={2}
                    required
                  />
                </div>

              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Details schedule preview */}
      {selectedLoan && (
        <div className="modal-backdrop" onClick={() => setSelectedLoan(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Amortization Plan: Loan Ref {selectedLoan.id.substring(0, 8).toUpperCase()}</h2>
              <button className="modal-close" onClick={() => setSelectedLoan(null)}>&times;</button>
            </div>

            <div className="flex flex-col gap-16" style={{ fontSize: '13px' }}>
              <div className="grid-2col" style={{ gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div>
                  <div><span className="text-muted">Borrower:</span> <span className="bold">{selectedLoan.member_name}</span></div>
                  <div><span className="text-muted">Principal:</span> <span className="bold">GHS {selectedLoan.principal}</span></div>
                  <div><span className="text-muted">Rate/Term:</span> <span>{selectedLoan.interest_rate}% Flat / {selectedLoan.term_months} mos</span></div>
                </div>
                <div>
                  <div><span className="text-muted">Monthly Repay:</span> <span className="bold text-success">GHS {selectedLoan.monthly_installment}</span></div>
                  <div><span className="text-muted">Outstanding Balance:</span> <span className="bold text-danger">GHS {selectedLoan.outstanding_balance}</span></div>
                </div>
              </div>

              <div className="bold" style={{ fontSize: '14px' }}>Amortization Plan Schedule</div>
              
              <div className="table-container" style={{ maxHeight: '200px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Opening Bal</th>
                      <th>Installment</th>
                      <th>Interest</th>
                      <th>Principal</th>
                      <th>Closing Bal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateAmortization(selectedLoan).map((row, idx) => (
                      <tr key={idx}>
                        <td>Month {row.month}</td>
                        <td>GHS {row.opening.toFixed(2)}</td>
                        <td className="bold">GHS {row.installment.toFixed(2)}</td>
                        <td>GHS {row.interest.toFixed(2)}</td>
                        <td>GHS {row.principal.toFixed(2)}</td>
                        <td className="bold" style={{ color: 'var(--primary-light)' }}>GHS {row.closing.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <span className="text-muted">Collateral Detail:</span>
                <p className="p-8" style={{ background: 'var(--bg-main)', borderRadius: '6px', fontStyle: 'italic', marginTop: '4px' }}>
                  {selectedLoan.collateral}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedLoan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Repay Modal */}
      {showRepayModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Record Repayment: {showRepayModal.member_name}</h2>
              <button className="modal-close" onClick={() => setShowRepayModal(null)}>&times;</button>
            </div>
            
            <form onSubmit={handleRepaySubmit}>
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

                <div style={{ fontSize: '13px' }}>
                  <div>Outstanding Loan Balance: <span className="bold text-danger">GHS {showRepayModal.outstanding_balance.toLocaleString()}</span></div>
                  <div>Monthly installment: <span className="bold">GHS {showRepayModal.monthly_installment}</span></div>
                </div>

                <div className="form-group">
                  <label>Repayment Amount (GHS) *</label>
                  <input
                    type="number"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                    autoFocus
                  />
                  <span className="text-muted" style={{ fontSize: '10px', marginTop: '2px', display: 'block' }}>
                    Note: 90% is posted as principal deduction and 10% is credit allocated to Interest revenue.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowRepayModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post Repayment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
