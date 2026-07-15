import React, { useState } from 'react';
import type { Congregation } from '../db/supabase';
import { Plus, Edit, Trash2, Check, AlertCircle } from 'lucide-react';

interface CongregationManagementProps {
  congregations: Congregation[];
  onSaveCongregation: (name: string, id?: string) => void;
  onDeleteCongregation: (id: string) => void;
  userRole: string;
}

export const CongregationManagement: React.FC<CongregationManagementProps> = ({
  congregations,
  onSaveCongregation,
  onDeleteCongregation,
  userRole
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [congregationName, setCongregationName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingId(undefined);
    setCongregationName('');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Congregation) => {
    setEditingId(c.id);
    setCongregationName(c.name);
    setShowModal(true);
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!congregationName.trim()) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await onSaveCongregation(congregationName.trim(), editingId);
      setSuccessMsg(editingId ? 'Congregation updated!' : 'Congregation added!');
      setCongregationName('');
      
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save congregation.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this congregation? Members registered under this congregation will keep their record but the congregation selection option will be removed.')) {
      try {
        await onDeleteCongregation(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete congregation.');
      }
    }
  };

  const isReadOnly = userRole === 'Member' || userRole === 'Collection Officer' || userRole === 'Auditor';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Header bar */}
      <div className="flex justify-between align-center">
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Congregation Directory</h2>
          <span className="text-muted" style={{ fontSize: '13px' }}>Manage the list of congregations used for member registration profiles.</span>
        </div>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> Add Congregation
          </button>
        )}
      </div>

      {/* Congregations List Grid */}
      <div className="table-container" style={{ maxWidth: '650px' }}>
        <table>
          <thead>
            <tr>
              <th>Congregation Name</th>
              <th>Registered Date</th>
              {!isReadOnly && <th className="text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {congregations.map(c => (
              <tr key={c.id}>
                <td className="bold" style={{ fontSize: '14px' }}>{c.name}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
                {!isReadOnly && (
                  <td className="text-center">
                    <div className="flex gap-8 justify-center">
                      <button className="btn btn-outline" style={{ padding: '6px', borderRadius: '6px' }} onClick={() => handleOpenEdit(c)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px', borderRadius: '6px' }} onClick={() => handleDelete(c.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {congregations.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-16 text-muted">No congregations found. Add some to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Congregation Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Congregation' : 'Add Congregation'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-16">
                
                {successMsg && (
                  <div className="alert alert-success" style={{ padding: '10px' }}>
                    <Check size={16} /> <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="alert alert-danger" style={{ padding: '10px' }}>
                    <AlertCircle size={16} /> <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Congregation Name *</label>
                  <input
                    type="text"
                    value={congregationName}
                    onChange={(e) => setCongregationName(e.target.value)}
                    placeholder="e.g. Sege Central Methodist"
                    required
                    autoFocus
                  />
                </div>

              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
