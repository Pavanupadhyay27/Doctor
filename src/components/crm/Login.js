'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Login() {
  const { login } = useCRM();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Production-level validations
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    // Simulate network authentication delay (production feel)
    setTimeout(() => {
      const success = login(email, password);
      setLoading(false);
      
      if (!success) {
        setError('Invalid email or password. Please try again.');
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-teal-950/20 via-orange-500/5 to-teal-800/10 px-4">
      
      {/* Compact & Super Clean Card Container */}
      <div 
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '32px 30px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid rgba(18, 33, 30, 0.06)',
          boxShadow: '0 25px 50px -12px rgba(18, 33, 30, 0.08)'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div 
            style={{ 
              width: '40px',
              height: '40px',
              borderRadius: '50%', 
              backgroundColor: 'rgba(15, 107, 92, 0.06)', 
              color: 'var(--primary)', 
              display: 'inline-flex',
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '15px', 
              marginBottom: '10px',
              boxShadow: 'inset 0 1px 2px rgba(15, 107, 92, 0.1)'
            }}
          >
            <i className="fas fa-user-shield"></i>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '4px', letterSpacing: '-0.5px' }}>Aura CRM Login</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Provide administrator credentials to access patient charts</p>
        </div>

        {error && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '10px 12px', 
              marginBottom: '16px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(232, 93, 75, 0.05)', 
              border: '1px solid rgba(232, 93, 75, 0.15)', 
              color: 'var(--danger)', 
              fontSize: '12px', 
              fontWeight: '600'
            }}
          >
            <i className="fas fa-exclamation-circle" style={{ fontSize: '13px' }}></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Email field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-dark)', letterSpacing: '0.3px', textTransform: 'uppercase' }} htmlFor="login-email">Administrator Email</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                id="login-email" 
                placeholder="admin@auraclinic.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: '100%',
                  padding: '11px 12px 11px 38px', // Ensured 38px left padding so text never overlaps icon
                  fontSize: '13.5px',
                  color: 'var(--text-dark)',
                  backgroundColor: '#ffffff',
                  border: focusedField === 'email' ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(15, 107, 92, 0.08)' : 'none'
                }}
              />
              <i 
                className="far fa-envelope" 
                style={{ 
                  position: 'absolute', 
                  left: '13px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: focusedField === 'email' ? 'var(--primary)' : 'var(--text-muted)', 
                  fontSize: '13px',
                  transition: 'color 0.2s ease',
                  pointerEvents: 'none'
                }}
              ></i>
            </div>
          </div>

          {/* Password field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-dark)', letterSpacing: '0.3px', textTransform: 'uppercase' }} htmlFor="login-password">Portal Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="login-password" 
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{
                  width: '100%',
                  padding: '11px 36px 11px 38px', // Ensured 38px left padding so text never overlaps icon
                  fontSize: '13.5px',
                  color: 'var(--text-dark)',
                  backgroundColor: '#ffffff',
                  border: focusedField === 'password' ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(15, 107, 92, 0.08)' : 'none'
                }}
              />
              <i 
                className="fas fa-lock" 
                style={{ 
                  position: 'absolute', 
                  left: '13px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: focusedField === 'password' ? 'var(--primary)' : 'var(--text-muted)', 
                  fontSize: '13px',
                  transition: 'color 0.2s ease',
                  pointerEvents: 'none'
                }}
              ></i>
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  outline: 'none'
                }}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Submission button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px 22px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 6px 18px rgba(15, 107, 92, 0.12)',
              transition: 'all 0.25s ease',
              marginTop: '6px',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-light)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 10px 22px rgba(15, 107, 92, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(15, 107, 92, 0.12)';
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-circle-notch fa-spin"></i> Authenticating...
              </span>
            ) : (
              <>Sign In to Portal <i className="fas fa-sign-in-alt"></i></>
            )}
          </button>
        </form>

        {/* Compact Credentials reminder block */}
        <div 
          style={{
            marginTop: '20px',
            padding: '12px 14px',
            backgroundColor: 'rgba(15, 107, 92, 0.02)',
            border: '1.5px dashed rgba(15, 107, 92, 0.12)',
            borderRadius: '12px',
            fontSize: '11.5px',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1px' }}>Portal Access Details:</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Email:</span>
            <code style={{ background: '#FAF9F6', border: '1px solid var(--border)', px: '4px', py: '1px', borderRadius: '4px', color: 'var(--primary)', fontWeight: '600' }}>admin@auraclinic.in</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Password:</span>
            <code style={{ background: '#FAF9F6', border: '1px solid var(--border)', px: '4px', py: '1px', borderRadius: '4px', color: 'var(--primary)', fontWeight: '600' }}>AuraCRMProtect2026!</code>
          </div>
        </div>

      </div>
    </div>
  );
}
