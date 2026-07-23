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

  const handleSelectTreatment = (name) => {
    setSelectedTreatment(name);
    setStep(1); // Go to step 2 automatically once they pick a treatment!
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
      if (!formData.name || !formData.phone || !formData.email) {
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
    <div style={{ padding: '36px', backgroundColor: '#ffffff' }}>
      <div style={{ marginBottom: '28px' }}>
        <span className="section-tag" style={{ fontSize: '11px', marginBottom: '4px', display: 'block' }}>Booking Center</span>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>Schedule Consultation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px', lineHeight: '1.5' }}>Fill out our interactive form to book your clinical analysis with Dr. Sharma.</p>
      </div>

      <div className="relative">
        {/* Progress bar */}
        {step < 3 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative', alignItems: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', backgroundColor: 'var(--border)', zIndex: 1, transform: 'translateY(-50%)' }}>
              <div 
                style={{ 
                  width: `${Math.min(100, Math.max(0, progressPercent))}%`, 
                  height: '100%', 
                  backgroundColor: 'var(--primary)', 
                  transition: 'width 0.3s ease' 
                }}
              ></div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', zIndex: 2 }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: step >= 0 ? 'var(--primary)' : '#ffffff', 
                border: '2px solid var(--primary)',
                color: step >= 0 ? '#ffffff' : 'var(--text-muted)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '13px', 
                fontWeight: '700' 
              }}>
                1
              </div>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: step >= 1 ? 'var(--primary)' : '#ffffff', 
                border: step >= 1 ? '2px solid var(--primary)' : '2px solid var(--border)',
                color: step >= 1 ? '#ffffff' : 'var(--text-muted)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '13px', 
                fontWeight: '700',
                transition: 'all 0.3s ease'
              }}>
                2
              </div>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: step >= 2 ? 'var(--primary)' : '#ffffff', 
                border: step >= 2 ? '2px solid var(--primary)' : '2px solid var(--border)',
                color: step >= 2 ? '#ffffff' : 'var(--text-muted)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '13px', 
                fontWeight: '700',
                transition: 'all 0.3s ease'
              }}>
                3
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Treatments selection grid */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '700', color: 'var(--text-dark)' }}>What treatment are you interested in?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div 
                  onClick={() => handleSelectTreatment('Laser Skin Resurfacing')}
                  style={{
                    cursor: 'pointer',
                    padding: '24px 16px',
                    borderRadius: '16px',
                    border: selectedTreatment === 'Laser Skin Resurfacing' ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: selectedTreatment === 'Laser Skin Resurfacing' ? 'rgba(15, 107, 92, 0.04)' : '#ffffff',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: selectedTreatment === 'Laser Skin Resurfacing' ? '0 8px 24px rgba(15, 107, 92, 0.08)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTreatment !== 'Laser Skin Resurfacing') {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'rgba(15, 107, 92, 0.01)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTreatment !== 'Laser Skin Resurfacing') {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }
                  }}
                >
                  <i className="fas fa-wand-magic-sparkles" style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '12px' }}></i>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-dark)' }}>Laser Resurfacing</div>
                </div>

                <div 
                  onClick={() => handleSelectTreatment('Botox & Dermal Fillers')}
                  style={{
                    cursor: 'pointer',
                    padding: '24px 16px',
                    borderRadius: '16px',
                    border: selectedTreatment === 'Botox & Dermal Fillers' ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: selectedTreatment === 'Botox & Dermal Fillers' ? 'rgba(15, 107, 92, 0.04)' : '#ffffff',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: selectedTreatment === 'Botox & Dermal Fillers' ? '0 8px 24px rgba(15, 107, 92, 0.08)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTreatment !== 'Botox & Dermal Fillers') {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'rgba(15, 107, 92, 0.01)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTreatment !== 'Botox & Dermal Fillers') {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }
                  }}
                >
                  <i className="fas fa-syringe" style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '12px' }}></i>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-dark)' }}>Injectable Botox</div>
                </div>

                <div 
                  onClick={() => handleSelectTreatment('Chemical Peels')}
                  style={{
                    cursor: 'pointer',
                    padding: '24px 16px',
                    borderRadius: '16px',
                    border: selectedTreatment === 'Chemical Peels' ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: selectedTreatment === 'Chemical Peels' ? 'rgba(15, 107, 92, 0.04)' : '#ffffff',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: selectedTreatment === 'Chemical Peels' ? '0 8px 24px rgba(15, 107, 92, 0.08)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTreatment !== 'Chemical Peels') {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'rgba(15, 107, 92, 0.01)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTreatment !== 'Chemical Peels') {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }
                  }}
                >
                  <i className="fas fa-leaf" style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '12px' }}></i>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-dark)' }}>Chemical Peels</div>
                </div>

                <div 
                  onClick={() => handleSelectTreatment('Advanced Acne Therapy')}
                  style={{
                    cursor: 'pointer',
                    padding: '24px 16px',
                    borderRadius: '16px',
                    border: selectedTreatment === 'Advanced Acne Therapy' ? '2.5px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: selectedTreatment === 'Advanced Acne Therapy' ? 'rgba(15, 107, 92, 0.04)' : '#ffffff',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: selectedTreatment === 'Advanced Acne Therapy' ? '0 8px 24px rgba(15, 107, 92, 0.08)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTreatment !== 'Advanced Acne Therapy') {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'rgba(15, 107, 92, 0.01)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTreatment !== 'Advanced Acne Therapy') {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }
                  }}
                >
                  <i className="fas fa-hand-holding-medical" style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '12px' }}></i>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-dark)' }}>Acne Treatment</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '4px', fontWeight: '700', color: 'var(--text-dark)' }}>Tell us about yourself</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '1px' }} htmlFor="wizard-name">Full Name</label>
                <input 
                  type="text" 
                  id="wizard-name" 
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: '#FAF9F6',
                    color: 'var(--text-dark)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '1px' }} htmlFor="wizard-phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="wizard-phone" 
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: '#FAF9F6',
                    color: 'var(--text-dark)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '1px' }} htmlFor="wizard-email">Email Address</label>
                <input 
                  type="email" 
                  id="wizard-email" 
                  placeholder="e.g. name@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: '#FAF9F6',
                    color: 'var(--text-dark)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Date & Consent */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '4px', fontWeight: '700', color: 'var(--text-dark)' }}>Preferred schedule</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '1px' }} htmlFor="wizard-date">Date</label>
                  <input 
                    type="date" 
                    id="wizard-date" 
                    value={formData.date}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: '#FAF9F6',
                      color: 'var(--text-dark)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '1px' }} htmlFor="wizard-time">Time Slot</label>
                  <select 
                    id="wizard-time" 
                    value={formData.time}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: '#FAF9F6',
                      color: 'var(--text-dark)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:30">01:30 PM</option>
                    <option value="15:30">03:30 PM</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '1px' }} htmlFor="wizard-notes">Symptoms or Concerns (Optional)</label>
                <textarea 
                  id="wizard-notes" 
                  rows="3" 
                  placeholder="Tell us what you hope to achieve..."
                  value={formData.notes}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: '#FAF9F6',
                    color: 'var(--text-dark)',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none'
                  }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '8px' }}>
                <input 
                  type="checkbox" 
                  id="wizard-consent" 
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                  style={{
                    marginTop: '3px',
                    cursor: 'pointer',
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--primary)'
                  }}
                />
                <label htmlFor="wizard-consent" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', cursor: 'pointer' }}>
                  I consent to having this clinic store my contact details to arrange clinical consultation bookings. (Data Privacy compliant)
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Success card */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '28px' }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)' }}>Thank you, {formData.name}! 👋</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto 32px auto' }}>
                We have registered your inquiry in our CRM system. Dr. Ananya Sharma's care team will review your file and contact you via Phone/WhatsApp within 24 hours.
              </p>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
                <a href="tel:+15558325872" style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <i className="fas fa-phone-alt"></i> Call Clinic
                </a>
                <a href="https://wa.me/15558325872" style={{ fontWeight: '700', fontSize: '14px', color: '#25D366', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <i className="fab fa-whatsapp"></i> Chat WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              {step > 0 ? (
                <button 
                  type="button" 
                  onClick={handlePrev} 
                  className="btn btn-secondary"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid var(--border)',
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
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff'
                }}
              >
                {step === 2 ? (
                  <>Book Consultation <i className="fas fa-calendar-check" style={{ marginLeft: '6px' }}></i></>
                ) : (
                  <>Next Step <i className="fas fa-chevron-right" style={{ marginLeft: '6px' }}></i></>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
