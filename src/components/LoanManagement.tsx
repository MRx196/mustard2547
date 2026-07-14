import React, { useState } from 'react';
import type { Member, Loan } from '../db/supabase';
import { Search, Check, X, ShieldAlert, AlertCircle } from 'lucide-react';

interface LoanManagementProps {
  members: Member[];
  loans: Loan[];
  onApplyLoan: (loanData: Omit<Loan, 'id' | 'status' | 'monthly_installment' | 'outstanding_balance' | 'created_at'>) => void;
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
  const [activeTab, setActiveTab] = useState<'directory' | 'guarantors' | 'apply'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Repayment form state
  const [showRepayModal, setShowRepayModal] = useState<Loan | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  
  // Application form state
  const [appMemberId, setAppMemberId] = useState('');
  const [appPrincipal, setAppPrincipal] = useState('');
  const [appInterest, setAppInterest] = useState('12'); // default 12%
  const [appTerm, setAppTerm] = useState('6'); // default 6 months
  const [appGuarantorId, setAppGuarantorId] = useState('');
  const [appCollateral, setAppCollateral] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter Loans list
  const filteredLoans = loans.filter(l => {
    const term = searchTerm.toLowerCase();
    return (
      l.member_name.toLowerCase().includes(term) ||
      l.guarantor_name.toLowerCase().includes(term) ||
      l.status.toLowerCase().includes(term)
    );
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!appMemberId) {
      setErrorMsg('Please select the applying member.');
      return;
    }

    if (!appGuarantorId) {
      setErrorMsg('Please select a guarantor.');
      return;
    }

    if (appMemberId === appGuarantorId) {
      setErrorMsg('A member cannot guarantee their own loan.');
      return;
    }

    const principalVal = Number(appPrincipal);
    const interestVal = Number(appInterest);
    const termVal = Number(appTerm);

    if (isNaN(principalVal) || principalVal <= 0) {
      setErrorMsg('Loan principal must be a positive number.');
      return;
    }

    const member = members.find(m => m.id === appMemberId);
    const guarantor = members.find(m => m.id === appGuarantorId);

    if (!member || !guarantor) {
      setErrorMsg('Member or Guarantor not found.');
      return;
    }

    onApplyLoan({
      member_id: appMemberId,
      member_name: member.full_name,
      principal: principalVal,
      interest_rate: interestVal,
      term_months: termVal,
      guarantor_id: appGuarantorId,
      guarantor_name: guarantor.full_name,
      collateral: appCollateral || 'None specified'
    });

    setSuccessMsg('Loan application submitted successfully!');
    setAppMemberId('');
    setAppGuarantorId('');
    setAppPrincipal('');
    setAppCollateral('');

    setTimeout(() => {
      setActiveTab('directory');
      setSuccessMsg('');
    }, 1500);
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!showRepayModal) return;

    const amountVal = Number(repayAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setErrorMsg('Please enter a valid positive repayment amount.');
      return;
    }

    if (amountVal > showRepayModal.outstanding_balance) {
      setErrorMsg(`Repayment amount exceeds outstanding balance of GHS ${showRepayModal.outstanding_balance.toFixed(2)}.`);
      return;
    }

    onRepayLoan(showRepayModal.id, amountVal);
    setSuccessMsg('Repayment posted successfully!');
    setRepayAmount('');
    
