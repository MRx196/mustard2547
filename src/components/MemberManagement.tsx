import React, { useState } from 'react';
import type { Member, Beneficiary, Congregation } from '../db/supabase';
import { Plus, Search, Edit, AlertCircle, Trash2, CheckCircle, Printer } from 'lucide-react';

interface MemberManagementProps {
  members: Member[];
  beneficiaries: Beneficiary[];
  congregations: Congregation[];
  onAddMember: (member: Omit<Member, 'id' | 'account_number' | 'created_at'>, beneficiaries: Omit<Beneficiary, 'id' | 'member_id'>[]) => void;
  onEditMember: (id: string, member: Omit<Member, 'id' | 'account_number' | 'created_at'>, beneficiaries: Omit<Beneficiary, 'id' | 'member_id'>[]) => void;
  userRole: string;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({
  members,
  beneficiaries,
  congregations,
  onAddMember,
  onEditMember,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
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

  // Beneficiaries State
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
    { ...emptyBeneficiary, relationship: 'Spouse', percentage: 100 }
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const nextAccountNumber = `SDMS ${String(members.length + 1).padStart(4, '0')}`;

  // Filter
  const filteredMembers = members.filter(m => {
    const term = searchTerm.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(term) ||
      m.account_number.toLowerCase().includes(term) ||
      m.phone_number.toLowerCase().includes(term) ||
      m.congregation.toLowerCase().includes(term)
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

  // Open Edit Mode
  const handleOpenEdit = (m: Member) => {
    setEditingId(m.id);
    setFullName(m.full_name);
    setGender(m.gender);
    setDob(m.dob);
    setMaritalStatus(m.marital_status);
    setHouseNoGps(m.house_no_gps || '');
    setLandmark(m.landmark || '');
    setCongregation(m.congregation);
    setEmail(m.email || '');
    setGroupName(m.group_name || '');
    setOccupation(m.occupation);
    setPhoneNumber(m.phone_number);

    // Get matching beneficiaries
    const activeB = beneficiaries.filter(b => b.member_id === m.id).map(b => ({
      full_name: b.full_name,
      age: b.age,
      percentage: b.percentage,
      house_number: b.house_number,
      marital_status: b.marital_status,
      relationship: b.relationship,
      phone_number: b.phone_number
    }));

    if (activeB.length === 0) {
      setBeneficiariesForm([
        { ...emptyBeneficiary, relationship: 'Spouse', percentage: 100 }
      ]);
    } else {
      setBeneficiariesForm(activeB);
    }

    setErrorMsg('');
    setSuccessMsg('');
    setShowEditModal(true);
  };

  const handleOpenPrint = (m: Member) => {
    setSelectedMember(m);
    setShowPrintModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName || !dob || !congregation || !occupation || !phoneNumber) {
      setErrorMsg('Please fill in all required member details fields.');
      return;
    }

    const activeBeneficiaries = beneficiariesForm.filter(b => b.full_name.trim() !== '');

    if (activeBeneficiaries.length > 0) {
      const totalPct = activeBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        setErrorMsg(`Total percentage allocation for beneficiaries must sum to exactly 100%. Current sum: ${totalPct}%`);
        return;
      }
    }

    try {
      const pkg = {
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
      };

      if (showEditModal && editingId) {
        onEditMember(editingId, pkg, activeBeneficiaries);
        setSuccessMsg('Member profile updated successfully!');
      } else {
        onAddMember(pkg, activeBeneficiaries);
        setSuccessMsg('Member registered successfully!');
      }

      setTimeout(() => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed.');
    }
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  const isReadOnly = userRole === 'Member' || userRole === 'Collection Officer';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Action Bar */}
      <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
          <Search size={18} className="text-muted" />
          <input
            type="text"
            placeholder="Search by name, account number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
          />
        </div>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={() => {
            setEditingId(null);
            setFullName('');
            setHouseNoGps('');
            setLandmark('');
            setCongregation(congregations[0]?.name || '');
            setPhoneNumber('');
            setOccupation('');
            setBeneficiariesForm([
              { ...emptyBeneficiary, relationship: 'Spouse', percentage: 40 },
              { ...emptyBeneficiary, relationship: 'Child', percentage: 15 },
              { ...emptyBeneficiary, relationship: 'Child', percentage: 15 },
              { ...emptyBeneficiary, relationship: 'Child', percentage: 15 },
              { ...emptyBeneficiary, relationship: 'Sister', percentage: 15 }
            ]);
            setErrorMsg('');
            setSuccessMsg('');
            setShowAddModal(true);
          }}>
            <Plus size={18} /> Register Member
          </button>
        )}
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
                  <div className="flex gap-8 justify-center">
                    <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={() => handleOpenPrint(m)}>
                      <Printer size={14} style={{ marginRight: '4px' }} /> Print
                    </button>
                    {!isReadOnly && (
                      <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '12px', borderColor: 'var(--secondary)' }} onClick={() => handleOpenEdit(m)}>
                        <Edit size={14} style={{ marginRight: '4px' }} /> Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-16 text-muted">No members found matching query filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profile summary modal layout optimized for PDF generation / Printing */}
      {showPrintModal && selectedMember && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Registration Summary (Acc: {selectedMember.account_number})</h2>
              <button className="modal-close" onClick={() => setShowPrintModal(false)}>&times;</button>
            </div>

            {/* Document Frame */}
            <div className="print-only-section print-preview-frame">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid var(--primary)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--primary)', fontFamily: 'var(--display)', fontSize: '22px' }}>MUSTARD SEED WELFARE FUND</h2>
                  <span style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>SEGE DISTRICT CREDIT UNION</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="bold" style={{ color: 'var(--primary)' }}>MEMBER CARD RECORD</div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Grid Profile info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13px', marginBottom: '24px' }}>
                <div>
                  <div><span style={{ color: '#64748b' }}>Account Number:</span> <span className="bold">{selectedMember.account_number}</span></div>
                  <div className="mt-8"><span style={{ color: '#64748b' }}>Full Name:</span> <span className="bold">{selectedMember.full_name}</span></div>
                  <div className="mt-8"><span style={{ color: '#64748b' }}>Gender:</span> <span>{selectedMember.gender}</span></div>
                  <div className="mt-8"><span style={{ color: '#64748b' }}>Date of Birth:</span> <span>{selectedMember.dob}</span></div>
                  <div className="mt-8"><span style={{ color: '#64748b' }}>Marital Status:</span> <span>{selectedMember.marital_status}</span></div>
                </div>
                <div>
                  <div><span style={{ color: '#64748b' }}>Phone Number:</span> <span>{selectedMember.phone_number}</span></div>
                  <div className="mt-8"><span style={{ color: '#64748b' }}>Email:</span> <span>{selectedMember.email || 'N/A'}</span></div>
                  <div className="mt-8"><span style={{ color: '#64748b' }}>GPS Address:</span> <span style={{ fontFamily: 'monospace' }}>{selectedMember.house_no_gps}</span></div>
                  <div className="mt-8"><span style={{ color: '#64748b' }}>Landmark:</span> <span>{selectedMember.landmark}</span></div>
                  <div className="mt-8"><span style={{ color: '#64748b' }}>Congregation:</span> <span>{selectedMember.congregation}</span></div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--primary)' }}>Nominated Beneficiaries</h4>
                <table style={{ width: '100%', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '8px' }}>Name</th>
                      <th style={{ padding: '8px' }}>Relationship</th>
                      <th style={{ padding: '8px' }}>Age</th>
                      <th style={{ padding: '8px' }}>Share (%)</th>
                      <th style={{ padding: '8px' }}>Phone Target</th>
                      <th style={{ padding: '8px' }}>GPS Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries
                      .filter(b => b.member_id === selectedMember.id)
                      .map((b, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px' }} className="bold">{b.full_name}</td>
                          <td style={{ padding: '8px' }}>{b.relationship}</td>
                          <td style={{ padding: '8px' }}>{b.age} yrs</td>
                          <td style={{ padding: '8px' }} className="bold text-success">{b.percentage}%</td>
                          <td style={{ padding: '8px' }}>{b.phone_number}</td>
                          <td style={{ padding: '8px', fontSize: '10px', fontFamily: 'monospace' }}>{b.house_number}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                <div style={{ textAlign: 'center', width: '200px', borderTop: '1px solid #94a3b8', paddingTop: '8px' }}>
                  Member's Signature
                </div>
                <div style={{ textAlign: 'center', width: '200px', borderTop: '1px solid #94a3b8', paddingTop: '8px' }}>
                  Authorized Officer
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowPrintModal(false)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={handlePrintTrigger}>
                <Printer size={16} /> Print Profile PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {showEditModal ? 'Edit Member Profile' : `Register New Member (Next Acc: ${nextAccountNumber})`}
              </h2>
              <button className="modal-close" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>&times;</button>
            </div>

            <form onSubmit={handleSave}>
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

                <h3 style={{ margin: '0 0 8px 0', borderBottom: '2px solid var(--primary)', paddingBottom: '4px', fontSize: '16px', color: 'var(--primary)' }}>
                  Personal Information
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />
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
                    <label>Phone Number *</label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +233..." required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. name@mail.com" />
                  </div>
                  <div className="form-group">
                    <label>Occupation *</label>
                    <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Occupation" required />
                  </div>
                  <div className="form-group">
                    <label>Congregation *</label>
                    <select value={congregation} onChange={(e) => setCongregation(e.target.value)} required>
                      {congregations.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      {congregations.length === 0 && <option value="">-- No congregations configured --</option>}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>House No. or GPS Address</label>
                    <input type="text" value={houseNoGps} onChange={(e) => setHouseNoGps(e.target.value)} placeholder="e.g. SG-120-1200" />
                  </div>
                  <div className="form-group">
                    <label>Landmark (GPS backup)</label>
                    <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Behind Assembly" />
                  </div>
                  <div className="form-group">
                    <label>Fellowship Group Name</label>
                    <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Faith Group" />
                  </div>
                </div>

                {/* Beneficiaries Nominee Forms */}
                <div className="flex justify-between align-center" style={{ margin: '16px 0 8px 0', borderBottom: '2px solid var(--primary)', paddingBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--primary)' }}>
                    Beneficiary Nominations
                  </h3>
                  <button type="button" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={handleAddBeneficiaryField}>
                    + Add Nomination
                  </button>
                </div>

                <div className="beneficiary-list-editor">
                  {beneficiariesForm.map((b, idx) => (
                    <div key={idx} className="beneficiary-item-card">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nomination #{idx + 1} Name</label>
                          <input type="text" value={b.full_name} onChange={(e) => handleBeneficiaryChange(idx, 'full_name', e.target.value)} placeholder="Full Name" />
                        </div>
                        <div className="form-group" style={{ maxWidth: '90px' }}>
                          <label>Age</label>
                          <input type="number" value={b.age || ''} onChange={(e) => handleBeneficiaryChange(idx, 'age', e.target.value)} placeholder="Age" required={!!b.full_name.trim()} min={0} />
                        </div>
                        <div className="form-group" style={{ maxWidth: '100px' }}>
                          <label>Share (%)</label>
                          <input type="number" value={b.percentage || ''} onChange={(e) => handleBeneficiaryChange(idx, 'percentage', e.target.value)} placeholder="%" required={!!b.full_name.trim()} min={0} max={100} />
                        </div>
                        <div className="form-group">
                          <label>Relationship</label>
                          <select value={b.relationship} onChange={(e) => handleBeneficiaryChange(idx, 'relationship', e.target.value)}>
                            <option value="Spouse">Spouse</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Parent">Parent</option>
                            <option value="Friend">Friend</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Phone Number</label>
                          <input type="text" value={b.phone_number} onChange={(e) => handleBeneficiaryChange(idx, 'phone_number', e.target.value)} placeholder="Phone" required={!!b.full_name.trim()} />
                        </div>
                      </div>
                      <div className="form-row" style={{ marginTop: '8px' }}>
                        <div className="form-group">
                          <label>GPS Address</label>
                          <input type="text" value={b.house_number} onChange={(e) => handleBeneficiaryChange(idx, 'house_number', e.target.value)} placeholder="GPS Location" required={!!b.full_name.trim()} />
                        </div>
                        <div className="form-group">
                          <label>Marital Status</label>
                          <select value={b.marital_status} onChange={(e) => handleBeneficiaryChange(idx, 'marital_status', e.target.value)}>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                          </select>
                        </div>
                      </div>

                      {beneficiariesForm.length > 1 && (
                        <button type="button" className="beneficiary-remove-btn" onClick={() => handleRemoveBeneficiaryField(idx)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex align-center justify-between p-8" style={{ background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}>
                  <span>Total Beneficiary Percentage Split:</span>
                  <span className={`bold ${Math.abs(beneficiariesForm.reduce((sum, b) => sum + b.percentage, 0) - 100) < 0.01 ? 'text-success' : 'text-danger'}`}>
                    {beneficiariesForm.reduce((sum, b) => sum + b.percentage, 0)}% (Must equal exactly 100%)
                  </span>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Member Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
