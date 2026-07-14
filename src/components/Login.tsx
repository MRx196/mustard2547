import React, { useState } from 'react';
import { supabase } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { Landmark, AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (userProfile: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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

    // Resolve email if Username/Email was entered
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
      // 1. Attempt Authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        // 2. Local Fallback authentication matching seed accounts
        if (
          (email === 'mrxmail20@gmail.com' && pass === 'Admin@12!') ||
          (email === 'accountant@mustardseed.org' && pass === 'Password123') ||
          (email === 'loans@mustardseed.org' && pass === 'Password123') ||
          (email === 'momo@mustardseed.org' && pass === 'Password123') ||
          (email === 'auditor@mustardseed.org' && pass === 'Password123')
        ) {
          // If profileMatch exists, use it, otherwise create one for mrxmail20@gmail.com
          let matched = profileMatch;
          if (!matched && email === 'mrxmail20@gmail.com') {
            matched = {
              email: 'mrxmail20@gmail.com',
              full_name: 'Super Admin',
              role: 'Super Administrator',
              status: 'Active',
              last_signin: new Date().toISOString(),
              created_at: new Date().toISOString(),
              username: 'superadmin',
              phone_number: '+233240001100'
            };
            const currentStaff = mockDb.getStaffUsers();
            currentStaff.push(matched);
            localStorage.setItem('staff_users', JSON.stringify(currentStaff));
          }

          if (matched) {
            // Update last sign-in
            const updated = staffList.map(u => {
              if (u.email.toLowerCase() === email.toLowerCase()) {
                return { ...u, last_signin: new Date().toISOString() };
              }
              return u;
            });
            localStorage.setItem('staff_users', JSON.stringify(updated));

            setSuccessMsg('Sign in successful (Local Bypass)! Redirecting...');
            setTimeout(() => {
              onLoginSuccess(matched);
            }, 1000);
            return;
          }
        }

        setErrorMsg(error.message || 'Authentication failed. Please verify credentials.');
      } else if (data.user) {
        // Supabase Auth succeeded!
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
            auth_user_id: data.user.id
          };
          const currentStaff = mockDb.getStaffUsers();
          currentStaff.push(userProfile);
          localStorage.setItem('staff_users', JSON.stringify(currentStaff));
        } else {
          const updated = staffList.map(u => {
            if (u.email.toLowerCase() === email.toLowerCase()) {
              return { ...u, auth_user_id: data.user.id, last_signin: new Date().toISOString() };
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

        {/* Login Form Card */}
        <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)' }}>
          
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
                  Email address
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', color: '#0F172A' }}
                  placeholder=""
                  required
                />
              </div>

              {/* Password Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', background: '#FFFFFF', color: '#0F172A' }}
                  placeholder=""
                  required
                />
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

          {/* Footer Text */}
          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
            Account access is managed by your administrator.
          </div>

        </div>
      </div>
    </div>
  );
};
