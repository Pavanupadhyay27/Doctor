'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Hero() {
  const { setIsBookingModalOpen } = useCRM();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section 
      className="relative w-full h-screen flex items-center overflow-hidden" 
      style={{ minHeight: '100vh', backgroundColor: '#FAF9F6' }}
    >
      {/* Background Doctor Portrait aligned strictly to the right 50% on desktop */}
      <div 
        className="absolute right-0 top-0 h-full w-full md:w-[50%] z-0"
        style={{ 
          pointerEvents: 'none',
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'scale(1)' : 'scale(1.02)',
          transition: 'opacity 1.6s cubic-bezier(0.16, 1, 0.3, 1), transform 1.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <img 
          src="/indian_doctor.png" 
          alt="Aura Clinic Dermatologist Specialist" 
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center top' }}
        />
        
        {/* Soft mobile overlay to blend top-to-bottom on mobile */}
        <div 
          className="absolute inset-0 block md:hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(250,249,246,0.5) 0%, rgba(250,249,246,0.95) 90%)'
          }}
        ></div>
      </div>

      {/* Desktop Left half white-cream solid background */}
      <div 
        className="absolute left-0 top-0 h-full w-full md:w-[50%] hidden md:block z-5"
        style={{
          backgroundColor: '#FAF9F6',
          pointerEvents: 'none'
        }}
      ></div>

      {/* Soft desktop divider gradient to blend left cream background to right image */}
      <div 
        className="absolute inset-y-0 left-[45%] w-[10%] hidden md:block z-5"
        style={{
          background: 'linear-gradient(to right, #FAF9F6 0%, rgba(250,249,246,0.7) 40%, rgba(250,249,246,0) 100%)',
          pointerEvents: 'none'
        }}
      ></div>
      
      {/* Landing Page Content Overlay */}
      <div className="container relative z-10 w-full px-6 md:px-12 mx-auto" style={{ zIndex: 10 }}>
        <div className="max-w-xl text-left">
          
          <h1 
            style={{ 
              color: 'var(--text-dark)',
              fontSize: 'clamp(2.5rem, 5.2vw, 4rem)',
              lineHeight: '1.15',
              fontFamily: 'var(--font-heading)',
              fontWeight: 850,
              letterSpacing: '-1px',
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Healthy, <br className="hidden md:block" />
            <span style={{ color: 'var(--primary)' }}>Radiant Skin</span>
          </h1>

          <p 
            style={{
              fontSize: '17px',
              color: 'var(--text-muted)',
              margin: '20px 0 32px 0',
              lineHeight: '1.65',
              maxWidth: '460px',
              fontFamily: 'var(--font-body)',
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '150ms'
            }}
          >
            Advanced clinical dermatology and laser aesthetics custom-tailored for your unique skin by Dr. Ananya Sharma.
          </p>

          <div 
            className="flex flex-wrap gap-4"
            style={{
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '300ms'
            }}
          >
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="btn btn-primary px-8 py-4 shadow-lg text-white"
              style={{ borderRadius: '12px', fontSize: '15px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
            >
              Book Consultation <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
