import React, { useState } from 'react';
import type { Member, Beneficiary } from '../db/supabase';
import { Plus, Search, View, AlertCircle, Trash2, CheckCircle } from 'lucide-react';

interface MemberManagementProps {
  members: Member[];
  beneficiaries: Beneficiary[];
  onAddMember: (member: Omit<Member, 'id' | 'account_number' | 'created_at'>, beneficiaries: Omit<Beneficiary, 'id' | 'member_id'>[]) => void;
  userRole: string;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  members,
  beneficiaries,
  onAddMember,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [houseNoGps, setHouseNoGps] = useState('');
  const [landmark, setLandmark] = useState('');
  const [congregation, setCongregation] = useState('');
  const [email, setEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Beneficiaries State (pre-populate with 5 empty rows to encourage filling 5)
  const emptyBeneficiary = {
    full_name: '',
    age: 0,
    percentage: 0,
    house_number: '',
    marital_status: 'Single',
    relationship: 'Child',
    phone_number: ''
  };

  const [beneficiariesForm, setBeneficiariesForm] = useState<Omit<Beneficiary, 'id' | 'member_id'>[]>([
    { ...emptyBeneficiary, relationship: 'Spouse', percentage: 40 },
    { ...emptyBeneficiary, relationship: 'Child', percentage: 15 },
    { ...emptyBeneficiary, relationship: 'Child', percentage: 15 },
    { ...emptyBeneficiary, relationship: 'Child', percentage: 15 },
    { ...emptyBeneficiary, relationship: 'Sister', percentage: 15 }
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-calculated next account number
  const nextAccountNumber = `SDMS ${String(members.length + 1).padStart(4, '0')}`;

  // Filtering
  const filteredMembers = members.filter(m => {
    const term = searchTerm.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(term) ||
      m.account_number.toLowerCase().includes(term) ||
      m.phone_number.toLowerCase().includes(term) ||
      m.congregation.toLowerCase().includes(term) ||
      (m.group_name && m.group_name.toLowerCase().includes(term))
    );
  });

  const handleAddBeneficiaryField = () => {
    setBeneficiariesForm([...beneficiariesForm, { ...emptyBeneficiary }]);
  };

  const handleRemoveBeneficiaryField = (idx: number) => {
    setBeneficiariesForm(beneficiariesForm.filter((_, i) => i !== idx));
  };

  const handleBeneficiaryChange = (index: number, field: string, val: any) => {
    const updated = [...beneficiariesForm];
    updated[index] = {
      ...updated[index],
      [field]: field === 'age' || field === 'percentage' ? Number(val) : val
    };
    setBeneficiariesForm(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation checks
    if (!fullName || !dob || !houseNoGps || !landmark || !congregation || !occupation || !phoneNumber) {
      setErrorMsg('Please fill in all required personal details fields.');
      return;
    }

    // Check at least 5 beneficiaries
    const activeBeneficiaries = beneficiariesForm.filter(b => b.full_name.trim() !== '');
    if (activeBeneficiaries.length < 5) {
      setErrorMsg('Requirement violation: At least 5 beneficiary nominations are required for registration.');
      return;
    }

    // Check sum of percentages is exactly 100%
    const totalPct = activeBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (Math.abs(totalPct - 100) > 0.01) {
      setErrorMsg(`Total percentage allocation must sum to exactly 100%. Current sum: ${totalPct}%`);
      return;
    }

    // Submit
    onAddMember(
      {
        full_name: fullName,
        gender,
        dob,
        marital_status: maritalStatus,
        house_no_gps: houseNoGps,
        landmark,
        congregation,
        email,
        group_name: groupName,
        occupation,
        phone_number: phoneNumber
      },
      activeBeneficiaries
    );

    // Reset Form
    setFullName('');
    setGender('Male');
    setDob('');
    setMaritalStatus('Single');
    setHouseNoGps('');
    setLandmark('');
    setCongregation('');
    setEmail('');
    setGroupName('');
    setOccupation('');
    setPhoneNumber('');
    setBeneficiariesForm([
      { ...emptyBeneficiary, relationship: 'Spouse', percentage: 40 },
      { ...emptyBeneficiary, relationship: 'Child', percentage: 15 },
      { ...emptyBeneficiary, relationship: 'Child', percentage: 15 },
      { ...emptyBeneficiary, relationship: 'Child', percentage: 15 },
      { ...emptyBeneficiary, relationship: 'Sister', percentage: 15 }
    ]);
    
    setSuccessMsg('Member registered successfully!');
    setTimeout(() => {
      setShowAddModal(false);
      setSuccessMsg('');
    }, 1500);
  };

  const isReadOnly = userRole === 'Member' || userRole === 'Collection Officer';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Search and Action Bar */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
          <Search size={18} className="text-muted" />
          <input
            type="text"
            placeholder="Search members, accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
          />
        </div>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Register Member
          </button>
        )}
      </div>

      {/* Main Directory Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Congregation</th>
              <th>Group Fellowship</th>
              <th>Registered Date</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((m) => (
              <tr key={m.id}>
                <td className="bold" style={{ color: 'var(--primary)' }}>{m.account_number}</td>
                <td>
                  <div className="bold">{m.full_name}</div>
                  <span className="text-muted" style={{ fontSize: '11px' }}>{m.occupation}</span>
                </td>
                <td>{m.phone_number}</td>
                <td>{m.congregation}</td>
                <td>{m.group_name || 'N/A'}</td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                <td className="text-center">
                  <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => setSelectedMember(m)}>
                    <View size={14} style={{ marginRight: '4px' }} /> View Profile
                  </button>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-16 text-muted">No members found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Detail Dialog */}
      {selectedMember && (
        <div className="modal-backdrop" onClick={() => setSelectedMember(null)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Member Profile: {selectedMember.account_number}</h2>
              <button className="modal-close" onClick={() => setSelectedMember(null)}>&times;</button>
            </div>
            
            <div className="flex flex-col gap-16" style={{ fontSize: '14px' }}>
              <div className="grid-2col" style={{ gap: '16px' }}>
                <div>
                  <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '4px', margin: '0 0 10px 0' }}>Personal Particulars</h4>
                  <div className="flex flex-col gap-8">
                    <div><span className="text-muted">Full Name:</span> <span className="bold">{selectedMember.full_name}</span></div>
                    <div><span className="text-muted">Gender:</span> <span>{selectedMember.gender}</span></div>
                    <div><span className="text-muted">Date of Birth:</span> <span>{selectedMember.dob}</span></div>
                    <div><span className="text-muted">Marital Status:</span> <span>{selectedMember.marital_status}</span></div>
                    <div><span className="text-muted">Occupation:</span> <span>{selectedMember.occupation}</span></div>
                  </div>
                </div>
                <div>
                  <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '4px', margin: '0 0 10px 0' }}>Contact & Location</h4>
                  <div className="flex flex-col gap-8">
                    <div><span className="text-muted">Phone Number:</span> <span>{selectedMember.phone_number}</span></div>
                    <div><span className="text-muted">Email Address:</span> <span>{selectedMember.email || 'N/A'}</span></div>
                    <div><span className="text-muted">Congregation:</span> <span>{selectedMember.congregation}</span></div>
                    <div><span className="text-muted">House GPS:</span> <span style={{ fontFamily: 'monospace' }}>{selectedMember.house_no_gps}</span></div>
                    <div><span className="text-muted">Landmark:</span> <span>{selectedMember.landmark}</span></div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '4px', margin: '0 0 10px 0' }}>Beneficiary Nominations</h4>
                <div className="table-container" style={{ maxHeight: '250px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Beneficiary Name</th>
                        <th>Relationship</th>
                        <th>Age</th>
                        <th>Share (%)</th>
                        <th>Phone</th>
                        <th>GPS Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {beneficiaries
                        .filter(b => b.member_id === selectedMember.id)
                        .map(b => (
                          <tr key={b.id}>
                            <td className="bold">{b.full_name}</td>
                            <td>{b.relationship}</td>
                            <td>{b.age} years</td>
                            <td className="bold" style={{ color: 'var(--primary)' }}>{b.percentage}%</td>
                            <td>{b.phone_number}</td>
                            <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{b.house_number}</td>
                          </tr>
                        ))}
                      {beneficiaries.filter(b => b.member_id === selectedMember.id).length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted">No beneficiaries nominated.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedMember(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Register New Member (Next Acc: {nextAccountNumber})</h2>
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

                {/* Section 1: Personal Details */}
                <h3 style={{ margin: '0 0 8px 0', borderBottom: '2px solid var(--primary)', paddingBottom: '4px', fontSize: '16px' }}>
                  Personal Information
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter Full Name" required />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Marital Status *</label>
                    <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number (SMS Target) *</label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +233244123456" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. member@email.com" />
                  </div>
                  <div className="form-group">
                    <label>Occupation *</label>
                    <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Farmer, Trader" required />
                  </div>
                  <div className="form-group">
                    <label>Congregation / Church *</label>
                    <input type="text" value={congregation} onChange={(e) => setCongregation(e.target.value)} placeholder="e.g. Assembly of God Sege" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>House Number or GPS Address *</label>
                    <input type="text" value={houseNoGps} onChange={(e) => setHouseNoGps(e.target.value)} placeholder="e.g. SG-102-1244" required />
                  </div>
                  <div className="form-group">
                    <label>Landmark (GPS backup) *</label>
                    <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Near Sege Market" required />
                  </div>
                  <div className="form-group">
                    <label>Group / Fellowship Name</label>
                    <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Mustard Seed Welfare Group" />
                  </div>
                </div>

                {/* Section 2: Beneficiary Nomination */}
                <div className="flex justify-between align-center" style={{ margin: '16px 0 8px 0', borderBottom: '2px solid var(--primary)', paddingBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>
                    Beneficiary Nominations (Minimum 5 required)
                  </h3>
                  <button type="button" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={handleAddBeneficiaryField}>
                    + Add Nomination
                  </button>
                </div>
                
                <p className="text-muted" style={{ fontSize: '12px', marginTop: '-8px' }}>
                  Specify the details of at least 5 individuals. The sum of all shares must equal exactly 100%.
                </p>

                <div className="beneficiary-list-editor">
                  {beneficiariesForm.map((b, idx) => (
                    <div key={idx} className="beneficiary-item-card">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nomination #{idx + 1} Name *</label>
                          <input type="text" value={b.full_name} onChange={(e) => handleBeneficiaryChange(idx, 'full_name', e.target.value)} placeholder="Full Name" required={idx < 5} />
                        </div>
                        <div className="form-group" style={{ maxWidth: '90px' }}>
                          <label>Age *</label>
                          <input type="number" value={b.age || ''} onChange={(e) => handleBeneficiaryChange(idx, 'age', e.target.value)} placeholder="Age" required={idx < 5} min={0} />
                        </div>
                        <div className="form-group" style={{ maxWidth: '100px' }}>
                          <label>Share (%) *</label>
                          <input type="number" value={b.percentage || ''} onChange={(e) => handleBeneficiaryChange(idx, 'percentage', e.target.value)} placeholder="%" required={idx < 5} min={0} max={100} />
                        </div>
                        <div className="form-group">
                          <label>Relationship *</label>
                          <select value={b.relationship} onChange={(e) => handleBeneficiaryChange(idx, 'relationship', e.target.value)}>
                            <option value="Spouse">Spouse</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Nephew">Nephew</option>
                            <option value="Niece">Niece</option>
                            <option value="Friend">Friend</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Phone Number *</label>
                          <input type="text" value={b.phone_number} onChange={(e) => handleBeneficiaryChange(idx, 'phone_number', e.target.value)} placeholder="Phone" required={idx < 5} />
                        </div>
                      </div>
                      
                      <div className="form-row" style={{ marginTop: '8px' }}>
                        <div className="form-group">
                          <label>House / GPS Address *</label>
                          <input type="text" value={b.house_number} onChange={(e) => handleBeneficiaryChange(idx, 'house_number', e.target.value)} placeholder="GPS Address" required={idx < 5} />
                        </div>
                        <div className="form-group">
                          <label>Marital Status</label>
                          <select value={b.marital_status} onChange={(e) => handleBeneficiaryChange(idx, 'marital_status', e.target.value)}>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                      </div>

                      {beneficiariesForm.length > 5 && (
                        <button type="button" className="beneficiary-remove-btn" onClick={() => handleRemoveBeneficiaryField(idx)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex align-center justify-between" style={{ padding: '8px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                  <span>Total Beneficiary Percentage:</span>
                  <span className={`bold ${Math.abs(beneficiariesForm.reduce((sum, b) => sum + b.percentage, 0) - 100) < 0.01 ? 'text-success' : 'text-danger'}`}>
                    {beneficiariesForm.reduce((sum, b) => sum + b.percentage, 0)}% (Must equal exactly 100%)
                  </span>
                </div>

              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Member Profile</button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
