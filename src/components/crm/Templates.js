'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Templates() {
  const { templates, saveTemplate, addTemplate, showToast } = useCRM();
  
  // Selected Template & Filters state
  const [activeId, setActiveId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChannelFilter, setActiveChannelFilter] = useState('all'); // all, whatsapp, sms, email

  const activeTemplate = templates.find(t => t.id === activeId);
  const textareaRef = useRef(null);

  // Auto-select first template on load
  useEffect(() => {
    if (templates.length > 0 && !activeId) {
      setActiveId(templates[0].id);
    }
  }, [templates, activeId]);

  const handleFieldChange = (field, value) => {
    if (!activeId) return;
    saveTemplate(activeId, { [field]: value });
  };

  const handleCreateTemplate = async () => {
    const name = window.prompt('Enter a description/name for your new template:', 'New Appointment Reminder');
    if (!name || !name.trim()) return;

    const channelOpt = window.prompt('Enter channel (whatsapp, sms, or email):', 'whatsapp');
    if (!channelOpt) return;
    const cleanChannel = channelOpt.trim().toLowerCase();
    if (!['whatsapp', 'sms', 'email'].includes(cleanChannel)) {
      showToast('Invalid channel! Must be: whatsapp, sms, or email.', 'error');
      return;
    }

    const defaultBody = cleanChannel === 'email' 
      ? 'Dear {{PatientName}},\n\nThis is to confirm your consultation for {{TreatmentInterested}} on {{AppointmentDate}} at {{AppointmentTime}}.\n\nBest regards,\nAura Dermatology'
      : 'Hi {{PatientName}}! Your appointment for {{TreatmentInterested}} is confirmed for {{AppointmentDate}} at {{AppointmentTime}}.';

    const newTmpl = await addTemplate({
      name: name.trim(),
      channel: cleanChannel,
      content: defaultBody
    });

    if (newTmpl) {
      setActiveId(newTmpl.id);
      showToast(`Template "${name}" successfully created!`, 'success');
    } else {
      showToast('Failed to create new template.', 'error');
    }
  };

  const handleInsertChip = (chipVar) => {
    const textarea = textareaRef.current;
    if (!textarea || !activeTemplate) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = activeTemplate.content || '';
    
    const newContent = currentText.substring(0, start) + chipVar + currentText.substring(end);
    handleFieldChange('content', newContent);

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

  // Filter templates list
  const filteredTemplates = templates.filter(tmpl => {
    const matchesSearch = tmpl.name ? tmpl.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesChannel = activeChannelFilter === 'all' || tmpl.channel.toLowerCase() === activeChannelFilter;
    return matchesSearch && matchesChannel;
  });

  const getChannelIcon = (channel) => {
    switch (channel.toLowerCase()) {
      case 'whatsapp': return <i className="fab fa-whatsapp" style={{ color: '#25D366' }}></i>;
      case 'sms': return <i className="fas fa-comment-dots" style={{ color: '#3A86C8' }}></i>;
      case 'email': return <i className="far fa-envelope" style={{ color: '#E85D4B' }}></i>;
      default: return <i className="fas fa-sticky-note" style={{ color: 'var(--text-muted)' }}></i>;
    }
  };

  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', 
        gap: '24px', 
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left List Card */}
      <div 
        className="card template-list-card" 
        style={{ 
          padding: '24px', 
          backgroundColor: '#ffffff', 
          borderRadius: '20px', 
          border: '1px solid var(--border)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '850', color: 'var(--text-dark)', margin: 0 }}>Message Templates</h3>
          <span style={{ fontSize: '11px', fontWeight: '750', color: 'var(--primary)', backgroundColor: 'rgba(15,107,92,0.06)', padding: '2px 8px', borderRadius: '10px' }}>
            {filteredTemplates.length} listed
          </span>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px' }}></i>
          <input 
            type="text" 
            className="form-input" 
            style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', fontSize: '12.5px' }} 
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Channel filter tabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
          {['all', 'whatsapp', 'sms', 'email'].map(ch => (
            <button
              key={ch}
              onClick={() => setActiveChannelFilter(ch)}
              style={{
                border: 'none',
                background: activeChannelFilter === ch ? 'var(--primary)' : 'none',
                color: activeChannelFilter === ch ? '#ffffff' : 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: '750',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Templates list items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '420px' }}>
          {filteredTemplates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
              No templates found.
            </div>
          ) : (
            filteredTemplates.map(tmpl => (
              <div 
                key={tmpl.id} 
                className={`template-item ${activeId === tmpl.id ? 'active' : ''}`}
                onClick={() => setActiveId(tmpl.id)}
                style={{
                  padding: '12px 14px',
                  border: activeId === tmpl.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: activeId === tmpl.id ? '0 4px 12px rgba(15,107,92,0.05)' : 'none',
                  minWidth: 0,
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-warm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  flexShrink: 0
                }}>
                  {getChannelIcon(tmpl.channel)}
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '750', color: 'var(--text-dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{tmpl.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>{tmpl.content}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          className="btn btn-primary btn-sm btn-full" 
          style={{ marginTop: '12px', padding: '10px', fontSize: '13px', borderRadius: '10px' }} 
          onClick={handleCreateTemplate}
        >
          <i className="fas fa-plus"></i> New Message Template
        </button>
      </div>
      
      {/* Right Editor Card */}
      {activeTemplate ? (
        <div 
          className="card" 
          style={{ 
            padding: '28px', 
            backgroundColor: '#ffffff', 
            borderRadius: '20px', 
            border: '1px solid var(--border)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            minWidth: 0,
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Template Editor Workspace</span>
              <h3 style={{ fontSize: '16.5px', fontWeight: '850', color: 'var(--text-dark)', margin: '2px 0 0 0' }}>{activeTemplate.name}</h3>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '750',
              backgroundColor: 'var(--bg-warm)',
              color: 'var(--text-dark)',
              textTransform: 'uppercase'
            }}>
              {getChannelIcon(activeTemplate.channel)} {activeTemplate.channel}
            </span>
          </div>
          
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))', 
              gap: '28px',
              width: '100%'
            }}
          >
            {/* Editor Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="template-name" style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-muted)' }}>Template Description</label>
                <input 
                  type="text" 
                  id="template-name" 
                  className="form-input" 
                  style={{ borderRadius: '8px', padding: '10px 12px', fontSize: '13.5px' }}
                  placeholder="e.g. Laser Consultation Info"
                  value={activeTemplate.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="template-channel" style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-muted)' }}>Messaging Channel</label>
                <select 
                  id="template-channel" 
                  className="form-select"
                  style={{ borderRadius: '8px', padding: '10px 12px', fontSize: '13.5px' }}
                  value={activeTemplate.channel}
                  onChange={(e) => handleFieldChange('channel', e.target.value)}
                >
                  <option value="whatsapp">WhatsApp Business API</option>
                  <option value="sms">SMS via Twilio Gateway</option>
                  <option value="email">Email via SendGrid Services</option>
                </select>
              </div>
              
              {/* Variable chips */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-muted)' }}>Insert Dynamic Placeholders</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  <span className="var-chip" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleInsertChip('{{PatientName}}')}>Patient Name</span>
                  <span className="var-chip" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleInsertChip('{{TreatmentInterested}}')}>Treatment</span>
                  <span className="var-chip" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleInsertChip('{{AppointmentDate}}')}>Apt Date</span>
                  <span className="var-chip" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleInsertChip('{{AppointmentTime}}')}>Apt Time</span>
                  <span className="var-chip" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleInsertChip('{{ClinicPhone}}')}>Clinic Phone</span>
                  <span className="var-chip" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleInsertChip('{{ClinicWhatsApp}}')}>WhatsApp link</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="template-body" style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-muted)' }}>Message Body</label>
                <textarea 
                  ref={textareaRef}
                  id="template-body" 
                  className="form-textarea" 
                  rows="7" 
                  style={{ borderRadius: '8px', padding: '10px 12px', fontSize: '13.5px', outline: 'none', lineHeight: '1.45' }}
                  placeholder="Type your template text here..."
                  value={activeTemplate.content}
                  onChange={(e) => handleFieldChange('content', e.target.value)}
                ></textarea>
              </div>

              <button 
                onClick={() => showToast('All edits synced and written to PostgreSQL Database.', 'success')} 
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', padding: '10px 20px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700' }}
              >
                Save Template Updates
              </button>
            </div>

            {/* Live mockup rendering */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
              <h4 style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>Device Simulation Output</h4>
              
              {/* WhatsApp Mock */}
              {activeTemplate.channel === 'whatsapp' && (
                <div className="mock-phone" style={{ width: '100%', maxWidth: '280px', height: '380px', borderRadius: '24px', border: '8px solid #2d3748', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#e5ddd5', position: 'relative', flexShrink: 0 }}>
                  <div style={{ backgroundColor: '#075e54', padding: '10px 12px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <i className="fab fa-whatsapp" style={{ color: '#25D366', fontSize: '16px' }}></i>
                    <div>
                      <div style={{ fontWeight: '700' }}>Aura Dermatology Clinic</div>
                      <div style={{ fontSize: '8px', opacity: 0.8 }}>online</div>
                    </div>
                  </div>
                  <div style={{ flexGrow: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ backgroundColor: '#DCF8C6', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', maxWidth: '85%', alignSelf: 'flex-start', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', color: '#333333', lineHeight: '1.4', whiteSpace: 'pre-wrap', position: 'relative' }}>
                      {getMergedPreviewText()}
                      <span style={{ float: 'right', fontSize: '8px', opacity: 0.5, marginTop: '4px', marginLeft: '6px' }}>11:45 AM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Mock */}
              {activeTemplate.channel === 'sms' && (
                <div className="mock-phone" style={{ width: '100%', maxWidth: '280px', height: '380px', borderRadius: '24px', border: '8px solid #2d3748', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#ffffff', position: 'relative', flexShrink: 0 }}>
                  <div style={{ backgroundColor: '#f4f4f5', padding: '10px 12px', borderBottom: '1px solid #e4e4e7', textAlign: 'center', fontSize: '12px', color: '#18181b', fontWeight: '600' }}>
                    +91 98765 43210
                  </div>
                  <div style={{ flexGrow: 1, padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <div style={{ backgroundColor: '#007aff', borderRadius: '16px', padding: '10px 14px', fontSize: '11.5px', maxWidth: '80%', alignSelf: 'flex-start', color: '#ffffff', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                      {getMergedPreviewText()}
                    </div>
                  </div>
                </div>
              )}

              {/* Email Mock */}
              {activeTemplate.channel === 'email' && (
                <div className="mock-phone" style={{ width: '100%', maxWidth: '290px', height: '380px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                  <div style={{ backgroundColor: 'var(--bg-dark)', padding: '10px 14px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
                    <i className="fas fa-envelope-open" style={{ color: 'var(--accent)' }}></i>
                    <span style={{ fontWeight: '600' }}>Aura Concierge Mailer</span>
                  </div>
                  <div style={{ borderBottom: '1px solid var(--border)', padding: '8px 12px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    <div><b>From:</b> Aura Skin Care &lt;noreply@aura.clinic&gt;</div>
                    <div style={{ marginTop: '2px' }}><b>To:</b> Alex Rivera &lt;alex@rivera.com&gt;</div>
                    <div style={{ marginTop: '2px' }}><b>Subject:</b> Appointment Consultation Booking Confirmed</div>
                  </div>
                  <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px' }}>
                    <div style={{ backgroundColor: 'var(--primary)', padding: '10px', textAlign: 'center', borderRadius: '4px', marginBottom: '10px', color: '#ffffff', fontFamily: 'var(--font-heading)', fontSize: '11.5px', fontWeight: '700' }}>
                      AURA DERMATOLOGY
                    </div>
                    <div style={{ fontSize: '11px', lineHeight: '1.5', whiteSpace: 'pre-wrap', color: 'var(--text-dark)' }}>
                      {getMergedPreviewText()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Select or create a message template to begin.
        </div>
      )}
    </div>
  );
}
