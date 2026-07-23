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
      style={{ minHeight: '100vh', backgroundColor: '#12211E' }}
    >
      {/* Background Doctor Portrait aligned strictly to the right */}
      <div 
        className="absolute right-0 top-0 h-full w-full md:w-[50%] z-0"
        style={{ 
          pointerEvents: 'none',
          opacity: isMounted ? 1 : 0,
          transform: isMounted ? 'scale(1)' : 'scale(1.04)',
          transition: 'opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1), transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <img 
          src="/indian_doctor.png" 
          alt="Aura Clinic Dermatologist Specialist" 
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center top' }}
        />
        {/* Mobile/Tablet Overlay: Fades image into background */}
        <div 
          className="absolute inset-0 block md:hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(18,33,30,0.85) 0%, rgba(18,33,30,0.95) 100%)'
          }}
        ></div>
      </div>

      {/* Desktop Left-to-Right Fade Mask */}
      <div 
        className="absolute inset-0 hidden md:block z-5"
        style={{
          background: 'linear-gradient(to right, #12211E 0%, #12211E 45%, rgba(18,33,30,0.9) 55%, rgba(18,33,30,0.2) 75%, transparent 100%)',
          pointerEvents: 'none'
        }}
      ></div>
      
      {/* Landing Page Content Overlay */}
      <div className="container relative z-10 w-full px-4 md:px-8 mx-auto" style={{ zIndex: 10 }}>
        <div className="max-w-xl text-left">
          
          <h1 
            style={{ 
              color: '#ffffff',
              fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
              lineHeight: '1.15',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              letterSpacing: '-1px',
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Healthy, <br className="hidden md:block" />
            Radiant Skin
          </h1>

          <p 
            style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '24px 0 36px 0',
              lineHeight: '1.6',
              maxWidth: '460px',
              fontFamily: 'var(--font-body)',
              opacity: isMounted ? 1 : 0,
              transform: isMounted ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: '150ms'
            }}
          >
            Advanced clinical dermatology and laser rejuvenation therapies custom-tailored for your unique skin by Dr. Ananya Sharma.
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
              className="btn btn-accent px-8 py-4 shadow-lg shadow-coral-500/10 text-white"
              style={{ borderRadius: '8px', fontSize: '15px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
              Book Consultation <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
