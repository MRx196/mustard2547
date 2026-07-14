import React, { useState } from 'react';
import type { Member, StaffUser } from '../db/supabase';
import { signUpStaffUser } from '../db/supabase';
import { Plus, Search, Edit2, CheckCircle, AlertCircle, Trash2, Key, Eye, EyeOff } from 'lucide-react';

interface UserRolesManagementProps {
  staffUsers: StaffUser[];
  members: Member[];
  onAssignRole: (profile: { email: string; role: string; full_name?: string; username?: string; phone_number?: string; status?: 'Active' | 'Inactive'; auth_user_id?: string }) => void;
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
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [emailInput, setEmailInput] = useState('');
  const [roleSelect, setRoleSelect] = useState('Administrator');
  const [fullNameInput, setFullNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [statusSelect, setStatusSelect] = useState<'Active' | 'Inactive'>('Active');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle email autocomplete match from registered members
  const handleEmailChange = (val: string) => {
    setEmailInput(val);
    const match = members.find(m => m.email.toLowerCase() === val.trim().toLowerCase());
    if (match) {
      setFullNameInput(match.full_name);
      setPhoneInput(match.phone_number);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEmailInput('');
    setFullNameInput('');
    setUsernameInput('');
    setPasswordInput('');
    setPhoneInput('');
    setRoleSelect('Administrator');
    setStatusSelect('Active');
    setErrorMsg('');
    setSuccessMsg('');
    setShowAssignModal(true);
  };

  const handleOpenEdit = (u: StaffUser) => {
    setIsEditing(true);
    setEmailInput(u.email);
    setFullNameInput(u.full_name);
    setUsernameInput(u.username || '');
    setPasswordInput(''); // Leave blank unless resetting
    setPhoneInput(u.phone_number || '');
    setRoleSelect(u.role);
    setStatusSelect(u.status || 'Active');
    setErrorMsg('');
    setSuccessMsg('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const email = emailInput.trim();
    const role = roleSelect;
    const fullName = fullNameInput.trim();
    const username = usernameInput.trim();
    const phone = phoneInput.trim();
    const status = statusSelect;

    if (!email || !fullName || !role) {
      setErrorMsg('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      let authUserId = undefined;

      // 1. If registering a new user, create account in Supabase Auth
      if (!isEditing) {
        if (!passwordInput || passwordInput.length < 6) {
          setErrorMsg('Password is required and must be at least 6 characters.');
          setLoading(false);
          return;
        }

        const { data, error } = await signUpStaffUser(email, passwordInput);
        if (error) {
          // If signup fails, throw error unless it's a seed duplicate warning
          if (!error.message.includes('already registered')) {
            setErrorMsg(error.message || 'Supabase Auth registration failed.');
            setLoading(false);
            return;
          }
        } else if (data && data.user) {
          authUserId = data.user.id;
        }
      }

      // 2. Save/Update Profile in Users DB table
      onAssignRole({
        email,
        role,
        full_name: fullName,
        username: username || email.split('@')[0],
        phone_number: phone,
        status,
        auth_user_id: authUserId
      });

      setSuccessMsg(isEditing ? 'Access role profile modified!' : 'Supabase Auth account created & profile initialized!');
      
      setTimeout(() => {
        setShowAssignModal(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Role mapping failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = (email: string) => {
    const isSuperAdmin = userRole === 'Super Administrator' || userRole === 'Super Admin';
    if (!isSuperAdmin) {
      alert('Action Unauthorized: Only Super Administrators can revoke roles.');
      return;
    }

    if (window.confirm(`Revoke and remove all access rights for ${email}?`)) {
      onRevokeRole(email);
    }
  };

  const isReadOnly = userRole === 'Auditor';

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
    'Collection Officer',
    'Auditor'
  ];

  return (
    <div className="flex flex-col gap-16 w-full">
      
      {/* Header bar */}
      <div className="flex justify-between align-center">
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Staff & User Roles</h2>
          <span className="text-muted" style={{ fontSize: '13px' }}>Assign role-based access permissions and manage system administrators.</span>
        </div>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
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
              <th>Username</th>
              <th>Full Name</th>
              <th>Phone Number</th>
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
                <td style={{ fontFamily: 'monospace' }}>{u.username || '-'}</td>
                <td className="bold">{u.full_name}</td>
                <td>{u.phone_number || '-'}</td>
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
                  <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                    {u.status || 'Active'}
                  </span>
                </td>
                <td style={{ fontSize: '12px' }}>
                  {u.last_signin && u.last_signin !== 'N/A' ? new Date(u.last_signin).toLocaleString() : 'N/A'}
                </td>
                <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                {!isReadOnly && (
                  <td className="text-center">
                    <div className="flex gap-8 justify-center">
                      <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => handleOpenEdit(u)}>
                        <Edit2 size={12} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleRevoke(u.email)}>
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
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{isEditing ? 'Modify Access Role Details' : 'Assign New Staff Access'}</h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="flex flex-col gap-16">
                
                {errorMsg && <div className="alert alert-danger"><AlertCircle size={16} /> <span>{errorMsg}</span></div>}
                {successMsg && <div className="alert alert-success"><CheckCircle size={16} /> <span>{successMsg}</span></div>}

                <div className="form-row">
                  <div className="form-group">
                    <label>Staff Email Address *</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="e.g. staff@mustardseed.org"
                      required
                      disabled={isEditing}
                      autoFocus={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. jdoe"
                      required
                    />
                  </div>
                </div>

                {!isEditing && (
                  <div className="form-group">
                    <label>Password (For Supabase Auth Creation) *</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 12px', background: 'var(--bg-input)' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Min 6 characters"
                        style={{ border: 'none', padding: '10px 0', width: '100%', outline: 'none', background: 'transparent', color: 'var(--text-main)' }}
                        required={!isEditing}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 0 }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-row">
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
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. +233..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Access Role *</label>
                    <select value={roleSelect} onChange={(e) => setRoleSelect(e.target.value)}>
                      {availableRoles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select value={statusSelect} onChange={(e: any) => setStatusSelect(e.target.value)}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAssignModal(false)} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Key size={16} /> {loading ? 'Saving...' : 'Save Authorization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
