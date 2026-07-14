import React, { useState } from 'react';
import type { SMSTemplate, SMSLog } from '../db/supabase';
import { Settings, Wallet, Search, AlertCircle, Save, Smartphone, CheckCircle } from 'lucide-react';

interface SMSNotificationProps {
  templates: SMSTemplate[];
  smsLogs: SMSLog[];
  smsWallet: number;
  onUpdateTemplate: (type: string, content: string) => void;
  onUpdateSettings: (settings: any) => void;
  onTopUpWallet: (amount: number) => void;
  userRole: string;
}

export const SMSNotification: React.FC<SMSNotificationProps> = ({
  templates,
  smsLogs,
  smsWallet,
  onUpdateTemplate,
  onUpdateSettings,
  onTopUpWallet,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'templates' | 'logs' | 'settings'>('wallet');
  const [searchTerm, setSearchTerm] = useState('');

  // Top Up Wallet state
  const [topUpAmount, setTopUpAmount] = useState('');
  const [walletSuccess, setWalletSuccess] = useState('');

  // Gateway Settings state
  const [provider, setProvider] = useState(() => {
    const saved = localStorage.getItem('sms_settings');
    return saved ? JSON.parse(saved).selected_provider : 'Mock';
  });
  const [hubtelClientId, setHubtelClientId] = useState(() => {
    const saved = localStorage.getItem('sms_settings');
    return saved ? JSON.parse(saved).hubtel_client_id : '';
  });
  const [hubtelClientSecret, setHubtelClientSecret] = useState(() => {
    const saved = localStorage.getItem('sms_settings');
    return saved ? JSON.parse(saved).hubtel_client_secret : '';
  });
  const [hubtelSenderId, setHubtelSenderId] = useState(() => {
    const saved = localStorage.getItem('sms_settings');
    return saved ? JSON.parse(saved).hubtel_sender_id : 'M-SEED';
  });
  const [arkeselApiKey, setArkeselApiKey] = useState(() => {
    const saved = localStorage.getItem('sms_settings');
    return saved ? JSON.parse(saved).arkesel_api_key : '';
  });
  const [arkeselSenderId, setArkeselSenderId] = useState(() => {
    const saved = localStorage.getItem('sms_settings');
    return saved ? JSON.parse(saved).arkesel_sender_id : 'MSEED';
  });

  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Template Editing State
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletSuccess('');
    const cash = Number(topUpAmount);
    if (isNaN(cash) || cash <= 0) return;

    onTopUpWallet(cash);
    setWalletSuccess(`Wallet credited with ${cash * 10} SMS credits! Cash deducted from vault.`);
    setTopUpAmount('');
    setTimeout(() => setWalletSuccess(''), 2000);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');

    onUpdateSettings({
      selected_provider: provider,
      hubtel_client_id: hubtelClientId,
      hubtel_client_secret: hubtelClientSecret,
      hubtel_sender_id: hubtelSenderId,
      arkesel_api_key: arkeselApiKey,
      arkesel_sender_id: arkeselSenderId
    });

    setSettingsSuccess('Gateway credentials updated successfully!');
    setTimeout(() => setSettingsSuccess(''), 2000);
  };

  const handleStartEditing = (template: SMSTemplate) => {
    setEditingType(template.type);
    setEditingContent(template.content);
  };

  const handleSaveTemplate = (type: string) => {
    onUpdateTemplate(type, editingContent);
    setEditingType(null);
  };

  // Filter logs
  const filteredLogs = smsLogs.filter(l =>
    l.recipient.includes(searchTerm) ||
    l.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isReadOnly = userRole === 'Member' || userRole === 'Collection Officer';

  return (
    <div className="flex flex-col gap-16 w-full">
      {/* Sub tabs */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
          SMS Credit Wallet
        </button>
        <button className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
          Custom Templates
        </button>
        <button className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          SMS Dispatch Logs
        </button>
        {!isReadOnly && (
          <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            Gateway Settings
          </button>
        )}
      </div>

      {activeTab === 'wallet' && (
        <div className="grid-2col">
          {/* Wallet Balance Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-title">
              <span>SMS Wallet Tracker</span>
              <Wallet size={18} className="card-title-icon" />
            </div>

            <div className="flex align-center gap-16 p-16" style={{ background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div className="stat-icon-wrapper" style={{ width: 64, height: 64, background: 'rgba(15, 107, 63, 0.15)' }}>
                <Smartphone size={32} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '12px' }}>CREDITS REMAINING</div>
                <div className="bold" style={{ fontSize: '28px', color: 'var(--primary-dark)', fontFamily: 'var(--display)' }}>
                  {smsWallet} Credits
                </div>
                <span className="text-muted" style={{ fontSize: '11px' }}>Approx. {smsWallet} text notifications left</span>
              </div>
            </div>

            <div className="alert alert-info" style={{ fontSize: '12px', margin: 0 }}>
              <AlertCircle size={16} />
              <span>SMS messages are automatically sent for savings deposits, withdrawals, loan repayments, dividends, and repayment reminders. Each send deducts 1 credit.</span>
            </div>
          </div>

          {/* Top Up Wallet Card */}
          {!isReadOnly && (
            <div className="card">
              <div className="card-title">Buy SMS Credits</div>
              
              <form onSubmit={handleTopUpSubmit}>
                <div className="flex flex-col gap-16">
                  {walletSuccess && (
                    <div className="alert alert-success">
                      <span>{walletSuccess}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Payment Amount (GHS) *</label>
                    <input
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="e.g. 50"
                      min="1"
                      step="1"
                      required
                    />
                    <span className="text-muted" style={{ fontSize: '11px', marginTop: '2px', display: 'block' }}>
                      Rate: GHS 1.00 = 10 SMS credits. Cash is debited from Vault (Cash in Hand 1000) and posted as SMS Gateway Expenses (5300).
                    </span>
                  </div>

                  {topUpAmount && (
                    <div className="bold text-success" style={{ fontSize: '14px' }}>
                      You will receive: {Number(topUpAmount) * 10} SMS Credits
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary">Purchase & Recharge</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="card">
          <div className="card-title">Custom SMS Notification Templates</div>
          <p className="text-muted" style={{ fontSize: '13px', marginTop: '-12px', marginBottom: '20px' }}>
            Customize automatic text notifications. Drag or type placeholders into fields.
          </p>

          {/* Placeholders helper card */}
          <div className="p-16 mb-16" style={{ background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div className="bold" style={{ fontSize: '13px', color: 'var(--primary)' }}>Available System Placeholders:</div>
            <div className="flex" style={{ gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
              {['{{MemberName}}', '{{AccountNumber}}', '{{Amount}}', '{{Balance}}', '{{LoanBalance}}', '{{Installment}}', '{{Term}}', '{{DueDate}}'].map(p => (
                <code key={p} style={{ fontSize: '11px', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2px 6px' }}>{p}</code>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-16">
            {templates.map(t => (
              <div key={t.id} className="p-16" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '10px' }}>
                  <span className="bold text-uppercase" style={{ fontSize: '12px', color: 'var(--primary)' }}>
                    {t.type.replace('_', ' ')} Notification
                  </span>
                  
                  {!isReadOnly && (
                    editingType === t.type ? (
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleSaveTemplate(t.type)}>
                        <Save size={12} /> Save
                      </button>
                    ) : (
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleStartEditing(t)}>
                        Edit Template
                      </button>
                    )
                  )}
                </div>

                {editingType === t.type ? (
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={3}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <p style={{ fontStyle: 'italic', fontSize: '13px', margin: 0, color: 'var(--text-main)' }}>
                    "{t.content}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="flex flex-col gap-16">
          <div className="flex justify-between align-center" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="flex align-center gap-8" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', width: '320px' }}>
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search dispatch list..."
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
                  <th>Timestamp</th>
                  <th>Recipient Mobile</th>
                  <th>Message Body</th>
                  <th>Gateway Used</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="bold">{l.recipient}</td>
                    <td style={{ fontSize: '13px', maxWidth: '400px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {l.message}
                    </td>
                    <td>
                      <span className="badge badge-info">{l.api_used} Gateway</span>
                    </td>
                    <td>
                      <span className={`badge ${l.status === 'delivered' ? 'badge-success' : l.status === 'sent' ? 'badge-info' : l.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-16 text-muted">No SMS Logs found matching parameters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && !isReadOnly && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-title">
            <span>Gateway Integration Hub</span>
            <Settings size={18} className="card-title-icon" />
          </div>

          <form onSubmit={handleSettingsSubmit}>
            <div className="flex flex-col gap-16">
              {settingsSuccess && (
                <div className="alert alert-success">
                  <CheckCircle size={18} />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              <div className="form-group">
                <label>Default SMS Dispatch Channel *</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="Mock">Mock Offline Sandbox Gateway</option>
                  <option value="Hubtel">Hubtel SMS API v2</option>
                  <option value="Arkesel">Arkesel Developer API</option>
                </select>
              </div>

              {provider === 'Hubtel' && (
                <div className="flex flex-col gap-16" style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div className="bold text-success" style={{ fontSize: '13px' }}>Hubtel API Settings</div>
                  
                  <div className="form-group">
                    <label>Hubtel Client ID *</label>
                    <input
                      type="text"
                      value={hubtelClientId}
                      onChange={(e) => setHubtelClientId(e.target.value)}
                      placeholder="e.g. HT-CLIENT-192A"
                      required={provider === 'Hubtel'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Hubtel Client Secret *</label>
                    <input
                      type="password"
                      value={hubtelClientSecret}
                      onChange={(e) => setHubtelClientSecret(e.target.value)}
                      placeholder="Enter API Secret"
                      required={provider === 'Hubtel'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Registered Sender ID *</label>
                    <input
                      type="text"
                      value={hubtelSenderId}
                      onChange={(e) => setHubtelSenderId(e.target.value)}
                      maxLength={11}
                      placeholder="e.g. M-SEED"
                      required={provider === 'Hubtel'}
                    />
                  </div>
                </div>
              )}

              {provider === 'Arkesel' && (
                <div className="flex flex-col gap-16" style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div className="bold text-success" style={{ fontSize: '13px' }}>Arkesel Developer Settings</div>

                  <div className="form-group">
                    <label>Arkesel SMS API Key *</label>
                    <input
                      type="password"
                      value={arkeselApiKey}
                      onChange={(e) => setArkeselApiKey(e.target.value)}
                      placeholder="Enter API Key token"
                      required={provider === 'Arkesel'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Arkesel Sender ID *</label>
                    <input
                      type="text"
                      value={arkeselSenderId}
                      onChange={(e) => setArkeselSenderId(e.target.value)}
                      maxLength={11}
                      placeholder="e.g. MSEED"
                      required={provider === 'Arkesel'}
                    />
                  </div>
                </div>
              )}

              {provider === 'Mock' && (
                <div className="alert alert-info" style={{ margin: 0, fontSize: '12px' }}>
                  <span>Sandbox Mode doesn't request external networks. Ideal for local testing and demonstration.</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full">Save Gateway Settings</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
