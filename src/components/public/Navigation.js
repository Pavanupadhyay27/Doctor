'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Navigation({ activeView, onViewChange, onOpenTreatmentPage }) {
  const { setIsBookingModalOpen } = useCRM();
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
    if (onOpenTreatmentPage) {
      onOpenTreatmentPage(id);
      window.scrollTo(0, 0);
    }
  };

  const treatmentsList = [
    { id: 'laser', label: 'Laser Skin Resurfacing', icon: 'fas fa-wand-magic-sparkles' },
    { id: 'botox', label: 'Botox & Dermal Fillers', icon: 'fas fa-syringe' },
    { id: 'peel', label: 'Chemical Peels', icon: 'fas fa-droplet' },
    { id: 'acne', label: 'Advanced Acne Therapy', icon: 'fas fa-shield-heart' }
  ];

  const navLinkStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.2px',
    cursor: 'pointer',
    padding: '6px 0',
    borderBottom: '1.5px solid transparent'
  };

  const navLinkHoverHandlers = {
    onMouseEnter: (e) => {
      e.currentTarget.style.color = '#ffffff';
      e.currentTarget.style.borderBottomColor = 'var(--accent)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
      e.currentTarget.style.borderBottomColor = 'transparent';
    }
  };

  return (
    <header 
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: '1060px',
        height: '60px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: scrolled ? 'rgba(10, 22, 20, 0.95)' : 'rgba(10, 22, 20, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        padding: '0 28px'
      }}
    >
      <div 
        className="w-full flex items-center justify-between mx-auto"
        style={{ height: '100%' }}
      >
        {/* Logo */}
        <a 
          href="#" 
          style={{ 
            color: '#ffffff', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2px',
            fontSize: '19px', 
            fontWeight: '850', 
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.3px'
          }}
        >
          Aura
          <span style={{ 
            display: 'inline-block', 
            width: '5px', 
            height: '5px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--accent)', 
            marginBottom: '8px'
          }}></span>
          <span style={{ 
            fontSize: '9px', 
            fontWeight: '700', 
            letterSpacing: '2.5px', 
            marginLeft: '4px', 
            textTransform: 'uppercase', 
            color: 'rgba(255, 255, 255, 0.4)' 
          }}>
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
            top: '84px',
            left: '4%',
            width: '92%',
            backgroundColor: 'rgba(10, 22, 20, 0.97)',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            zIndex: 999,
            gap: '4px',
            backdropFilter: 'blur(20px)'
          } : {
            display: 'flex',
            alignItems: 'center',
            gap: '32px'
          }}
        >
          <a 
            href="#" 
            style={navLinkStyle} 
            {...navLinkHoverHandlers}
            onClick={() => setMobileOpen(false)}
          >
            Home
          </a>
          
          {/* Treatments Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <span 
              style={{ 
                ...navLinkStyle,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              {...navLinkHoverHandlers}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Treatments
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}>
                <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>

            {/* Dropdown */}
            {dropdownOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  paddingTop: '10px',
                  width: '260px',
                  zIndex: 1001
                }}
              >
                <div 
                  style={{
                    backgroundColor: 'rgba(10, 22, 20, 0.97)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(20px)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  {treatmentsList.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => handleTreatmentClick(t.id)}
                      style={{
                        padding: '10px 14px',
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      }}
                    >
                      <i className={t.icon} style={{ fontSize: '12px', color: 'var(--accent)', width: '16px', textAlign: 'center' }}></i>
                      {t.label}
                    </div>
                  ))}

                  {/* View All link */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }}>
                    <a 
                      href="#treatments"
                      onClick={() => { setDropdownOpen(false); setMobileOpen(false); }}
                      style={{
                        padding: '10px 14px',
                        fontSize: '12px',
                        color: 'var(--accent)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      View all treatments
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <a 
            href="#about" 
            style={navLinkStyle} 
            {...navLinkHoverHandlers}
            onClick={() => setMobileOpen(false)}
          >
            About
          </a>
          <a 
            href="#testimonials" 
            style={navLinkStyle}
            {...navLinkHoverHandlers}
            onClick={() => setMobileOpen(false)}
          >
            Reviews
          </a>

          <button 
            onClick={() => {
              setMobileOpen(false);
              setIsBookingModalOpen(true);
            }}
            style={{ 
              padding: '9px 22px', 
              borderRadius: '10px', 
              fontSize: '12.5px', 
              fontWeight: '700',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.3px'
            }} 
          >
            Book Consultation
          </button>
        </nav>
 
        {/* Mobile menu toggle */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="nav-menu-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', fontSize: '18px' }}
        >
          <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
    </header>
  );
}
