import React, { useState } from 'react';
import type { AuditLog } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { ShieldCheck, Search, Database, Download, AlertTriangle, RefreshCw } from 'lucide-react';

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
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filter audit logs
  const filteredLogs = auditLogs.filter(l =>
    l.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.user_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackup = () => {
    // Generate JSON backup from all local keys
    const backupData: Record<string, any> = {};
    const keys = ['members', 'beneficiaries', 'transactions', 'loans', 'sms_templates', 'sms_logs', 'audit_logs', 'chart_of_accounts', 'journal_entries', 'sms_wallet', 'sms_settings', 'momo_transactions'];
    
    keys.forEach(k => {
      backupData[k] = localStorage.getItem(k);
    });

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `MUSTARD_SEED_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    mockDb.logAudit(userRole, 'System Audit Control', 'Backup Database', 'Database backup download triggered successfully.');
    setSuccessMsg('System backup completed and download triggered!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      if (!event.target || !event.target.result) return;
      try {
        const parsed = JSON.parse(event.target.result as string);
        Object.keys(parsed).forEach(k => {
          if (parsed[k] !== null) {
            localStorage.setItem(k, parsed[k]);
          }
        });
        
        mockDb.logAudit(userRole, 'System Audit Control', 'Restore Database', 'Database state restored from external backup file.');
        setSuccessMsg('Database restored successfully! Reloading...');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        alert('Invalid backup file structure.');
      }
    };
    fileReader.readAsText(files[0]);
  };

  const handleReset = () => {
    if (window.confirm('WARNING: Are you sure you want to purge the database back to initial seed data? All custom entries will be lost.')) {
      onResetDb();
      setSuccessMsg('Database has been reset to factory seed values!');
      setTimeout(() => setSuccessMsg(''), 1500);
    }
  };

  const isAdmin = userRole === 'Super Admin' || userRole === 'Administrator';

  return (
    <div className="flex flex-col gap-16 w-full">
      
      {successMsg && (
        <div className="alert alert-success">
          <ShieldCheck size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: 2col for Database Administration vs Audit Logs */}
      <div className="grid-2col" style={{ gridTemplateColumns: isAdmin ? '2fr 1fr' : '1fr' }}>
        
        {/* Left Side: Audit Trail Table */}
        <div className="card">
          <div className="card-title">
            <span>System Activity Audit Trail</span>
            <ShieldCheck size={18} className="card-title-icon" />
          </div>

          <div className="flex align-center gap-8 mb-16" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
            <Search size={18} className="text-muted" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', padding: 0, outline: 'none', width: '100%', background: 'transparent' }}
            />
          </div>

          <div className="table-container" style={{ maxHeight: '500px' }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operator (Role)</th>
                  <th>Action</th>
                  <th>Details Summary</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div className="bold">{l.user_name}</div>
                      <span className="badge badge-info" style={{ fontSize: '9px' }}>{l.user_role}</span>
                    </td>
                    <td className="bold" style={{ color: 'var(--primary-dark)' }}>{l.action}</td>
                    <td style={{ fontSize: '12px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{l.details}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-16 text-muted">No activity records match query parameters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Admin Operations (Visible to admins only) */}
        {isAdmin && (
          <div className="flex flex-col gap-16">
            
            {/* Database backups */}
            <div className="card">
              <div className="card-title">
                <span>Backup & Restore</span>
                <Database size={18} className="card-title-icon" />
              </div>
              
              <div className="flex flex-col gap-16">
                <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>
                  Export all client details, ledger tables, savings histories, and logs into a portable JSON backup.
                </p>

                <button className="btn btn-outline w-full flex justify-between align-center" onClick={handleBackup}>
                  <span>Download System JSON</span>
                  <Download size={16} />
                </button>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
                  <label className="bold text-muted" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    RESTORE SYSTEM FROM FILE
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    style={{ fontSize: '12px', width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* System purge */}
            <div className="card" style={{ borderColor: 'rgba(217, 56, 56, 0.3)' }}>
              <div className="card-title text-danger">
                <span>Danger Zone</span>
                <AlertTriangle size={18} />
              </div>
              
              <div className="flex flex-col gap-16">
                <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>
                  Purge all custom ledger items, templates, and logs, returning the system back to clean demo seed state.
                </p>

                <button className="btn btn-danger w-full flex justify-between align-center" onClick={handleReset}>
                  <span>Purge & Reset System</span>
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
