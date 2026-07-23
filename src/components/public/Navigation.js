'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Navigation({ activeView, onViewChange }) {
  const { setActiveModalTreatmentId } = useCRM();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTreatmentClick = (id) => {
    setMobileOpen(false);
    setDropdownOpen(false);
    
    // 1. Scroll to Treatments section
    const treatmentsSection = document.getElementById('treatments');
    if (treatmentsSection) {
      treatmentsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 2. Open specific modal after short delay to let scroll finish
    setTimeout(() => {
      setActiveModalTreatmentId(id);
    }, 400);
  };

  const treatmentsList = [
    { id: 'laser', label: 'Laser Skin Resurfacing' },
    { id: 'botox', label: 'Botox & Dermal Fillers' },
    { id: 'peel', label: 'Chemical Peels' },
    { id: 'acne', label: 'Advanced Acne Therapy' }
  ];

  return (
    <header 
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1100px',
        height: '68px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: scrolled ? 'rgba(18, 33, 30, 0.85)' : 'rgba(18, 33, 30, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '9999px',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        boxShadow: scrolled 
          ? '0 12px 40px -10px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(255, 255, 255, 0.05) inset' 
          : '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        padding: '0 24px'
      }}
    >
      <div 
        className="w-full flex items-center justify-between mx-auto"
        style={{ height: '100%' }}
      >
        {/* Logo */}
        <a 
          href="#" 
          className="logo" 
          style={{ 
            color: '#ffffff', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '20px', 
            fontWeight: '800', 
            fontFamily: 'var(--font-heading)' 
          }}
        >
          Aura
          <span 
            className="logo-dot" 
            style={{ 
              display: 'inline-block', 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent)', 
              marginLeft: '3px' 
            }}
          ></span>
          <span 
            style={{ 
              fontSize: '11px', 
              fontWeight: '400', 
              letterSpacing: '1.5px', 
              marginLeft: '6px', 
              textTransform: 'uppercase', 
              color: 'rgba(255, 255, 255, 0.5)' 
            }}
          >
            Clinic
          </span>
        </a>
        
        {/* Nav Links */}
        <nav 
          className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`} 
          style={mobileOpen ? {
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: '80px',
            left: '5%',
            width: '90%',
            backgroundColor: 'rgba(18, 33, 30, 0.95)',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            zIndex: 999,
            gap: '16px',
            backdropFilter: 'blur(20px)'
          } : {
            display: 'flex',
            alignItems: 'center',
            gap: '28px'
          }}
        >
          <a href="#" className="nav-link" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none', fontSize: '13.5px', fontWeight: '500' }} onClick={() => setMobileOpen(false)}>Home</a>
          
          {/* Treatments Hoverable Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <span 
              className="nav-link" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                textDecoration: 'none', 
                fontSize: '13.5px', 
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              Treatments <i className="fas fa-chevron-down" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}></i>
            </span>

            {/* Glassmorphic Dropdown List */}
            {dropdownOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  paddingTop: '12px',
                  width: '240px',
                  zIndex: 1000
                }}
              >
                <div 
                  style={{
                    backgroundColor: 'rgba(18, 33, 30, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(16px)',
                    padding: '8px 0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {treatmentsList.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => handleTreatmentClick(t.id)}
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                      }}
                    >
                      {t.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <a href="#about" className="nav-link" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none', fontSize: '13.5px', fontWeight: '500' }} onClick={() => setMobileOpen(false)}>About</a>
          <a href="#testimonials" className="nav-link" style={{ color: 'rgba(255, 255, 255, 0.85)', textDecoration: 'none', fontSize: '13.5px', fontWeight: '500' }} onClick={() => setMobileOpen(false)}>Reviews</a>
          <button 
            onClick={() => {
              setMobileOpen(false);
              setIsBookingModalOpen(true);
            }}
            className="btn btn-accent btn-sm" 
            style={{ 
              padding: '8px 20px', 
              borderRadius: '9999px', 
              fontSize: '13px', 
              fontWeight: '600',
              boxShadow: 'var(--shadow-accent)',
              border: 'none',
              cursor: 'pointer'
            }} 
          >
            Book Consultation
          </button>
        </nav>
 
        {/* Mobile menu toggle */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="nav-menu-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', fontSize: '20px' }}
        >
          <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
    </header>
  );
}
