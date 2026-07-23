'use client';

import React from 'react';
import { useCRM } from '@/context/CRMState';
import Navigation from '@/components/public/Navigation';
import AdminShell from '@/components/crm/AdminShell';
import Login from '@/components/crm/Login';

export default function AdminPage() {
  const { isAuthenticated, logout } = useCRM();

  // Redirect to home if they toggle view via navigation or custom events
  const handleViewChange = (view) => {
    if (view === 'public') {
      window.location.href = '/';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        {/* Back to public link */}
        <div style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 50 }}>
          <a 
            href="/" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: 'var(--text-muted)', 
              fontSize: '14px', 
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              padding: '10px 16px',
              backgroundColor: '#ffffff',
              borderRadius: '30px',
              boxShadow: '0 4px 12px rgba(18, 33, 30, 0.05)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.transform = 'translateX(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to website
          </a>
        </div>
        <Login />
      </div>
    );
  }

  // Once authenticated, render the full admin crm dashboard shell
  return (
    <AdminShell 
      onViewChange={(view) => {
        if (view === 'public') {
          logout();
          window.location.href = '/';
        }
      }} 
    />
  );
}
