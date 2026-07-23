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

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please type a valid email.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      setLoading(false);
      
      if (!success) {
        setError('Invalid credentials. Check details below.');
      }
    }, 400);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      
      {/* Left Pane - Clinic Image */}
      <div 
        style={{
          width: '55%',
          position: 'relative',
          backgroundColor: '#050b0a',
          borderRight: '1px solid rgba(0, 0, 0, 0.05)'
        }}
        className="hidden md:block"
      >
        <img
          src="/doctor_login.png"
          alt="Aura Clinic Doctor"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.8)'
          }}
        />
        
        {/* Soft luxury branding stamp */}
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '60px',
          zIndex: 10,
          color: '#ffffff',
          maxWidth: '460px'
        }}>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '34px', 
            fontWeight: '850', 
            color: '#ffffff', 
            letterSpacing: '-1px', 
            margin: 0,
            lineHeight: '1.2'
          }}>
            Aura Clinic
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '8px', lineHeight: '1.4' }}>
            Board-certified clinical dermatology, laser therapies, and advanced skin care technologies.
          </p>
        </div>
      </div>

      {/* Right Pane - Premium Login UI */}
      <div 
        style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          backgroundColor: '#FAF9F6' // Very soft pristine grey
        }}
        className="w-full md:w-[45%]"
      >
        <div style={{ 
          width: '100%', 
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          padding: '40px 36px',
          borderRadius: '24px',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.02)'
        }}>
          
          {/* Header */}
          <div style={{ marginBottom: '28px', textAlign: 'center' }}>
            <div style={{ 
              width: '48px',
              height: '48px',
              borderRadius: '50%', 
              backgroundColor: '#0F6B5C', 
              color: '#ffffff', 
              display: 'inline-flex',
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '18px', 
              marginBottom: '16px',
              boxShadow: '0 8px 20px rgba(15, 107, 92, 0.15)'
            }}>
              <i className="fas fa-shield-halved"></i>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '850', color: 'var(--text-dark)', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Staff Sign In
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Sign in with credentials to access patient logs and clinical metrics.
            </p>
          </div>

          {error && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px 14px', 
              marginBottom: '20px', 
              borderRadius: '10px', 
              backgroundColor: '#FFF5F5', 
              border: '1px solid #FFE3E3', 
              color: 'var(--danger)', 
              fontSize: '12.5px', 
              fontWeight: '700',
              animation: 'none',
              transition: 'none'
            }}>
              <i className="fas fa-exclamation-circle" style={{ fontSize: '13px' }}></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Email field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }} htmlFor="login-email">
                Email Address
              </label>
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
                    padding: '12px 12px 12px 38px',
                    fontSize: '14px',
                    color: 'var(--text-dark)',
                    backgroundColor: '#FAF9F6',
                    border: focusedField === 'email' ? '1.5px solid #0F6B5C' : '1.5px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'none',
                    boxShadow: 'none'
                  }}
                />
                <i className="far fa-envelope" style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: focusedField === 'email' ? '#0F6B5C' : 'var(--text-muted)', 
                  fontSize: '13.5px',
                  pointerEvents: 'none'
                }} />
              </div>
            </div>

            {/* Password field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }} htmlFor="login-password">
                Portal Password
              </label>
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
                    padding: '12px 36px 12px 38px',
                    fontSize: '14px',
                    color: 'var(--text-dark)',
                    backgroundColor: '#FAF9F6',
                    border: focusedField === 'password' ? '1.5px solid #0F6B5C' : '1.5px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'none',
                    boxShadow: 'none'
                  }}
                />
                <i className="fas fa-lock" style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: focusedField === 'password' ? '#0F6B5C' : 'var(--text-muted)', 
                  fontSize: '13.5px',
                  pointerEvents: 'none'
                }} />
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
                padding: '12px 22px',
                backgroundColor: '#0F6B5C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '750',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '10px',
                outline: 'none',
                boxShadow: 'none',
                transition: 'none'
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-circle-notch fa-spin"></i> Loading...
                </span>
              ) : (
                <>Sign In to Suite <i className="fas fa-sign-in-alt"></i></>
              )}
            </button>
          </form>

          {/* Credentials Info Panel */}
          <div style={{
            marginTop: '28px',
            padding: '14px',
            backgroundColor: '#FAF9F5',
            border: '1px dashed rgba(15, 107, 92, 0.15)',
            borderRadius: '12px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ fontWeight: '800', color: 'var(--text-dark)' }}>Demo Account Details:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Email:</span>
              <code style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', color: '#0F6B5C', fontWeight: '700' }}>admin@auraclinic.in</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Password:</span>
              <code style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', color: '#0F6B5C', fontWeight: '700' }}>AuraCRMProtect2026!</code>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
