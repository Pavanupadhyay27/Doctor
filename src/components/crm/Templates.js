'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Templates() {
  const { templates, saveTemplate } = useCRM();
  const [activeId, setActiveId] = useState(null);

  const activeTemplate = templates.find(t => t.id === activeId);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (templates.length > 0 && !activeId) {
      setActiveId(templates[0].id);
    }
  }, [templates, activeId]);

  const handleFieldChange = (field, value) => {
    if (!activeId) return;
    saveTemplate(activeId, { [field]: value });
  };

  const handleInsertChip = (chipVar) => {
    const textarea = textareaRef.current;
    if (!textarea || !activeTemplate) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = activeTemplate.content || '';
    
    const newContent = currentText.substring(0, start) + chipVar + currentText.substring(end);
    
    handleFieldChange('content', newContent);

    // Refocus and place cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + chipVar.length;
    }, 50);
  };

  const getMergedPreviewText = () => {
    if (!activeTemplate) return '';
    return (activeTemplate.content || '')
      .replace(/{{PatientName}}/g, 'Alex Rivera')
      .replace(/{{TreatmentInterested}}/g, 'Laser Skin Resurfacing')
      .replace(/{{AppointmentDate}}/g, '2026-07-25')
      .replace(/{{AppointmentTime}}/g, '11:00 AM')
      .replace(/{{ClinicPhone}}/g, '+91 98765 43210')
      .replace(/{{ClinicWhatsApp}}/g, '+91 98765 43210')
      .replace(/{{ClinicAddress}}/g, '404 Green Valley Blvd');
  };

  const previewText = getMergedPreviewText();

  return (
    <div className="template-grid">
      {/* Left List Card */}
      <div className="card template-list-card">
        <h3 style={{ fontSize: '15px', marginBottom: '12px', fontWeight: '700' }}>Templates List</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {templates.map(tmpl => (
            <div 
              key={tmpl.id} 
              className={`template-item ${activeId === tmpl.id ? 'active' : ''}`}
              onClick={() => setActiveId(tmpl.id)}
            >
              <span className="template-item-name">{tmpl.name}</span>
              <span className={`badge badge-${tmpl.channel.toLowerCase()}`}>{tmpl.channel.toUpperCase()}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: '20px' }} onClick={() => alert('Creating template (Simulated)')}>
          <i className="fas fa-plus"></i> New Message Template
        </button>
      </div>
      
      {/* Right Editor Card */}
      {activeTemplate && (
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '700' }}>Edit Template & Preview</h3>
          
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            {/* Editor Inputs */}
            <div>
              <div className="form-group">
                <label className="form-label" htmlFor="template-name">Template Description</label>
                <input 
                  type="text" 
                  id="template-name" 
                  className="form-input" 
                  placeholder="e.g. Laser Consultation Info"
                  value={activeTemplate.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="template-channel">Messaging Channel</label>
                <select 
                  id="template-channel" 
                  className="form-select"
                  value={activeTemplate.channel}
                  onChange={(e) => handleFieldChange('channel', e.target.value)}
                >
                  <option value="whatsapp">WhatsApp Business API</option>
                  <option value="sms">SMS via Twilio Gateway</option>
                  <option value="email">Email via SendGrid Services</option>
                </select>
              </div>
              
              {/* Variable chips */}
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label">Insert Dynamic Placeholders</label>
                <div className="variables-container">
                  <span className="var-chip" onClick={() => handleInsertChip('{{PatientName}}')}>Patient Name</span>
                  <span className="var-chip" onClick={() => handleInsertChip('{{TreatmentInterested}}')}>Treatment Name</span>
                  <span className="var-chip" onClick={() => handleInsertChip('{{AppointmentDate}}')}>Apt Date</span>
                  <span className="var-chip" onClick={() => handleInsertChip('{{AppointmentTime}}')}>Apt Time</span>
                  <span className="var-chip" onClick={() => handleInsertChip('{{ClinicPhone}}')}>Clinic Phone</span>
                  <span className="var-chip" onClick={() => handleInsertChip('{{ClinicWhatsApp}}')}>WhatsApp URL</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="template-body">Message Body</label>
                <textarea 
                  ref={textareaRef}
                  id="template-body" 
                  className="form-textarea" 
                  rows="8" 
                  placeholder="Type your template text here..."
                  value={activeTemplate.content}
                  onChange={(e) => handleFieldChange('content', e.target.value)}
                ></textarea>
              </div>

              <button onClick={() => alert('Changes saved locally and synced.')} className="btn btn-primary">Save Template Updates</button>
            </div>

            {/* Live mockup rendering */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>Output Simulation</h4>
              
              {/* Phone Mockup Frame */}
              {activeTemplate.channel === 'whatsapp' && (
                <div className="mock-phone" style={{ backgroundColor: '#E5DDD5' }}>
                  <div className="mock-phone-header" style={{ backgroundColor: '#075E54' }}>
                    <i className="fab fa-whatsapp" style={{ color: '#25D366', fontSize: '18px' }}></i> <b>Aura Dermatology Care</b>
                  </div>
                  <div className="mock-phone-body">
                    <div style={{ backgroundColor: '#DCF8C6', borderRadius: '8px', padding: '12px', fontSize: '13px', maxWidth: '85%', alignSelf: 'flex-start', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', color: '#333333', marginBottom: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {previewText}
                    </div>
                  </div>
                </div>
              )}

              {activeTemplate.channel === 'sms' && (
                <div className="mock-phone" style={{ backgroundColor: '#f7fafc' }}>
                  <div className="mock-phone-header" style={{ backgroundColor: 'var(--border)' }}>
                    <i className="fas fa-sms" style={{ color: 'var(--primary)', fontSize: '18px' }}></i> <b>+91 98765 43210</b>
                  </div>
                  <div className="mock-phone-body">
                    <div style={{ backgroundColor: '#E2E8F0', borderRadius: '16px', padding: '12px 16px', fontSize: '13px', maxWidth: '80%', alignSelf: 'flex-start', color: '#1E293B', marginBottom: '12px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                      {previewText}
                    </div>
                  </div>
                </div>
              )}

              {activeTemplate.channel === 'email' && (
                <div className="mock-phone" style={{ backgroundColor: '#ffffff' }}>
                  <div className="mock-phone-header" style={{ backgroundColor: 'var(--bg-dark)' }}>
                    <i className="fas fa-envelope-open" style={{ color: 'var(--accent)', fontSize: '16px' }}></i> <b>Aura Concierge Mail</b>
                  </div>
                  <div className="mock-phone-body" style={{ padding: '8px' }}>
                    <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '12px', fontFamily: 'var(--font-body)', color: 'var(--text-dark)', backgroundColor: '#ffffff' }}>
                      <div style={{ backgroundColor: 'var(--primary)', padding: '12px', textAlign: 'center', borderRadius: '6px', marginBottom: '12px', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>AURA DERMATOLOGY</h3>
                      </div>
                      <div style={{ fontSize: '11px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{previewText}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
