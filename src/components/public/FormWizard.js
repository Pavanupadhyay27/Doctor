'use client';

import React, { useState, useEffect } from 'react';
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

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateObj, setSelectedDateObj] = useState(null);

  const treatmentsList = [
    {
      id: 'Laser Skin Resurfacing',
      name: 'Laser Resurfacing',
      icon: 'fas fa-wand-magic-sparkles',
      desc: 'FDA approved fractionated CO2 laser.',
      tag: 'Scars & Wrinkles'
    },
    {
      id: 'Botox & Dermal Fillers',
      name: 'Injectable Botox',
      icon: 'fas fa-syringe',
      desc: 'Smoothing lines & volume restoration.',
      tag: 'Injectables'
    },
    {
      id: 'Chemical Peels',
      name: 'Chemical Peels',
      icon: 'fas fa-leaf',
      desc: 'Exfoliate dead cell layers and active collagen.',
      tag: 'Exfoliation'
    },
    {
      id: 'Advanced Acne Therapy',
      name: 'Acne Therapy',
      icon: 'fas fa-hand-holding-medical',
      desc: 'Deep extraction & blue light clearance.',
      tag: 'Acne Care'
    }
  ];

  const timeSlots = [
    { value: '09:00', label: '09:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '13:30', label: '01:30 PM' },
    { value: '15:30', label: '03:30 PM' }
  ];

  // Email & Phone validations
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

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
      if (!formData.name.trim()) {
        showToast('Please enter your full name.', 'error');
        return;
      }
      if (!validatePhone(formData.phone)) {
        showToast('Please enter a valid mobile number (at least 10 digits).', 'error');
        return;
      }
      if (!validateEmail(formData.email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }
    }
    if (step === 2) {
      if (!formData.date) {
        showToast('Please click on a date in the calendar.', 'error');
        return;
      }
      if (!formData.consent) {
        showToast('Please accept the data privacy consent check.', 'error');
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
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      treatment: selectedTreatment,
      notes: `${formData.notes.trim()} | Preferred slot: ${formData.date} at ${formData.time}`,
      status: 'New'
    };
    
    addLead(fullLead);
    setStep(3);
  };

  // Custom Inline Calendar Helper Functions
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for offset start day
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateClick = (date) => {
    if (!date) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return; // Prevent selecting past dates

    setSelectedDateObj(date);
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    setFormData(prev => ({ ...prev, date: `${yyyy}-${mm}-${dd}` }));
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const calendarDays = getDaysInMonth();
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const progressPercent = (step / 2.0) * 100;

  return (
    <div style={{ 
      padding: '24px 28px', 
      backgroundColor: '#ffffff', 
      borderRadius: '20px', 
      maxWidth: step === 0 ? '640px' : '480px', 
      margin: '0 auto', 
      boxShadow: '0 10px 40px rgba(18, 33, 30, 0.03)' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <span className="section-tag" style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Book Appointment</span>
        <h2 style={{ fontSize: '21px', fontWeight: '850', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px', marginTop: '2px' }}>Clinical Assessment</h2>
      </div>

      <div>
        {/* Compact Progress Line */}
        {step < 3 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', position: 'relative', alignItems: 'center', maxWidth: '380px', margin: '0 auto 28px auto' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '2px', backgroundColor: 'var(--border)', zIndex: 1, transform: 'translateY(-50%)' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: step >= 0 ? 'var(--primary)' : '#ffffff', 
                  border: '1.5px solid var(--primary)',
                  color: '#ffffff',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '11px', 
                  fontWeight: '750',
                  transition: 'all 0.3s ease'
                }}>
                  {step > 0 ? <i className="fas fa-check" style={{ fontSize: '9px' }}></i> : '1'}
                </div>
              </div>

              {/* Step 2 Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: step > 1 ? 'var(--primary)' : step === 1 ? '#ffffff' : '#ffffff', 
                  border: step >= 1 ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  color: step > 1 ? '#ffffff' : step === 1 ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '11px', 
                  fontWeight: '750',
                  transition: 'all 0.3s ease'
                }}>
                  {step > 1 ? <i className="fas fa-check" style={{ fontSize: '9px' }}></i> : '2'}
                </div>
              </div>

              {/* Step 3 Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: step === 2 ? '#ffffff' : '#ffffff', 
                  border: step === 2 ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  color: step === 2 ? 'var(--primary)' : 'var(--text-muted)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '11px', 
                  fontWeight: '750',
                  transition: 'all 0.3s ease'
                }}>
                  3
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1: Treatments selection grid */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: '13.5px', marginBottom: '14px', fontWeight: '750', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Choose treatment</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {treatmentsList.map(t => {
                  const isSelected = selectedTreatment === t.id;
                  return (
                    <div 
                      key={t.id}
                      onClick={() => handleSelectTreatment(t.id)}
                      style={{
                        cursor: 'pointer',
                        padding: '16px 12px',
                        borderRadius: '16px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        borderBottom: isSelected ? '4px solid var(--primary-dark)' : '2px solid rgba(18, 33, 30, 0.05)',
                        backgroundColor: isSelected ? 'rgba(15, 107, 92, 0.02)' : '#ffffff',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
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
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '10px', 
                        backgroundColor: isSelected ? 'var(--primary)' : 'rgba(15, 107, 92, 0.05)', 
                        color: isSelected ? '#ffffff' : 'var(--primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '16px', 
                        marginBottom: '10px'
                      }}>
                        <i className={t.icon}></i>
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-dark)' }}>{t.name}</div>
                      <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '2px' }}>{t.tag}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '13px', marginBottom: '2px', fontWeight: '750', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Contact Info</h3>
              
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }} htmlFor="wizard-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <i className="far fa-user" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}></i>
                  <input 
                    type="text" 
                    id="wizard-name" 
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border)',
                      backgroundColor: '#FAF9F6',
                      color: 'var(--text-dark)',
                      fontSize: '13.5px',
                      outline: 'none',
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
              </div>
              
              {/* Phone Number */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }} htmlFor="wizard-phone">Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-phone-alt" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px' }}></i>
                  <input 
                    type="tel" 
                    id="wizard-phone" 
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border)',
                      backgroundColor: '#FAF9F6',
                      color: 'var(--text-dark)',
                      fontSize: '13.5px',
                      outline: 'none',
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
              </div>

              {/* Email Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }} htmlFor="wizard-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <i className="far fa-envelope" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}></i>
                  <input 
                    type="email" 
                    id="wizard-email" 
                    placeholder="e.g. sarah@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--border)',
                      backgroundColor: '#FAF9F6',
                      color: 'var(--text-dark)',
                      fontSize: '13.5px',
                      outline: 'none',
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
              </div>
            </div>
          )}

          {/* Step 3: Custom Calendar & Time Selection */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Better Calendar Picker UI */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Choose Date</label>
                
                <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', backgroundColor: '#FAF9F6' }}>
                  {/* Calendar Month Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <button type="button" onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--primary)' }}>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)' }}>
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button type="button" onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: 'var(--primary)' }}>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>

                  {/* Days Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
                    {weekDays.map(wd => (
                      <span key={wd} style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)' }}>{wd}</span>
                    ))}
                  </div>

                  {/* Month Days Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                    {calendarDays.map((day, idx) => {
                      if (!day) return <div key={`empty-${idx}`} />;
                      
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      const isPast = day < today;
                      const isSelected = isSameDay(day, selectedDateObj);

                      return (
                        <button
                          key={`day-${idx}`}
                          type="button"
                          disabled={isPast}
                          onClick={() => handleDateClick(day)}
                          style={{
                            background: isSelected ? 'var(--primary)' : 'transparent',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: isSelected ? '750' : '500',
                            color: isSelected ? '#ffffff' : isPast ? 'rgba(0,0,0,0.18)' : 'var(--text-dark)',
                            cursor: isPast ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isPast && !isSelected) {
                              e.currentTarget.style.backgroundColor = 'rgba(15, 107, 92, 0.08)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isPast && !isSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Time Slots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferred Time</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {timeSlots.map(s => {
                    const isActive = formData.time === s.value;
                    return (
                      <div
                        key={s.value}
                        onClick={() => setFormData(prev => ({ ...prev, time: s.value }))}
                        style={{
                          padding: '10px 4px',
                          borderRadius: '8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontWeight: '750',
                          fontSize: '11.5px',
                          border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                          backgroundColor: isActive ? 'rgba(15, 107, 92, 0.04)' : '#ffffff',
                          color: isActive ? 'var(--primary)' : 'var(--text-dark)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {s.label.replace(' AM', '').replace(' PM', '')}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consent check */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '2px' }}>
                <input 
                  type="checkbox" 
                  id="wizard-consent" 
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                  style={{
                    marginTop: '2px',
                    cursor: 'pointer',
                    width: '15px',
                    height: '15px',
                    accentColor: 'var(--primary)'
                  }}
                />
                <label htmlFor="wizard-consent" style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', cursor: 'pointer', userSelect: 'none' }}>
                  I consent to having this clinic securely store my data to arrange consultation bookings.
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Success card */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(63, 167, 150, 0.08)', 
                color: 'var(--success)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px auto', 
                fontSize: '28px'
              }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 style={{ fontSize: '21px', fontWeight: '850', marginBottom: '10px', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>Thank you, {formData.name}! 👋</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '13.5px', lineHeight: '1.6' }}>
                Your appointment request is saved. Dr. Ananya Sharma's care team will contact you via Phone/WhatsApp within 24 hours.
              </p>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'center', gap: '18px' }}>
                <a 
                  href="tel:+919876543210" 
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none', flexGrow: 1, padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '12.5px' }}
                >
                  <i className="fas fa-phone-alt"></i> Call Clinic
                </a>
                <a 
                  href="https://wa.me/919876543210" 
                  className="btn btn-accent btn-sm"
                  style={{ textDecoration: 'none', flexGrow: 1, padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '12.5px', backgroundColor: '#25D366', borderColor: '#25D366', color: '#ffffff', boxShadow: 'none' }}
                >
                  <i className="fab fa-whatsapp"></i> WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              {step > 0 ? (
                <button 
                  type="button" 
                  onClick={handlePrev} 
                  className="btn btn-secondary"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    border: '1.5px solid var(--border)',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <i className="fas fa-chevron-left" style={{ marginRight: '4px' }}></i> Back
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
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(15, 107, 92, 0.15)'
                }}
              >
                {step === 2 ? (
                  <>Schedule Visit <i className="fas fa-calendar-check" style={{ marginLeft: '4px' }}></i></>
                ) : (
                  <>Continue <i className="fas fa-chevron-right" style={{ marginLeft: '4px' }}></i></>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
