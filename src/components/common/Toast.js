'use client';

import React from 'react';

export default function Toast({ toast, onClose }) {
  if (!toast || !toast.message) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '16px',
        backgroundColor: 'rgba(10, 22, 20, 0.95)',
        color: '#ffffff',
        border: isError ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(15, 107, 92, 0.4)',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(15, 107, 92, 0.15)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        maxWidth: '420px',
        animation: 'toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div 
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 107, 92, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: isError ? '#ef4444' : '#10b981'
        }}
      >
        <i className={isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'} style={{ fontSize: '15px' }}></i>
      </div>

      <div style={{ flexGrow: 1, fontSize: '13.5px', fontWeight: '500', lineHeight: '1.4', color: 'rgba(255, 255, 255, 0.92)' }}>
        {toast.message}
      </div>

      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.4)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          borderRadius: '6px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
      >
        <i className="fas fa-times"></i>
      </button>

      <style jsx global>{`
        @keyframes toastSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
