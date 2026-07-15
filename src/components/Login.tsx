import React, { useState } from 'react';
import { supabase } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { Landmark, AlertCircle, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (userProfile: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const input = identifier.trim();
    const pass = password;

    if (!input || !pass) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Resolve email if Username was entered
    let email = input;
    const staffList = mockDb.getStaffUsers();
    
    const profileMatch = staffList.find(
      u => u.email.toLowerCase() === input.toLowerCase() ||
           (u.username && u.username.toLowerCase() === input.toLowerCase())
    );

    if (profileMatch) {
      email = profileMatch.email;
    }

    try {
      // Strictly authenticate via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        throw new Error(error.message || 'Authentication failed. Please verify your credentials.');
      }

      if (data.user) {
        // Resolve profile from public table
        let userProfile = profileMatch;
        if (!userProfile) {
          userProfile = {
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || 'Super Admin',
            role: data.user.user_metadata?.role || 'Super Administrator',
            status: 'Active',
            last_signin: new Date().toISOString(),
            created_at: new Date().toISOString(),
            username: email.split('@')[0],
            auth_id: data.user.id
          };
          const currentStaff = mockDb.getStaffUsers();
          currentStaff.push(userProfile);
          localStorage.setItem('staff_users', JSON.stringify(currentStaff));
        } else {
          // Update profile mapping
          const updated = staffList.map(u => {
            if (u.email.toLowerCase() === email.toLowerCase()) {
              return { ...u, auth_id: data.user.id, last_signin: new Date().toISOString() };
            }
            return u;
          });
          localStorage.setItem('staff_users', JSON.stringify(updated));
        }

        setSuccessMsg('Sign in successful! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(userProfile);
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const email = forgotEmail.trim();
    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMsg('Reset password link sent successfully! Please check your email inbox.');
      setForgotEmail('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
        
        {/* Logo Icon */}
        <div style={{ background: '#0F4C81', color: 'white', width: '64px', height: '64px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(15, 76, 129, 0.2)' }}>
          <Landmark size={32} />
        </div>

        {/* Branding Title */}
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0', textAlign: 'center' }}>
          Mustard Seed Fund Management
        </h1>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '32px' }}>
          SEGE DISTRICT
        </span>

        {/* Form Card */}
        <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)' }}>
          
          {!forgotMode ? (
            <>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: '0 0 6px 0' }}>
                Sign in
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 28px 0' }}>
                Access the management console.
              </p>

              <form onSubmit={handleLogin}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {errorMsg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', borderLeft: '4px solid #EF4444', color: '#B91C1C', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', borderLeft: '4px solid #10B981', color: '#047857', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
                      <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Email Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      Email or Username
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', color: '#0F172A' }}
                      placeholder="Enter email or username"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', flexGrow: 1 }}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        style={{ border: 'none', background: 'none', color: '#0F4C81', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '10px 42px 10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', color: '#0F172A' }}
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', background: '#0F4C81', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '8px' }}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>

                </div>
              </form>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{ border: 'none', background: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Reset Password
                </h2>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 28px 0' }}>
                Enter your email address and we'll send you a recovery link.
              </p>

              <form onSubmit={handleResetRequest}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {errorMsg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', borderLeft: '4px solid #EF4444', color: '#B91C1C', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', borderLeft: '4px solid #10B981', color: '#047857', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
                      <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Email Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', color: '#0F172A' }}
                      placeholder="Enter registered email"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', background: '#0F4C81', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '8px' }}
                  >
                    {loading ? 'Sending link...' : 'Send Reset Link'}
                  </button>

                </div>
              </form>
            </>
          )}

          {/* Footer Text */}
          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
            Account access is managed by your administrator.
          </div>

        </div>
      </div>
    </div>
  );
};
