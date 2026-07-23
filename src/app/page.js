'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMState';
import Navigation from '@/components/public/Navigation';
import Hero from '@/components/public/Hero';
import Treatments from '@/components/public/Treatments';
import BeforeAfter from '@/components/public/BeforeAfter';
import Testimonials from '@/components/public/Testimonials';
import FormWizard from '@/components/public/FormWizard';
import AdminShell from '@/components/crm/AdminShell';
import Login from '@/components/crm/Login';

export default function Home() {
  const { addLead, isAuthenticated, isBookingModalOpen, setIsBookingModalOpen } = useCRM();
  const [activeView, setActiveView] = useState('public');
  const [selectedTreatment, setSelectedTreatment] = useState('');

  // Active Step state for the animated Journey flow
  const [activeStep, setActiveStep] = useState(0);
  const [userInteractedWithStep, setUserInteractedWithStep] = useState(false);

  useEffect(() => {
    if (userInteractedWithStep) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 3800);
    return () => clearInterval(interval);
  }, [userInteractedWithStep]);

  // Quick booking strip state
  const [quickData, setQuickData] = useState({
    name: '',
    phone: '',
    treatment: ''
  });

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickData.name.trim() || !quickData.phone.trim() || !quickData.treatment) {
      alert('Please fill out all fields in the consultation strip.');
      return;
    }

    addLead({
      name: quickData.name,
      phone: quickData.phone,
      email: 'quick-lead@example.com',
      treatment: quickData.treatment,
      notes: 'Submitted via Quick Booking Strip.'
    });

    alert(`Thank you, ${quickData.name}! Your inquiry for ${quickData.treatment} has been logged in our CRM. Dr. Sharma's team will contact you within 24 hours.`);
    setQuickData({ name: '', phone: '', treatment: '' });
  };

  const handleSelectTreatment = (name) => {
    setSelectedTreatment(name);
    // Smooth scroll to form wizard
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (activeView === 'crm') {
    // Protected Route Gate logic
    if (!isAuthenticated) {
      return (
        <div className="relative min-h-screen bg-[#FAF9F6]">
          <Navigation activeView={activeView} onViewChange={setActiveView} />
          <div className="pt-20">
            <Login />
          </div>
        </div>
      );
    }
    return <AdminShell onViewChange={setActiveView} />;
  }

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#1E2A28]">
      {/* Navbar */}
      <Navigation activeView={activeView} onViewChange={setActiveView} />

      {/* Hero (Covers whole window with Indian Doctor background) */}
      <Hero />

      {/* Quick Booking Strip */}
      <div className="container mx-auto px-4 relative z-20" style={{ marginTop: '-45px', maxWidth: '1100px' }}>
        <form 
          id="quick-booking-form" 
          onSubmit={handleQuickSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            alignItems: 'end',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px 40px',
            border: '1px solid rgba(18, 33, 30, 0.08)',
            boxShadow: '0 20px 50px -12px rgba(18, 33, 30, 0.12), 0 4px 12px -2px rgba(18, 33, 30, 0.04)',
          }}
        >
          {/* Fallback to grid columns layout on desktop */}
          <style jsx>{`
            @media (min-width: 1024px) {
              #quick-booking-form {
                grid-template-columns: 1fr 1fr 1.2fr auto !important;
              }
            }
          `}</style>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label 
              style={{ 
                fontSize: '11px', 
                fontWeight: '700', 
                color: 'var(--text-dark)', 
                textTransform: 'uppercase', 
                letterSpacing: '1px' 
              }} 
              htmlFor="quick-name"
            >
              Your Name
            </label>
            <input 
              type="text" 
              id="quick-name" 
              placeholder="e.g. Jane Doe"
              value={quickData.name}
              onChange={(e) => setQuickData(prev => ({ ...prev, name: e.target.value }))}
              required 
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: '#FAF9F6',
                color: 'var(--text-dark)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label 
              style={{ 
                fontSize: '11px', 
                fontWeight: '700', 
                color: 'var(--text-dark)', 
                textTransform: 'uppercase', 
                letterSpacing: '1px' 
              }} 
              htmlFor="quick-phone"
            >
              Phone Number
            </label>
            <input 
              type="tel" 
              id="quick-phone" 
              placeholder="+91 98765 43210"
              value={quickData.phone}
              onChange={(e) => setQuickData(prev => ({ ...prev, phone: e.target.value }))}
              required 
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: '#FAF9F6',
                color: 'var(--text-dark)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label 
              style={{ 
                fontSize: '11px', 
                fontWeight: '700', 
                color: 'var(--text-dark)', 
                textTransform: 'uppercase', 
                letterSpacing: '1px' 
              }} 
              htmlFor="quick-treatment"
            >
              Treatment Interest
            </label>
            <select 
              id="quick-treatment" 
              value={quickData.treatment}
              onChange={(e) => setQuickData(prev => ({ ...prev, treatment: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: '#FAF9F6',
                color: 'var(--text-dark)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <option value="" disabled>Select treatment</option>
              <option value="Laser Skin Resurfacing">Laser Skin Resurfacing</option>
              <option value="Botox & Dermal Fillers">Botox & Dermal Fillers</option>
              <option value="Chemical Peels">Chemical Peels</option>
              <option value="Advanced Acne Therapy">Advanced Acne Therapy</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-accent"
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(255, 122, 89, 0.2)',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '49px'
            }}
          >
            Get Consultation
          </button>
        </form>
      </div>

      {/* Treatments Cards Grid */}
      <Treatments onSelectTreatment={handleSelectTreatment} />

      {/* Why Choose Us & Process Timeline */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4" style={{ maxWidth: '1200px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-tag" style={{ display: 'block', marginBottom: '8px' }}>Patient Experience</span>
            <h2 className="section-title" style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '16px' }}>The Aura Treatment Journey</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto' }}>
              We believe in a structured, transparent approach to skincare. From the initial skin scan to the final recovery follow-up, your safety and satisfaction are our primary objectives.
            </p>
          </div>

          {/* Animated Center Step Flow */}
          <div style={{ maxWidth: '720px', margin: '0 auto 80px auto', position: 'relative', paddingLeft: '24px' }}>
            
            {/* The Connecting Line Track */}
            <div 
              style={{
                position: 'absolute',
                left: '43px',
                top: '28px',
                bottom: '28px',
                width: '3px',
                backgroundColor: '#FAF9F6',
                border: '1px solid var(--border)',
                zIndex: 1
              }}
            >
              {/* Animated Progress Fill Line */}
              <div 
                style={{
                  width: '100%',
                  height: `${(activeStep / 3.0) * 100}%`,
                  backgroundColor: 'var(--primary)',
                  transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
              >
                {/* Glowing Traveler Pulse Dot */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    boxShadow: '0 0 12px 4px rgba(15, 107, 92, 0.5)',
                    animation: 'pulse 1.8s infinite'
                  }}
                ></div>
              </div>
            </div>

            {/* Step Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Step 1 */}
              <div 
                onClick={() => {
                  setActiveStep(0);
                  setUserInteractedWithStep(true);
                }}
                onMouseEnter={() => {
                  setActiveStep(0);
                  setUserInteractedWithStep(true);
                }}
                style={{
                  display: 'flex',
                  gap: '24px',
                  position: 'relative',
                  zIndex: 2,
                  cursor: 'pointer',
                  opacity: activeStep === 0 ? 1 : 0.55,
                  transform: activeStep === 0 ? 'translateX(8px)' : 'translateX(0)',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ 
                  flexShrink: 0, 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%', 
                  border: activeStep === 0 ? '2px solid var(--primary)' : '2px solid var(--border)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontFamily: 'var(--font-serif)', 
                  fontStyle: 'italic', 
                  fontWeight: 700, 
                  color: activeStep === 0 ? '#ffffff' : 'var(--text-muted)', 
                  backgroundColor: activeStep === 0 ? 'var(--primary)' : '#ffffff', 
                  fontSize: '15px',
                  boxShadow: activeStep === 0 ? '0 4px 12px rgba(15, 107, 92, 0.2)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeStep === 0 ? 'scale(1.1) rotate(360deg)' : 'scale(1) rotate(0)'
                }}>
                  01
                </div>
                <div style={{
                  padding: '24px',
                  backgroundColor: activeStep === 0 ? 'rgba(15, 107, 92, 0.03)' : '#ffffff',
                  border: activeStep === 0 ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: activeStep === 0 ? '0 10px 30px rgba(15, 107, 92, 0.05)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  flexGrow: 1
                }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '750', color: 'var(--text-dark)' }}>Clinical Assessment</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.6' }}>Visual skin analysis and medical history check to define core objectives.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div 
                onClick={() => {
                  setActiveStep(1);
                  setUserInteractedWithStep(true);
                }}
                onMouseEnter={() => {
                  setActiveStep(1);
                  setUserInteractedWithStep(true);
                }}
                style={{
                  display: 'flex',
                  gap: '24px',
                  position: 'relative',
                  zIndex: 2,
                  cursor: 'pointer',
                  opacity: activeStep === 1 ? 1 : 0.55,
                  transform: activeStep === 1 ? 'translateX(8px)' : 'translateX(0)',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ 
                  flexShrink: 0, 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%', 
                  border: activeStep === 1 ? '2px solid var(--primary)' : '2px solid var(--border)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontFamily: 'var(--font-serif)', 
                  fontStyle: 'italic', 
                  fontWeight: 700, 
                  color: activeStep === 1 ? '#ffffff' : 'var(--text-muted)', 
                  backgroundColor: activeStep === 1 ? 'var(--primary)' : '#ffffff', 
                  fontSize: '15px',
                  boxShadow: activeStep === 1 ? '0 4px 12px rgba(15, 107, 92, 0.2)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeStep === 1 ? 'scale(1.1) rotate(360deg)' : 'scale(1) rotate(0)'
                }}>
                  02
                </div>
                <div style={{
                  padding: '24px',
                  backgroundColor: activeStep === 1 ? 'rgba(15, 107, 92, 0.03)' : '#ffffff',
                  border: activeStep === 1 ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: activeStep === 1 ? '0 10px 30px rgba(15, 107, 92, 0.05)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  flexGrow: 1
                }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '750', color: 'var(--text-dark)' }}>Tailored Plan</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.6' }}>A customized schedule outlining procedure details, recovery times, and budget options.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => {
                  setActiveStep(2);
                  setUserInteractedWithStep(true);
                }}
                onMouseEnter={() => {
                  setActiveStep(2);
                  setUserInteractedWithStep(true);
                }}
                style={{
                  display: 'flex',
                  gap: '24px',
                  position: 'relative',
                  zIndex: 2,
                  cursor: 'pointer',
                  opacity: activeStep === 2 ? 1 : 0.55,
                  transform: activeStep === 2 ? 'translateX(8px)' : 'translateX(0)',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ 
                  flexShrink: 0, 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%', 
                  border: activeStep === 2 ? '2px solid var(--primary)' : '2px solid var(--border)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontFamily: 'var(--font-serif)', 
                  fontStyle: 'italic', 
                  fontWeight: 700, 
                  color: activeStep === 2 ? '#ffffff' : 'var(--text-muted)', 
                  backgroundColor: activeStep === 2 ? 'var(--primary)' : '#ffffff', 
                  fontSize: '15px',
                  boxShadow: activeStep === 2 ? '0 4px 12px rgba(15, 107, 92, 0.2)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeStep === 2 ? 'scale(1.1) rotate(360deg)' : 'scale(1) rotate(0)'
                }}>
                  03
                </div>
                <div style={{
                  padding: '24px',
                  backgroundColor: activeStep === 2 ? 'rgba(15, 107, 92, 0.03)' : '#ffffff',
                  border: activeStep === 2 ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: activeStep === 2 ? '0 10px 30px rgba(15, 107, 92, 0.05)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  flexGrow: 1
                }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '750', color: 'var(--text-dark)' }}>Skilled Procedure</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.6' }}>Conducted in our comfortable, sterile treatment bays using specialized clinical equipment.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div 
                onClick={() => {
                  setActiveStep(3);
                  setUserInteractedWithStep(true);
                }}
                onMouseEnter={() => {
                  setActiveStep(3);
                  setUserInteractedWithStep(true);
                }}
                style={{
                  display: 'flex',
                  gap: '24px',
                  position: 'relative',
                  zIndex: 2,
                  cursor: 'pointer',
                  opacity: activeStep === 3 ? 1 : 0.55,
                  transform: activeStep === 3 ? 'translateX(8px)' : 'translateX(0)',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ 
                  flexShrink: 0, 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%', 
                  border: activeStep === 3 ? '2px solid var(--primary)' : '2px solid var(--border)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontFamily: 'var(--font-serif)', 
                  fontStyle: 'italic', 
                  fontWeight: 700, 
                  color: activeStep === 3 ? '#ffffff' : 'var(--text-muted)', 
                  backgroundColor: activeStep === 3 ? 'var(--primary)' : '#ffffff', 
                  fontSize: '15px',
                  boxShadow: activeStep === 3 ? '0 4px 12px rgba(15, 107, 92, 0.2)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: activeStep === 3 ? 'scale(1.1) rotate(360deg)' : 'scale(1) rotate(0)'
                }}>
                  04
                </div>
                <div style={{
                  padding: '24px',
                  backgroundColor: activeStep === 3 ? 'rgba(15, 107, 92, 0.03)' : '#ffffff',
                  border: activeStep === 3 ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: activeStep === 3 ? '0 10px 30px rgba(15, 107, 92, 0.05)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  flexGrow: 1
                }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '750', color: 'var(--text-dark)' }}>Continuous Support</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.6' }}>Detailed post-care products and direct follow-ups from our medical staff.</p>
                </div>
              </div>

            </div>
          </div>
          
          {/* Features Row */}
          <div className="features-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', width: '100%' }}>
            <div className="feature-box" style={{ padding: '28px', border: '1px solid var(--border)', borderRadius: '16px', backgroundColor: '#ffffff', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <div className="feature-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(15, 107, 92, 0.06)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '20px' }}>
                <i className="fas fa-user-md"></i>
              </div>
              <h3 className="feature-box-title" style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>MD Specialist</h3>
              <p className="feature-box-desc" style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>All diagnostics and injections are completed personally by Dr. Ananya Sharma.</p>
            </div>
            
            <div className="feature-box" style={{ padding: '28px', border: '1px solid var(--border)', borderRadius: '16px', backgroundColor: '#ffffff', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <div className="feature-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(15, 107, 92, 0.06)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '20px' }}>
                <i className="fas fa-microscope"></i>
              </div>
              <h3 className="feature-box-title" style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>Modern Laser Tech</h3>
              <p className="feature-box-desc" style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>Using FDA-approved lasers with chilling tips for maximum patient safety.</p>
            </div>

            <div className="feature-box" style={{ padding: '28px', border: '1px solid var(--border)', borderRadius: '16px', backgroundColor: '#ffffff', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <div className="feature-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(15, 107, 92, 0.06)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '20px' }}>
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3 className="feature-box-title" style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>Personal Follow-up</h3>
              <p className="feature-box-desc" style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>No patient is left unattended. We check on you daily post-procedure.</p>
            </div>

            <div className="feature-box" style={{ padding: '28px', border: '1px solid var(--border)', borderRadius: '16px', backgroundColor: '#ffffff', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <div className="feature-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(15, 107, 92, 0.06)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '20px' }}>
                <i className="fas fa-flask"></i>
              </div>
              <h3 className="feature-box-title" style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '10px' }}>Clean Formulations</h3>
              <p className="feature-box-desc" style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>We use clinically tested, fragrance-free serums for post-care healing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Bio Block */}
      <section id="about" className="section-padding" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="container mx-auto px-4" style={{ maxWidth: '1200px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '80px', alignItems: 'center' }}>
          
          {/* Picture Frame Image Styling */}
          <div 
            className="doctor-img-wrapper" 
            style={{ 
              overflow: 'hidden', 
              borderRadius: '24px', 
              border: '1px solid rgba(18, 33, 30, 0.08)', 
              boxShadow: '0 30px 70px -15px rgba(18, 33, 30, 0.15)', 
              backgroundColor: '#ffffff', 
              padding: '12px',
              maxHeight: '560px'
            }}
          >
            <img 
              src="/indian_doctor_portrait.png" 
              alt="Dr. Ananya Sharma" 
              className="doctor-image" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: '16px'
              }} 
            />
          </div>

          <div>
            <span className="section-tag" style={{ color: 'var(--accent)' }}>Meet the Doctor</span>
            <h2 className="doctor-name" style={{ fontSize: '38px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>Dr. Ananya Sharma, MD, FAAD</h2>
            <span className="doctor-title" style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', fontWeight: '600', marginBottom: '24px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Board-Certified Dermatologist & Aesthetics Specialist</span>
            <p className="doctor-bio" style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.75', fontSize: '15px' }}>
              Dr. Ananya Sharma completed her MBBS at the prestigious All India Institute of Medical Sciences (AIIMS) in New Delhi, followed by a post-graduate dermatology residency at the Stanford University School of Medicine. With over 15 years of experience in luxury aesthetics, laser rejuvenation, and clinical corrective dermatology, she is recognized as one of the region's leading authorities.
              <br /><br />
              She is an active member of the Indian Association of Dermatologists (IADVL) and a Fellow of the American Academy of Dermatology (FAAD). She is dedicated to delivering natural, subtle rejuvenation results that enhance her patients' confidence.
            </p>
            
            <div className="doctor-creds" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
              <div className="cred-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-dark)', fontWeight: '600' }}>
                <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(15, 107, 92, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                  <i className="fas fa-check"></i>
                </div>
                AIIMS New Delhi Graduate
              </div>
              <div className="cred-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-dark)', fontWeight: '600' }}>
                <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(15, 107, 92, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                  <i className="fas fa-check"></i>
                </div>
                Stanford Derm Residency
              </div>
              <div className="cred-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-dark)', fontWeight: '600' }}>
                <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(15, 107, 92, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                  <i className="fas fa-check"></i>
                </div>
                15+ Years Clinical Practice
              </div>
              <div className="cred-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-dark)', fontWeight: '600' }}>
                <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(15, 107, 92, 0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                  <i className="fas fa-check"></i>
                </div>
                AAD Academy Fellow
              </div>
            </div>
            
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="btn btn-primary"
              style={{ 
                border: 'none', 
                cursor: 'pointer', 
                borderRadius: '12px',
                padding: '16px 36px',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 8px 24px rgba(15, 107, 92, 0.15)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(15, 107, 92, 0.22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 107, 92, 0.15)';
              }}
            >
              Book an Appointment
            </button>
          </div>
        </div>
      </section>

      {/* Before After Rejuvenation Slider */}
      <BeforeAfter />

      {/* Reviews Carousel */}
      <Testimonials />

      {/* Floating Booking Action Button (FAB) */}
      <div 
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 999
        }}
      >
        <button 
          onClick={() => setIsBookingModalOpen(true)}
          className="btn btn-accent px-6 py-4 flex items-center gap-3 shadow-xl"
          style={{
            borderRadius: '9999px',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 10px 30px rgba(255, 122, 89, 0.45)',
            border: 'none',
            cursor: 'pointer',
            transform: 'scale(1)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 14px 35px rgba(255, 122, 89, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 122, 89, 0.45)';
          }}
        >
          <i className="far fa-calendar-check" style={{ fontSize: '18px' }}></i> Book Consultation
        </button>
      </div>

      {/* Booking Modal Overlay */}
      {isBookingModalOpen && (
        <div className="modal-backdrop active" onClick={() => setIsBookingModalOpen(false)}>
          <div className="modal-content relative" style={{ maxWidth: '640px', width: '90%', padding: '0px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setIsBookingModalOpen(false)}
              style={{ zIndex: 100, position: 'absolute', right: '20px', top: '20px', background: 'var(--bg-warm)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <i className="fas fa-times"></i>
            </button>
            <FormWizard 
              selectedTreatment={selectedTreatment} 
              setSelectedTreatment={setSelectedTreatment} 
            />
          </div>
        </div>
      )}

      {/* Full-width CTA Band */}
      <section className="section-padding">
        <div className="container mx-auto px-4" style={{ maxWidth: '1200px' }}>
          <div className="cta-band" style={{ padding: '60px 24px', backgroundColor: 'var(--bg-dark)', borderRadius: '16px', textAlign: 'center', color: '#ffffff' }}>
            <h2 className="cta-band-title" style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', color: '#ffffff' }}>Ready for Clearer, Healthier Skin?</h2>
            <p className="cta-band-desc" style={{ color: 'rgba(255, 255, 255, 0.75)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto' }}>Book your consultation today and take the first step towards achieving your ideal skin rejuvenation results.</p>
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="btn btn-accent btn-lg px-8 py-4"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              Book Consultation Now
            </button>
            <div className="cta-contact-methods" style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '40px', flexWrap: 'wrap' }}>
              <span className="cta-method"><i className="fas fa-phone-alt"></i> Call us: +91 98765 43210</span>
              <span className="cta-method"><i className="fab fa-whatsapp"></i> WhatsApp: +91 98765 43210</span>
              <span className="cta-method"><i className="fas fa-map-marker-alt"></i> 404 Green Valley Blvd</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <a href="#" className="logo footer-logo">
              Aura<span className="logo-dot"></span>
            </a>
            <p style={{ fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              Board-certified clinical dermatology and advanced laser aesthetics in a safe, premium medical space.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div>
            <h4 className="footer-title">Treatments</h4>
            <div className="footer-links">
              <a href="#treatments" className="footer-link">Laser Skin Resurfacing</a>
              <a href="#treatments" className="footer-link">Botox & Injectables</a>
              <a href="#treatments" className="footer-link">Chemical Peels</a>
              <a href="#treatments" className="footer-link">Acne Light Therapy</a>
            </div>
          </div>
          <div>
            <h4 className="footer-title">Clinic</h4>
            <div className="footer-links">
              <a href="#about" className="footer-link">Meet Dr. Sharma</a>
              <a href="#testimonials" className="footer-link">Patient Results</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a 
                href="/admin" 
                className="footer-link text-xs" 
                style={{ color: 'rgba(255, 255, 255, 0.35)', marginTop: '8px' }}
              >
                <i className="fas fa-lock" style={{ marginRight: '4px', fontSize: '10px' }}></i> Admin Login
              </a>
            </div>
          </div>
          <div>
            <h4 className="footer-title">Hours & Contact</h4>
            <p style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>
              <b>Mon - Fri:</b> 9:00 AM - 6:00 PM<br />
              <b>Sat:</b> 10:00 AM - 3:00 PM<br />
              <b>Sun:</b> Closed
            </p>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              <b>Emergency Desk:</b><br />
              +91 98765 43210
            </p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>&copy; 2026 Aura Dermatology Clinic. All Rights Reserved.</span>
          <span>Designed for medical trust & conversion.</span>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="mobile-sticky-cta">
        <a href="#contact" className="btn btn-accent btn-full">Book Free Consultation</a>
      </div>
    </div>
  );
}
