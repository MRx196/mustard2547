import React, { useState } from 'react';
import type { AuditLog } from '../db/supabase';
import { Search, Database, AlertCircle, FileSpreadsheet, Printer } from 'lucide-react';

interface SecurityAuditProps {
  auditLogs: AuditLog[];
  onResetDb: () => void;
  userRole: string;
}

export const SecurityAudit: React.FC<SecurityAuditProps> = ({
  auditLogs,
  onResetDb,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Search & Filter Logs
  const filteredLogs = auditLogs.filter(l => {
    const matchSearch = (l.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (l.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (l.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (l.record_affected || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = moduleFilter ? l.module === moduleFilter : true;
    return matchSearch && matchModule;
  });

  const handleReset = () => {
    if (userRole !== 'Super Administrator' && userRole !== 'Super Admin') {
      alert('Action Unauthorized: Only Super Administrators can clear the database.');
      return;
    }
    onResetDb();
    setShowConfirmReset(false);
    alert('Mock local database successfully reset to clean seed settings!');
  };

  const isSuperAdmin = userRole === 'Super Administrator' || userRole === 'Super Admin';

  // CSV Exporter
  const exportAuditCSV = () => {
    const headers = ['Date & Time', 'User Name', 'Email', 'Role', 'Action', 'Module', 'Affected ID', 'Previous Value', 'New Value'];
    const rows = filteredLogs.map(l => [
      new Date(l.timestamp).toLocaleString(),
      l.user_name || '',
      l.user_email || '',
      l.user_role || '',
      l.action || '',
      l.module || '',
      l.record_affected || '',
      l.previous_value || '',
      l.new_value || ''
    ]);

    const csvContent = [
      'Compliance Security Audit Logs',
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modules = Array.from(new Set(auditLogs.map(l => l.module).filter(Boolean)));

  return (
    <div className="flex flex-col gap-16 w-full print-only-section">
      
      {/* Header section */}
      <div className="flex justify-between align-center">
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Compliance Audit Logs</h2>
          <span className="text-muted" style={{ fontSize: '13px' }}>Monitor security event records, staff modifications, and system transactions.</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px' }} onClick={() => window.print()}>
            <Printer size={14} /> Print logs
          </button>
          <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px' }} onClick={exportAuditCSV}>
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          {isSuperAdmin && (
            <button className="btn btn-danger" onClick={() => setShowConfirmReset(true)} style={{ padding: '8px 12px', fontSize: '12px' }}>
              <Database size={14} /> Reset Database
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex align-center gap-16" style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div className="flex align-center gap-8" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', background: 'var(--bg-main)' }}>
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search email, action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none' }}
          />
        </div>

        <div className="form-group" style={{ margin: 0, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <label style={{ whiteSpace: 'nowrap' }}>Filter Module:</label>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} style={{ padding: '6px' }}>
            <option value="">All Modules</option>
            {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
          </select>
        </div>

        {(searchTerm || moduleFilter) && (
          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { setSearchTerm(''); setModuleFilter(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Staff User Profile</th>
              <th>Action Details</th>
              <th>Module</th>
              <th>Record ID</th>
              <th>Previous Value</th>
              <th>New Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(l => (
              <tr key={l.id}>
                <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(l.timestamp).toLocaleString()}
                </td>
                <td>
                  <div className="bold">{l.user_name}</div>
                  <span className="text-muted" style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                    {l.user_email} • {l.user_role}
                  </span>
                </td>
                <td className="bold" style={{ fontSize: '13px' }}>{l.action}</td>
                <td>
                  <span className="badge badge-info" style={{ fontSize: '10px' }}>{l.module}</span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '10px' }}>{l.record_affected}</td>
                <td style={{ maxWidth: '180px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.previous_value}>
                  {l.previous_value}
                </td>
                <td style={{ maxWidth: '180px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.new_value}>
                  {l.new_value}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-16 text-muted">No security logs match filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reset confirmation modal */}
      {showConfirmReset && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title text-danger">Reset System Database?</h2>
              <button className="modal-close" onClick={() => setShowConfirmReset(false)}>&times;</button>
            </div>

            <div className="flex flex-col gap-16" style={{ fontSize: '14px' }}>
              <div className="alert alert-danger" style={{ margin: 0 }}>
                <AlertCircle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <span className="bold">CRITICAL WARNING!</span>
                  <p style={{ fontSize: '11px', marginTop: '4px' }}>
                    This action will wipe all local storage records (Members, Savings, Loans, Journal entries, SMS logs) and restore seed configurations.
                  </p>
                </div>
              </div>
              <p>Are you sure you want to proceed? This cannot be undone.</p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowConfirmReset(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReset}>Clear Database</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
