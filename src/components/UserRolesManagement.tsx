import React, { useState } from 'react';
import type { Member, StaffUser } from '../db/supabase';
import { Plus, Search, Edit2, CheckCircle, AlertCircle, Trash2, Key } from 'lucide-react';

interface UserRolesManagementProps {
  staffUsers: StaffUser[];
  members: Member[];
  onAssignRole: (email: string, roleName: string, fullName?: string) => void;
  onRevokeRole: (email: string) => void;
  userRole: string;
}

export const UserRolesManagement: React.FC<UserRolesManagementProps> = ({
  staffUsers,
  members,
  onAssignRole,
  onRevokeRole,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Form State
  const [emailInput, setEmailInput] = useState('');
  const [roleSelect, setRoleSelect] = useState('Administrator');
  const [fullNameInput, setFullNameInput] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle email autocomplete match from registered members
  const handleEmailChange = (val: string) => {
    setEmailInput(val);
    const match = members.find(m => m.email.toLowerCase() === val.trim().toLowerCase());
    if (match) {
      setFullNameInput(match.full_name);
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Please enter an email address.');
      return;
    }

    try {
      onAssignRole(emailInput.trim(), roleSelect, fullNameInput.trim() || undefined);
      setSuccessMsg('Role assigned successfully and access levels mapped!');
      
      setEmailInput('');
      setFullNameInput('');
      setRoleSelect('Administrator');

      setTimeout(() => {
        setShowAssignModal(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign role.');
    }
  };

  const handleRevoke = (email: string) => {
    if (userRole !== 'Super Administrator' && userRole !== 'Super Admin') {
      alert('Action Unauthorized: Only Super Administrators can revoke roles.');
      return;
    }

    if (window.confirm(`Revoke and remove all access rights for ${email}?`)) {
      onRevokeRole(email);
    }
  };

  const isSuperAdmin = userRole === 'Super Administrator' || userRole === 'Super Admin';
  const isReadOnly = userRole === 'Member' || userRole === 'Collection Officer' || userRole === 'Collections Officer';

  const filteredStaff = staffUsers.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableRoles = [
    'Super Administrator',
    'Administrator',
    'Accountant',
    'Loan Officer',
    'Collections Officer',
    'Member'
  ];

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Header section */}
      <div className="flex justify-between align-center">
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Staff & User Roles</h2>
          <span className="text-muted" style={{ fontSize: '13px' }}>Assign role-based access permissions and manage system administrators.</span>
        </div>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={() => { setEmailInput(''); setFullNameInput(''); setShowAssignModal(true); }}>
            <Plus size={18} /> Assign User Role
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
        <Search size={18} className="text-muted" />
        <input
          type="text"
          placeholder="Search staff email or roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
        />
      </div>

      {/* Table log */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Email Address</th>
              <th>Full Name</th>
              <th>Assigned Access Role</th>
              <th>Status</th>
              <th>Last Sign-In</th>
              <th>Date Assigned</th>
              {!isReadOnly && <th className="text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(u => (
              <tr key={u.email}>
                <td className="bold" style={{ color: 'var(--primary-light)', fontFamily: 'monospace' }}>{u.email}</td>
                <td className="bold">{u.full_name}</td>
                <td>
                  <span className={`badge ${
                    u.role.includes('Super') ? 'badge-danger' :
                    u.role.includes('Admin') ? 'badge-warning' :
                    u.role.includes('Accountant') ? 'badge-info' : 'badge-success'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className="badge badge-success">{u.status}</span>
                </td>
                <td style={{ fontSize: '12px' }}>{u.last_signin}</td>
                <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                {!isReadOnly && (
                  <td className="text-center">
                    <div className="flex gap-8 justify-center">
                      <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => {
                        setEmailInput(u.email);
                        setFullNameInput(u.full_name);
                        setRoleSelect(u.role);
                        setShowAssignModal(true);
                      }}>
                        <Edit2 size={12} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleRevoke(u.email)} disabled={!isSuperAdmin}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign User Role Modal */}
      {showAssignModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Assign/Modify Access Role</h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="flex flex-col gap-16">
                
                {errorMsg && <div className="alert alert-danger"><AlertCircle size={16} /> <span>{errorMsg}</span></div>}
                {successMsg && <div className="alert alert-success"><CheckCircle size={16} /> <span>{successMsg}</span></div>}

                <div className="form-group">
                  <label>Staff Email Address *</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="e.g. staff@mustardseed.org"
                    required
                    autoFocus
                  />
                  <span className="text-muted" style={{ fontSize: '10px', marginTop: '2px', display: 'block' }}>
                    Type email address. If it matches a registered member email, their name is auto-completed.
                  </span>
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder="Staff Full Name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Select Access Permission Role *</label>
                  <select value={roleSelect} onChange={(e) => setRoleSelect(e.target.value)}>
                    {availableRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Key size={16} /> Save Authorization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
