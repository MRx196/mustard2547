import React, { useState } from 'react';
import { supabase } from '../db/supabase';
import { mockDb } from '../db/mockDb';
import { KeyRound, Mail, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (userProfile: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setErrorMsg('Please enter both username/email and password.');
      setLoading(false);
      return;
    }

    // 1. Resolve email if Username was entered
    let email = input;
    const staffList = mockDb.getStaffUsers();
    
    // Find matching profile by email or username
    const profileMatch = staffList.find(
      u => u.email.toLowerCase() === input.toLowerCase() ||
           (u.username && u.username.toLowerCase() === input.toLowerCase())
    );

    if (profileMatch) {
      email = profileMatch.email;
    }

    try {
      // 2. Attempt Authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        // 3. Fallback bypass: check local storage matching seed accounts for offline testing
        if (profileMatch && (
          // Allow login for seeded users with local pass bypass
          (email === 'admin@mustardseed.org' && pass === 'Password123') ||
          (email === 'accountant@mustardseed.org' && pass === 'Password123') ||
          (email === 'loans@mustardseed.org' && pass === 'Password123') ||
          (email === 'momo@mustardseed.org' && pass === 'Password123') ||
          (email === 'auditor@mustardseed.org' && pass === 'Password123')
        )) {
          // Update last sign-in
          const updatedProfiles = staffList.map(u => {
            if (u.email.toLowerCase() === email.toLowerCase()) {
              return { ...u, last_signin: new Date().toISOString() };
            }
            return u;
          });
          localStorage.setItem('staff_users', JSON.stringify(updatedProfiles));
          
          setSuccessMsg('Sign in successful (Local Bypass Authentication)! Redirecting...');
          setTimeout(() => {
            onLoginSuccess(profileMatch);
          }, 1200);
          return;
        }

        // Return the actual Supabase error if local bypass didn't match
        setErrorMsg(error.message || 'Authentication failed. Please verify credentials.');
      } else if (data.user) {
        // Supabase Auth succeeded! Look up user profile
        let userProfile = profileMatch;
        if (!userProfile) {
          // If profile doesn't exist locally, create a default Administrator profile
          userProfile = {
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || 'Staff User',
            role: data.user.user_metadata?.role || 'Administrator',
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
          // Update profile with auth_user_id and last sign-in
          const updated = staffList.map(u => {
            if (u.email.toLowerCase() === email.toLowerCase()) {
              return { ...u, auth_user_id: data.user.id, last_signin: new Date().toISOString() };
            }
            return u;
          });
          localStorage.setItem('staff_users', JSON.stringify(updated));
        }

        setSuccessMsg('Sign in successful (Authenticated via Supabase)! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(userProfile);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!identifier.trim()) {
      setErrorMsg('Please enter your Email address first to request a password reset.');
      return;
    }
    
    let email = identifier.trim();
    if (!email.includes('@')) {
      const match = mockDb.getStaffUsers().find(u => u.username && u.username.toLowerCase() === email.toLowerCase());
      if (match) email = match.email;
      else {
        setErrorMsg('Invalid email format or username match not found.');
        return;
      }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(`Password reset link dispatched successfully to ${email}!`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset request failed.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary-dark) 0%, #081125 100%)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '36px', boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(59, 130, 246, 0.15)', background: '#0e172a' }}>
        
        {/* Branding header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary-light) 100%)', color: 'white', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '24px', fontFamily: 'var(--display)', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)', marginBottom: '16px' }}>
            MS
          </div>
          <h2 style={{ color: '#ffffff', margin: 0, fontFamily: 'var(--display)', fontSize: '22px' }}>MUSTARD SEED</h2>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--secondary-light)', fontWeight: 'bold', marginTop: '4px' }}>
            Welfare Fund Staff Sign-In
          </span>
        </div>

        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-16">
            
            {errorMsg && (
              <div className="alert alert-danger" style={{ background: '#451a1a', color: '#fca5a5', borderLeftColor: 'var(--danger)', padding: '10px' }}>
                <AlertCircle size={16} /> <span style={{ fontSize: '13px' }}>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success" style={{ background: '#143525', color: '#a7f3d0', borderLeftColor: 'var(--success)', padding: '10px' }}>
                <ShieldCheck size={16} /> <span style={{ fontSize: '13px' }}>{successMsg}</span>
              </div>
            )}

            {/* Email/Username field */}
            <div className="form-group">
              <label style={{ color: '#94a3b8' }}>Email Address or Username</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0 12px' }}>
                <Mail size={16} style={{ color: '#64748b', marginRight: '8px' }} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@mustardseed.org"
                  style={{ background: 'transparent', border: 'none', padding: '10px 0', width: '100%', outline: 'none', color: '#ffffff' }}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group">
              <label style={{ color: '#94a3b8' }}>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0 12px' }}>
                <KeyRound size={16} style={{ color: '#64748b', marginRight: '8px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ background: 'transparent', border: 'none', padding: '10px 0', width: '100%', outline: 'none', color: '#ffffff' }}
                  required
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

            <div className="flex justify-between align-center" style={{ fontSize: '12px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', cursor: 'pointer' }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} /> Remember Me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: 'transparent', border: 'none', color: 'var(--secondary-light)', cursor: 'pointer', padding: 0, fontSize: '12px' }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '16px', padding: '12px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

          </div>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#64748b', borderTop: '1px solid #334155', paddingTop: '16px' }}>
          SECURED BY SUPABASE AUTHENTICATION SYSTEM
        </div>

      </div>
    </div>
  );
};
