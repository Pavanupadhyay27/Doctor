'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function FormWizard({ selectedTreatment, setSelectedTreatment }) {
  const { addLead } = useCRM();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '09:00',
    notes: '',
    consent: false
  });

  const treatmentsList = [
    {
      id: 'Laser Skin Resurfacing',
      name: 'Laser Resurfacing',
      icon: 'fas fa-wand-magic-sparkles',
      desc: 'FDA approved resurfacing for scars & wrinkles.',
      tag: 'Scars & Wrinkles'
    },
    {
      id: 'Botox & Dermal Fillers',
      name: 'Injectable Botox',
      icon: 'fas fa-syringe',
      desc: 'Volumizing & dynamic line smoothing.',
      tag: 'Smoothing Lines'
    },
    {
      id: 'Chemical Peels',
      name: 'Chemical Peels',
      icon: 'fas fa-leaf',
      desc: 'Advanced exfoliation & skin evening.',
      tag: 'Texture & Pigment'
    },
    {
      id: 'Advanced Acne Therapy',
      name: 'Acne Therapy',
      icon: 'fas fa-hand-holding-medical',
      desc: 'Deep extraction & blue light clearance.',
      tag: 'Acne Clearance'
    }
  ];

  const timeSlots = [
    { value: '09:00', label: '09:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '13:30', label: '01:30 PM' },
    { value: '15:30', label: '03:30 PM' }
  ];

  const handleSelectTreatment = (name) => {
    setSelectedTreatment(name);
    setStep(1);
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('wizard-', '')]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
        alert('Please fill out all contact details.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.date || !formData.consent) {
        alert('Please select a date and accept the consent check.');
        return;
      }
      handleSubmit();
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    const fullLead = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      treatment: selectedTreatment,
      notes: `${formData.notes} | Preferred slot: ${formData.date} at ${formData.time}`,
      status: 'New'
    };
    
    addLead(fullLead);
    setStep(3);
  };

  const progressPercent = (step / 2.0) * 100;

  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <span className="section-tag" style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Aesthetics</span>
        <h2 style={{ fontSize: '26px', fontWeight: '850', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px', marginTop: '4px' }}>Book Consultation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', lineHeight: '1.6', maxWidth: '440px', margin: '6px auto 0 auto' }}>
          Schedule your visual skin analysis and custom treatment planning with Dr. Ananya Sharma.
        </p>
      </div>

      <div className="relative">
        {/* Modern Stepper Indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative', alignItems: 'center', maxWidth: '460px', margin: '0 auto 40px auto' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '3px', backgroundColor: 'var(--border)', zIndex: 1, transform: 'translateY(-50%)' }}>
              <div 
                style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  backgroundColor: 'var(--primary)', 
                  transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
              ></div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', zIndex: 2 }}>
              {/* Step 1 Indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: step >= 0 ? 'var(--primary)' : '#ffffff', 
                  border: '2px solid var(--primary)',
                  color: '#ffffff',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '13px', 
                  fontWeight: '750',
                  boxShadow: step >= 0 ? '0 4px 10px rgba(15, 107, 92, 0.2)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {step > 0 ? <i className="fas fa-check" style={{ fontSize: '11px' }}></i> : '1'}
                </div>
                <span style={{ fontSize: '10px', fontWeight: '800', color: step >= 0 ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service</span>
              </div>

              {/* Step 2 Indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: step > 1 ? 'var(--primary)' : step === 1 ? '#ffffff' : '#ffffff', 
                  border: step >= 1 ? '2px solid var(--primary)' : '2px solid var(--border)',
                  color: step > 1 ? '#ffffff' : step === 1 ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '13px', 
                  fontWeight: '750',
                  boxShadow: step === 1 ? '0 4px 10px rgba(15, 107, 92, 0.08)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {step > 1 ? <i className="fas fa-check" style={{ fontSize: '11px' }}></i> : '2'}
                </div>
                <span style={{ fontSize: '10px', fontWeight: '800', color: step >= 1 ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Details</span>
              </div>

              {/* Step 3 Indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: step === 2 ? '#ffffff' : '#ffffff', 
                  border: step === 2 ? '2px solid var(--primary)' : '2px solid var(--border)',
                  color: step === 2 ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '13px', 
                  fontWeight: '750',
                  transition: 'all 0.3s ease'
                }}>
                  3
                </div>
                <span style={{ fontSize: '10px', fontWeight: '800', color: step === 2 ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Schedule</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Treatments selection grid */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: '15px', marginBottom: '18px', fontWeight: '750', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Choose consultation category</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '12px' }}>
                {treatmentsList.map(t => {
                  const isSelected = selectedTreatment === t.id;
                  return (
                    <div 
                      key={t.id}
                      onClick={() => handleSelectTreatment(t.id)}
                      style={{
                        cursor: 'pointer',
                        padding: '24px 20px',
                        borderRadius: '20px',
                        border: isSelected ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                        borderBottom: isSelected ? '5px solid var(--primary-dark)' : '3px solid rgba(18, 33, 30, 0.06)',
                        backgroundColor: isSelected ? 'rgba(15, 107, 92, 0.03)' : '#ffffff',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        boxShadow: isSelected ? '0 12px 30px rgba(15, 107, 92, 0.08)' : '0 4px 10px rgba(18, 33, 30, 0.01)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div style={{ 
                        width: '52px', 
                        height: '52px', 
                        borderRadius: '14px', 
                        backgroundColor: isSelected ? 'var(--primary)' : 'rgba(15, 107, 92, 0.06)', 
                        color: isSelected ? '#ffffff' : 'var(--primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '22px', 
                        marginBottom: '16px',
                        transition: 'all 0.25s ease'
                      }}>
                        <i className={t.icon}></i>
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-dark)', marginBottom: '4px' }}>{t.name}</div>
                      <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>{t.tag}</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{t.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '480px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '750', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Contact information</h3>
              
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.8px' }} htmlFor="wizard-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <i className="far fa-user" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}></i>
                  <input 
                    type="text" 
                    id="wizard-name" 
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border)',
                      backgroundColor: '#FAF9F6',
                      color: 'var(--text-dark)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.25s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(15, 107, 92, 0.06)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.backgroundColor = '#FAF9F6';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              {/* Phone Number */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.8px' }} htmlFor="wizard-phone">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-phone-alt" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}></i>
                  <input 
                    type="tel" 
                    id="wizard-phone" 
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border)',
                      backgroundColor: '#FAF9F6',
                      color: 'var(--text-dark)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.25s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(15, 107, 92, 0.06)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.backgroundColor = '#FAF9F6';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.8px' }} htmlFor="wizard-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <i className="far fa-envelope" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px' }}></i>
                  <input 
                    type="email" 
                    id="wizard-email" 
                    placeholder="e.g. sarah@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border)',
                      backgroundColor: '#FAF9F6',
                      color: 'var(--text-dark)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.25s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 4px rgba(15, 107, 92, 0.06)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.backgroundColor = '#FAF9F6';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Date & Consent */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '520px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '750', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Scheduling slot</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {/* Date Picker */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.8px' }} htmlFor="wizard-date">Date</label>
                  <input 
                    type="date" 
                    id="wizard-date" 
                    value={formData.date}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border)',
                      backgroundColor: '#FAF9F6',
                      color: 'var(--text-dark)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.backgroundColor = '#FAF9F6';
                    }}
                  />
                </div>
                
                {/* Time Selection Cards instead of Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Time Slot</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {timeSlots.map(s => {
                      const isActive = formData.time === s.value;
                      return (
                        <div
                          key={s.value}
                          onClick={() => setFormData(prev => ({ ...prev, time: s.value }))}
                          style={{
                            padding: '11px 8px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            fontWeight: '750',
                            fontSize: '12.5px',
                            border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                            backgroundColor: isActive ? 'rgba(15, 107, 92, 0.05)' : '#ffffff',
                            color: isActive ? 'var(--primary)' : 'var(--text-dark)',
                            transition: 'all 0.2s ease',
                            boxShadow: isActive ? '0 4px 10px rgba(15, 107, 92, 0.04)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.borderColor = 'var(--primary)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.borderColor = 'var(--border)';
                          }}
                        >
                          {s.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.8px' }} htmlFor="wizard-notes">Notes or Concerns (Optional)</label>
                <textarea 
                  id="wizard-notes" 
                  rows="3" 
                  placeholder="Share any specific skin symptoms or medical concerns..."
                  value={formData.notes}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border)',
                    backgroundColor: '#FAF9F6',
                    color: 'var(--text-dark)',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    transition: 'all 0.25s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.backgroundColor = '#FAF9F6';
                  }}
                ></textarea>
              </div>

              {/* Consent check */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '6px' }}>
                <input 
                  type="checkbox" 
                  id="wizard-consent" 
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                  style={{
                    marginTop: '3px',
                    cursor: 'pointer',
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--primary)'
                  }}
                />
                <label htmlFor="wizard-consent" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', cursor: 'pointer', userSelect: 'none' }}>
                  I consent to having this clinic securely store my data to arrange clinical consultation bookings.
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Success card */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '16px 0', maxWidth: '480px', margin: '0 auto' }}>
              <div style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(63, 167, 150, 0.08)', 
                color: 'var(--success)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 28px auto', 
                fontSize: '32px',
                boxShadow: '0 8px 20px rgba(63, 167, 150, 0.15)'
              }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '850', marginBottom: '12px', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>Thank you, {formData.name}! 👋</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '36px', fontSize: '14.5px', lineHeight: '1.7' }}>
                We have registered your inquiry in our CRM system. Dr. Ananya Sharma's care team will review your file and contact you via Phone/WhatsApp within 24 hours.
              </p>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <a 
                  href="tel:+919876543210" 
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none', minWidth: '150px', padding: '12px 20px', borderRadius: '12px', fontWeight: '700' }}
                >
                  <i className="fas fa-phone-alt"></i> Call Clinic
                </a>
                <a 
                  href="https://wa.me/919876543210" 
                  className="btn btn-accent btn-sm"
                  style={{ textDecoration: 'none', minWidth: '150px', padding: '12px 20px', borderRadius: '12px', fontWeight: '700', backgroundColor: '#25D366', borderColor: '#25D366', color: '#ffffff', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}
                >
                  <i className="fab fa-whatsapp"></i> Chat WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '28px' }}>
              {step > 0 ? (
                <button 
                  type="button" 
                  onClick={handlePrev} 
                  className="btn btn-secondary"
                  style={{
                    padding: '12px 22px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: '1.5px solid var(--border)',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <i className="fas fa-chevron-left" style={{ marginRight: '6px' }}></i> Back
                </button>
              ) : (
                <div style={{ width: '1px' }}></div>
              )}
              
              <button 
                type="button" 
                onClick={handleNext} 
                className="btn btn-primary" 
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  boxShadow: '0 6px 16px rgba(15, 107, 92, 0.2)'
                }}
              >
                {step === 2 ? (
                  <>Schedule Visit <i className="fas fa-calendar-check" style={{ marginLeft: '6px' }}></i></>
                ) : (
                  <>Continue <i className="fas fa-chevron-right" style={{ marginLeft: '6px' }}></i></>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
