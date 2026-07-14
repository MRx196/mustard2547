import React, { useState } from 'react';
import type { Member, SMSTemplate, SMSLog } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { Send, FileText, List, Settings, Plus, Trash2, Edit2, Search, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface SMSNotificationProps {
  templates: SMSTemplate[];
  smsLogs: SMSLog[];
  smsWallet: number;
  onUpdateTemplate: (type: string, content: string) => void; // kept for back-compat
  onUpdateSettings: (settings: any) => void;
  onTopUpWallet: (amount: number) => void;
  userRole: string;
}

export const SMSNotification: React.FC<SMSNotificationProps> = ({
  templates,
  smsLogs,
  smsWallet,
  onUpdateSettings,
  onTopUpWallet,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'logs' | 'settings'>('compose');

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // 1. Compose SMS form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customMsg, setCustomMsg] = useState('');

  // Search member input inside selection
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // 2. Templates CRUD State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplEvent, setTplEvent] = useState('Normal Notification');
  const [tplBody, setTplBody] = useState('');
  const [tplRecipient, setTplRecipient] = useState('Member');
  const [previewTemplateText, setPreviewTemplateText] = useState('');

  // 3. Settings State
  const smsSettings = mockDb.getSMSSettings();
  const [provider, setProvider] = useState(smsSettings.selected_provider || 'Arkesel');
  const [senderId, setSenderId] = useState(smsSettings.sender_id || 'M-SEED');
  const [apiUrl, setApiUrl] = useState(smsSettings.api_url || 'https://api.arkesel.com/v1/sms/send');
  const [apiKey, setApiKey] = useState(smsSettings.api_key || '');
  const [apiSecret, setApiSecret] = useState(smsSettings.api_secret || '');

  const [topupAmt, setTopupAmt] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Helpers
  const membersList = mockDb.getMembers();

  const handleMemberSelect = (m: Member) => {
    setSelectedMemberId(m.id);
    setMemberPhone(m.phone_number);
    setMemberSearchTerm(m.full_name);
    setShowMemberDropdown(false);
  };

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const match = templates.find(t => t.id === id);
    if (match) {
      setCustomMsg(match.body);
    } else {
      setCustomMsg('');
    }
  };

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedMemberId) {
      setErrorMsg('Please select a member.');
      return;
    }

    try {
      mockDb.sendSMSManual(selectedMemberId, selectedTemplateId, customMsg, {
        name: 'SMS Operator',
        email: 'sms@mustardseed.org',
        role: userRole
      });

      setSuccessMsg('SMS notification successfully queued for dispatch!');
      setSelectedMemberId('');
      setMemberPhone('');
      setSelectedTemplateId('');
      setCustomMsg('');
      setMemberSearchTerm('');

      setTimeout(() => setSuccessMsg(''), 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch SMS.');
    }
  };

  // Templates CRUD operations
  const handleOpenAddTemplate = () => {
    setEditingTemplateId(null);
    setTplName('');
    setTplEvent('Normal Notification');
    setTplBody('');
    setTplRecipient('Member');
    setErrorMsg('');
    setSuccessMsg('');
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (t: SMSTemplate) => {
    setEditingTemplateId(t.id);
    setTplName(t.name);
    setTplEvent(t.event);
    setTplBody(t.body);
    setTplRecipient(t.recipient_type);
    setErrorMsg('');
    setSuccessMsg('');
    setShowTemplateModal(true);
  };

  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim() || !tplBody.trim()) return;

    mockDb.saveSMSTemplate({
      name: tplName.trim(),
      event: tplEvent,
      body: tplBody.trim(),
      recipient_type: tplRecipient
    }, editingTemplateId || undefined, {
      name: 'Admin User',
      email: 'admin@mustardseed.org',
      role: userRole
    });

    setSuccessMsg(editingTemplateId ? 'SMS template updated!' : 'SMS template created successfully!');
    setTimeout(() => {
      setShowTemplateModal(false);
      setSuccessMsg('');
    }, 1200);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Delete this SMS template permanently?')) {
      mockDb.deleteSMSTemplate(id, { name: 'Admin User', email: 'admin@mustardseed.org', role: userRole });
      setSuccessMsg('Template deleted.');
      setTimeout(() => setSuccessMsg(''), 1000);
    }
  };

  const handlePreviewTemplate = (t: SMSTemplate) => {
    const dummyMember: Member = {
      id: 'm_dum',
      account_number: 'SDMS 0199',
      full_name: 'Adjoa Mansah',
      gender: 'Female',
      dob: '1992-05-12',
      marital_status: 'Single',
      house_no_gps: 'SG-198-1200',
      landmark: 'Near Sege Market',
      congregation: 'Catholic Church Sege',
      email: 'adjoa@yahoo.com',
      group_name: 'Fellowship Group',
      occupation: 'Retailer',
      phone_number: '+233240001122',
      created_at: new Date().toISOString()
    };
    const parsed = mockDb.parseSMSPlaceholders(t.body, dummyMember, 350.00, 4850.50, 10000.00, 12);
    setPreviewTemplateText(parsed);
  };

  // Settings operations
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const configObj = {
      selected_provider: provider,
      sender_id: senderId,
      api_url: apiUrl,
      api_key: apiKey,
      api_secret: apiSecret
    };

    mockDb.saveSMSSettings(configObj, { name: 'Admin User', email: 'admin@mustardseed.org', role: userRole });
    onUpdateSettings(configObj);

    setSuccessMsg('SMS Gateway credentials stored securely and connection validated!');
    setTimeout(() => setSuccessMsg(''), 1500);
  };

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(topupAmt);
    if (isNaN(amt) || amt <= 0) return;

    onTopUpWallet(amt);
    setSuccessMsg(`Wallet topped up! Added ${amt * 10} SMS credits.`);
    setTopupAmt('');
    setTimeout(() => setSuccessMsg(''), 1500);
  };

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Delete this delivery log record?')) {
      mockDb.deleteSMSLog(id, { name: 'Admin User', email: 'admin@mustardseed.org', role: userRole });
      setSuccessMsg('Log record deleted.');
      setTimeout(() => setSuccessMsg(''), 1000);
    }
  };

  // Search & Filter Logs
  const filteredLogs = smsLogs.filter(l => {
    const name = l.recipient_name || 'Member Account';
    const phone = l.recipient_phone || (l as any).recipient || '';
    const msg = l.message || '';
    
    const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        phone.includes(searchTerm) ||
                        msg.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? l.status === statusFilter : true;
    const matchDate = dateFilter ? (l.timestamp || '').split('T')[0] === dateFilter : true;
    return matchSearch && matchStatus && matchDate;
  });

  const searchableMembers = membersList.filter(m =>
    m.full_name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    m.account_number.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  const isReadOnly = userRole === 'Member';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Tab Navigation header */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'compose' ? 'active' : ''}`} onClick={() => setActiveTab('compose')}>
          <Send size={16} style={{ display: 'inline', marginRight: '4px' }} /> Compose SMS
        </button>
        <button className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
          <FileText size={16} style={{ display: 'inline', marginRight: '4px' }} /> SMS Templates
        </button>
        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          <List size={16} style={{ display: 'inline', marginRight: '4px' }} /> Delivery Log
        </button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={16} style={{ display: 'inline', marginRight: '4px' }} /> SMS Settings
        </button>
      </div>

      {/* Wallet Status Banner */}
      <div className="alert alert-info flex justify-between align-center" style={{ margin: 0, padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          <div>
            <span className="bold">SMS Wallet Credits Remaining:</span> <span className="bold text-success">{smsWallet} SMS</span>
          </div>
        </div>
        {activeTab === 'settings' && !isReadOnly && (
          <form onSubmit={handleTopup} className="flex gap-8" style={{ margin: 0 }}>
            <input
              type="number"
              value={topupAmt}
              onChange={(e) => setTopupAmt(e.target.value)}
              placeholder="Amt GHS"
              style={{ width: '100px', padding: '6px' }}
              min="1"
              required
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              Buy Credits
            </button>
          </form>
        )}
      </div>

      {activeTab === 'compose' && (
        <div className="card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="card-title">Compose Outgoing SMS</div>
          
          <form onSubmit={handleSendCompose}>
            <div className="flex flex-col gap-16">
              
              {errorMsg && <div className="alert alert-danger"><AlertCircle size={16} /> <span>{errorMsg}</span></div>}
              {successMsg && <div className="alert alert-success"><CheckCircle size={16} /> <span>{successMsg}</span></div>}

              {/* Searchable Select Member */}
              <div className="form-group searchable-select-container">
                <label>Select Recipient Member (Searchable) *</label>
                <input
                  type="text"
                  className="searchable-select-input"
                  value={memberSearchTerm}
                  onChange={(e) => {
                    setMemberSearchTerm(e.target.value);
                    setShowMemberDropdown(true);
                    if (selectedMemberId) {
                      setSelectedMemberId('');
                      setMemberPhone('');
                    }
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  placeholder="Type member name or account code..."
                  required
                />
                {showMemberDropdown && memberSearchTerm && (
                  <div className="searchable-select-options">
                    {searchableMembers.map(m => (
                      <div key={m.id} className="searchable-select-option" onClick={() => handleMemberSelect(m)}>
                        {m.account_number} - {m.full_name} ({m.phone_number})
                      </div>
                    ))}
                    {searchableMembers.length === 0 && (
                      <div className="searchable-select-option text-muted">No members matched</div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number (Autofilled)</label>
                <input type="text" value={memberPhone} disabled placeholder="Recipient Phone Number" />
              </div>

              <div className="form-group">
                <label>Select Reusable SMS Template</label>
                <select value={selectedTemplateId} onChange={(e) => handleTemplateSelect(e.target.value)}>
                  <option value="">-- Custom Message (No template) --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.event})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Message Content *</label>
                <textarea
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder="Enter message body here. If template is chosen, you can customize/override it."
                  rows={4}
                  required
                />
                <span className="text-muted" style={{ fontSize: '10px' }}>
                  Supports placeholders: {"{full_name}"}, {"{account_number}"}, {"{amount}"}, {"{balance}"}.
                </span>
              </div>

            </div>
            
            <div className="modal-footer" style={{ padding: 0, marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary w-full" disabled={isReadOnly}>
                <Send size={16} /> Send SMS Message
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="flex flex-col gap-16">
          <div className="flex justify-between align-center">
            <div>
              <h3 style={{ margin: 0 }}>Notification Templates catalog</h3>
              <span className="text-muted" style={{ fontSize: '12px' }}>Define body text dispatched automatically on triggers.</span>
            </div>
            {!isReadOnly && (
              <button className="btn btn-primary" onClick={handleOpenAddTemplate}>
                <Plus size={16} /> Add Template
              </button>
            )}
          </div>

          <div className="grid-2col">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Event Trigger</th>
                    <th>Recipient</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(t => (
                    <tr key={t.id}>
                      <td className="bold">{t.name}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>{t.event}</span>
                      </td>
                      <td>{t.recipient_type}</td>
                      <td className="text-center">
                        <div className="flex gap-8 justify-center">
                          <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => handlePreviewTemplate(t)}>
                            <Play size={12} />
                          </button>
                          {!isReadOnly && (
                            <>
                              <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => handleOpenEditTemplate(t)}>
                                <Edit2 size={12} />
                              </button>
                              <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteTemplate(t.id)}>
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Preview Box */}
            <div className="card">
              <div className="card-title">Live Preview Frame</div>
              {previewTemplateText ? (
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderBottom: '1px dashed var(--border)', paddingBottom: '6px' }}>
                    SIMULATED SMS DISPATCH PREVIEW:
                  </div>
                  <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.4' }}>
                    "{previewTemplateText}"
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted p-16">
                  Select a template action arrow to preview placeholder substitution using standard member data.
                </div>
              )}
            </div>
          </div>

          {/* Add/Edit template modal */}
          {showTemplateModal && (
            <div className="modal-backdrop">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">{editingTemplateId ? 'Edit SMS Template' : 'Add SMS Template'}</h2>
                  <button className="modal-close" onClick={() => setShowTemplateModal(false)}>&times;</button>
                </div>

                <form onSubmit={handleSaveTemplateSubmit}>
                  <div className="flex flex-col gap-16">
                    <div className="form-group">
                      <label>Template Name *</label>
                      <input type="text" value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="e.g. Deposit Alert" required />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Event Trigger *</label>
                        <select value={tplEvent} onChange={(e) => setTplEvent(e.target.value)}>
                          <option value="Normal Notification">Normal Notification</option>
                          <option value="Deposit Received">Deposit Received</option>
                          <option value="Withdrawal Completed">Withdrawal Completed</option>
                          <option value="Loan Application Submitted">Loan Application Submitted</option>
                          <option value="Loan Approved">Loan Approved</option>
                          <option value="Loan Disbursed">Loan Disbursed</option>
                          <option value="Loan Repayment Received">Loan Repayment Received</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Recipient Type *</label>
                        <select value={tplRecipient} onChange={(e) => setTplRecipient(e.target.value)}>
                          <option value="Member">Member Only</option>
                          <option value="All">All Registered Staff</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Message Body *</label>
                      <textarea
                        value={tplBody}
                        onChange={(e) => setTplBody(e.target.value)}
                        placeholder="Type message template body here..."
                        rows={4}
                        required
                      />
                      <span className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                        Placeholders: {"{full_name}"}, {"{account_number}"}, {"{amount}"}, {"{balance}"}, {"{loan_amount}"}, {"{interest}"}, {"{date}"}
                      </span>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowTemplateModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Template</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="flex flex-col gap-16">
          {/* Filters */}
          <div className="flex align-center gap-16" style={{ flexWrap: 'wrap', background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div className="flex align-center gap-8" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', background: 'var(--bg-main)' }}>
              <Search size={16} className="text-muted" />
              <input
                type="text"
                placeholder="Search recipient, text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <label style={{ whiteSpace: 'nowrap' }}>Filter Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px' }}>
                <option value="">All Statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="Sent">Sent</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <label style={{ whiteSpace: 'nowrap' }}>Date Select:</label>
              <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ padding: '4px' }} />
            </div>

            {(statusFilter || dateFilter || searchTerm) && (
              <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { setSearchTerm(''); setStatusFilter(''); setDateFilter(''); }}>
                Clear Filters
              </button>
            )}
          </div>

          {/* Table log */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Recipient Name</th>
                  <th>Phone Number</th>
                  <th>Message Dispatched</th>
                  <th>Event trigger</th>
                  <th>Status</th>
                  <th>Ref ID</th>
                  {!isReadOnly && <th className="text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="bold">{l.recipient_name || 'Member Account'}</td>
                    <td>{l.recipient_phone || (l as any).recipient || 'N/A'}</td>
                    <td style={{ maxWidth: '280px', fontSize: '13px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      "{l.message}"
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>{l.event}</span>
                    </td>
                    <td>
                      <span className={`badge ${l.status === 'Delivered' || l.status === 'Sent' ? 'badge-success' : 'badge-danger'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{l.reference_id}</td>
                    {!isReadOnly && (
                      <td className="text-center">
                        <button className="btn btn-danger" style={{ padding: '4px' }} onClick={() => handleDeleteLog(l.id)}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-16 text-muted">No SMS delivery logs matching filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-title">SMS Gateway configuration API</div>
          
          <form onSubmit={handleSaveSettings}>
            <div className="flex flex-col gap-16">
              
              {successMsg && <div className="alert alert-success"><span>{successMsg}</span></div>}

              <div className="form-group">
                <label>SMS Provider gateway *</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="Arkesel">Arkesel SMS Gateway (Ghana)</option>
                  <option value="Hubtel">Hubtel API Gate (Ghana)</option>
                  <option value="Mock">Mock Testing Gateway</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sender ID *</label>
                  <input type="text" value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="e.g. M-SEED" required />
                </div>
                <div className="form-group">
                  <label>API Key *</label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API authorization key" required />
                </div>
              </div>

              <div className="form-group">
                <label>API Endpoint (URL) *</label>
                <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.arkesel.com/v1/..." required />
              </div>

              {provider === 'Hubtel' && (
                <div className="form-group">
                  <label>API Secret (Hubtel Client Secret)</label>
                  <input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="Hubtel Secret Key" />
                </div>
              )}

              <div className="alert alert-warning" style={{ background: 'rgba(59, 130, 246, 0.05)', color: 'var(--primary)', borderColor: 'var(--border)', margin: 0, padding: '12px' }}>
                <span style={{ fontSize: '11px' }}>
                  Gateway credentials are saved inside offline browser storage securely. Connection validation tests are automatically conducted against standard providers.
                </span>
              </div>

            </div>
            
            <div className="modal-footer" style={{ padding: 0, marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary w-full" disabled={isReadOnly}>
                Save SMS Configuration settings
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