    setTimeout(() => {
      setShowRepayModal(null);
      setSuccessMsg('');
    }, 1500);
  };

  // Generate Amortization Schedule
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

  const canApprove = userRole === 'Super Admin' || userRole === 'Administrator' || userRole === 'Loan Officer';
  const isMemberRole = userRole === 'Member';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Sub tabs */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`} onClick={() => setActiveTab('directory')}>
          Active & Applied Loans
        </button>
        <button className={`tab-btn ${activeTab === 'guarantors' ? 'active' : ''}`} onClick={() => setActiveTab('guarantors')}>
          Guarantors Tracking
        </button>
        {!isMemberRole && (
          <button className={`tab-btn ${activeTab === 'apply' ? 'active' : ''}`} onClick={() => setActiveTab('apply')}>
            New Loan Request
          </button>
        )}
      </div>

      {activeTab === 'directory' && (
        <div className="flex flex-col gap-16">
          <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search loan ledger..."
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
                  <th>Ref ID</th>
                  <th>Member Name</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Guarantor</th>
                  <th>Monthly Repay</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map(l => (
                  <tr key={l.id}>
                    <td className="bold" style={{ fontSize: '11px', color: 'var(--primary)' }}>{l.id.toUpperCase()}</td>
                    <td className="bold">{l.member_name}</td>
                    <td className="bold">GHS {l.principal.toLocaleString()}</td>
                    <td>{l.interest_rate}% ({l.term_months} mos)</td>
                    <td style={{ fontSize: '13px' }}>
                      <div className="bold">{l.guarantor_name}</div>
                      <span className="text-muted" style={{ fontSize: '11px' }}>ID Ref: {l.guarantor_id.substring(0, 5)}</span>
                    </td>
                    <td>GHS {l.monthly_installment}</td>
                    <td className="bold" style={{ color: 'var(--danger)' }}>
                      GHS {l.outstanding_balance.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${
                        l.status === 'disbursed' || l.status === 'active' ? 'badge-success' :
                        l.status === 'pending' ? 'badge-warning' :
                        l.status === 'approved' ? 'badge-info' :
                        l.status === 'repaid' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex gap-8 justify-center">
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setSelectedLoan(l)}>
                          Details
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
                ))}
                {filteredLoans.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center p-16 text-muted">No loans found matching filter criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'guarantors' && (
        <div className="card">
          <div className="card-title">Guarantor Risk Ledger</div>
          <p className="text-muted" style={{ fontSize: '13px', marginTop: '-12px', marginBottom: '20px' }}>
            List of members who have guaranteed loan requests, and their exposure details.
          </p>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Guarantor Name</th>
                  <th>Member Guaranteed</th>
                  <th>Loan Amount</th>
                  <th>Monthly Installment</th>
                  <th>Outstanding Balance</th>
                  <th>Exposure Risk</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id}>
                    <td className="bold">{l.guarantor_name}</td>
                    <td>
                      <div className="bold">{l.member_name}</div>
                      <span className="text-muted" style={{ fontSize: '11px' }}>Loan ID: {l.id.toUpperCase()}</span>
                    </td>
                    <td>GHS {l.principal.toLocaleString()}</td>
                    <td>GHS {l.monthly_installment}</td>
                    <td className="bold" style={{ color: 'var(--primary-dark)' }}>GHS {l.outstanding_balance.toLocaleString()}</td>
                    <td>
                      {l.status === 'repaid' ? (
                        <span className="badge badge-success">No Risk (Repaid)</span>
                      ) : l.outstanding_balance > 0 ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldAlert size={12} /> Active Exposure
                        </span>
                      ) : (
                        <span className="badge badge-warning">Pending Approval</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'apply' && (
        <div className="card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="card-title">Submit New Loan Application</div>
          
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
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="form-group">
                <label>Borrowing Member *</label>
                <select value={appMemberId} onChange={(e) => setAppMemberId(e.target.value)} required>
                  <option value="">-- Choose Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.account_number} - {m.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Principal Amount (GHS) *</label>
                  <input
                    type="number"
                    value={appPrincipal}
                    onChange={(e) => setAppPrincipal(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Interest Rate (% Flat) *</label>
                  <select value={appInterest} onChange={(e) => setAppInterest(e.target.value)}>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="12">12%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Repayment Term (Months) *</label>
                  <select value={appTerm} onChange={(e) => setAppTerm(e.target.value)}>
                    <option value="3">3 Months</option>
                    <option value="4">4 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Guarantor Member (Must be different member) *</label>
                <select value={appGuarantorId} onChange={(e) => setAppGuarantorId(e.target.value)} required>
                  <option value="">-- Choose Guarantor --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} disabled={m.id === appMemberId}>
                      {m.account_number} - {m.full_name} {m.id === appMemberId ? '(Applicant)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Collateral Details *</label>
                <textarea
                  value={appCollateral}
                  onChange={(e) => setAppCollateral(e.target.value)}
                  placeholder="Describe items offered as security (e.g. equipment, shop inventory, land documents)"
                  rows={3}
                  required
                />
              </div>

              {appPrincipal && appTerm && appInterest && (
                <div className="p-16" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--primary)', fontSize: '13px' }}>
                  <div className="flex justify-between">
                    <span>Total Repayable:</span>
                    <span className="bold">
                      GHS {(Number(appPrincipal) * (1 + Number(appInterest)/100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-8">
                    <span>Estimated Monthly Installment:</span>
                    <span className="bold" style={{ color: 'var(--primary)', fontSize: '15px' }}>
                      GHS {((Number(appPrincipal) * (1 + Number(appInterest)/100)) / Number(appTerm)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

            </div>
            
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary w-full">Submit Loan Request</button>
            </div>
          </form>
        </div>
      )}

      {/* Loan Details & Amortization Modal */}
      {selectedLoan && (
        <div className="modal-backdrop" onClick={() => setSelectedLoan(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Amortization Schedule: Loan Ref {selectedLoan.id.substring(0, 8).toUpperCase()}</h2>
              <button className="modal-close" onClick={() => setSelectedLoan(null)}>&times;</button>
            </div>

            <div className="flex flex-col gap-16" style={{ fontSize: '13px' }}>
              <div className="grid-2col" style={{ gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div>
                  <div><span className="text-muted">Borrower:</span> <span className="bold">{selectedLoan.member_name}</span></div>
                  <div><span className="text-muted">Principal:</span> <span className="bold">GHS {selectedLoan.principal}</span></div>
                  <div><span className="text-muted">Guarantor:</span> <span>{selectedLoan.guarantor_name}</span></div>
                </div>
                <div>
                  <div><span className="text-muted">Interest Rate:</span> <span>{selectedLoan.interest_rate}% Flat</span></div>
                  <div><span className="text-muted">Term:</span> <span>{selectedLoan.term_months} Months</span></div>
                  <div><span className="text-muted">Monthly Repay:</span> <span className="bold" style={{ color: 'var(--primary)' }}>GHS {selectedLoan.monthly_installment}</span></div>
                </div>
              </div>

              <div className="bold" style={{ fontSize: '14px', margin: '4px 0' }}>Amortization Plan</div>
              
              <div className="table-container" style={{ maxHeight: '250px' }}>
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
                        <td className="bold" style={{ color: 'var(--primary)' }}>GHS {row.closing.toFixed(2)}</td>
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

      {/* Repay Loan Modal */}
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
                  <div>Monthly Due Amount: <span className="bold">GHS {showRepayModal.monthly_installment}</span></div>
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
                  />
                  <span className="text-muted" style={{ fontSize: '10px', marginTop: '2px', display: 'block' }}>
                    Note: 90% is allocated to Principal repayment and 10% is posted as Interest income under double entry guidelines.
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
