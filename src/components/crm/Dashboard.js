'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Dashboard({ onNavigate }) {
  const { 
    leads, 
    appointments, 
    updateLeadStatus, 
    addLeadNote, 
    saveLeadNotesContent, 
    deleteLead, 
    templates 
  } = useCRM();

  // Metrics calculations
  const newCount = leads.filter(l => l.status && l.status.toLowerCase() === 'new').length;
  const contactedCount = leads.filter(l => l.status && l.status.toLowerCase() === 'contacted').length;
  
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const weeklyApts = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= today && aptDate <= nextWeek;
  }).length;

  const totalLeads = leads.length;
  const convertedCount = leads.filter(l => l.status && l.status.toLowerCase() === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  // Drawer local states
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details');
  const [newNote, setNewNote] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const activeLead = leads.find(l => l.id === activeLeadId);

  // Gather logs in chronological order
  let logs = [];
  leads.forEach(lead => {
    (lead.history || []).forEach(hist => {
      logs.push({
        leadName: lead.name,
        leadId: lead.id,
        type: hist.type,
        text: hist.text,
        date: new Date(hist.date),
        rawDate: hist.date
      });
    });
  });

  logs.sort((a, b) => b.date - a.date);
  const recentLogs = logs.slice(0, 6);

  const handleAddNote = () => {
    if (!newNote.trim() || !activeLeadId) return;
    addLeadNote(activeLeadId, newNote, 'Staff');
    setNewNote('');
  };

  const handleDeleteLead = async () => {
    if (!activeLead) return;
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete lead "${activeLead.name}"?`);
    if (!confirmDelete) return;
    
    const success = await deleteLead(activeLead.id);
    if (success) {
      setActiveLeadId(null);
    } else {
      alert('Failed to delete lead.');
    }
  };

  const handleSendMockMessage = () => {
    if (!selectedTemplateId || !activeLead) return;
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    const compiled = template.content
      .replace(/{{PatientName}}/g, activeLead.name)
      .replace(/{{TreatmentInterested}}/g, activeLead.treatment)
      .replace(/{{ClinicPhone}}/g, '+91 98765 43210')
      .replace(/{{ClinicWhatsApp}}/g, '+91 98765 43210')
      .replace(/{{ClinicAddress}}/g, '404 Green Valley Blvd');

    addLeadNote(
      activeLeadId, 
      `Sent Outgoing ${template.channel.toUpperCase()}:\n\n${compiled}`, 
      'Auto Outbox'
    );
    
    setSelectedTemplateId('');
    alert(`Simulated outgoing template sent to ${activeLead.name}.`);
  };

  const getCompiledPreview = () => {
    if (!selectedTemplateId || !activeLead) return '';
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return '';
    return template.content
      .replace(/{{PatientName}}/g, activeLead.name)
      .replace(/{{TreatmentInterested}}/g, activeLead.treatment)
      .replace(/{{ClinicPhone}}/g, '+91 98765 43210')
      .replace(/{{ClinicWhatsApp}}/g, '+91 98765 43210')
      .replace(/{{ClinicAddress}}/g, '404 Green Valley Blvd');
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Plain monochrome styles to override default transitions and colors
  const cleanCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: 'none',
    transition: 'none',
    transform: 'none'
  };

  const infoItemStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '14px 18px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Monochrome Metric Cards Row - Flat & Clean, No Animations */}
      <div className="metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {[
          { title: 'New Inquiries Today', value: newCount, desc: '+12% vs yesterday', icon: 'fas fa-user-plus' },
          { title: 'Pending Followups', value: contactedCount, desc: '-2% vs avg', icon: 'fas fa-phone-volume' },
          { title: 'Booked Consultations', value: weeklyApts, desc: 'Next 7 days', icon: 'far fa-calendar-check' },
          { title: 'Lead Conversion Rate', value: `${conversionRate}%`, desc: '+4% industry avg', icon: 'fas fa-percentage' }
        ].map((card, i) => (
          <div 
            key={i} 
            className="metric-card" 
            style={{ 
              ...cleanCardStyle, 
              padding: '20px 24px', 
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {card.title}
              </span>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center', color: 'var(--text-dark)', fontSize: '13px' }}>
                <i className={card.icon}></i>
              </div>
            </div>
            <span style={{ fontSize: '26px', fontWeight: '850', color: 'var(--text-dark)' }}>{card.value}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>{card.desc}</span>
          </div>
        ))}
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-[24px]">
        
        {/* Recent activity timeline */}
        <div className="card" style={{ ...cleanCardStyle, padding: '24px' }}>
          <h3 style={{ fontSize: '14.5px', marginBottom: '20px', fontWeight: '850', color: 'var(--text-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <i className="far fa-clock" style={{ marginRight: '6px' }}></i> Recent Leads Activity Timeline
          </h3>
          
          {recentLogs.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No logs found.</div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
              {recentLogs.map((log, idx) => {
                let icon = 'fas fa-info-circle';
                if (log.type === 'system') icon = 'fas fa-cog';
                else if (log.type === 'auto-msg') icon = 'fas fa-paper-plane';
                else if (log.type === 'note') icon = 'fas fa-sticky-note';
                else if (log.type === 'manual-msg') icon = 'fas fa-envelope';

                return (
                  <li 
                    key={idx} 
                    onClick={() => {
                      setActiveLeadId(log.leadId);
                      setDrawerTab('timeline');
                      setNewNote('');
                      setSelectedTemplateId('');
                    }}
                    style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      padding: '16px', 
                      borderBottom: '1px solid var(--border)', 
                      cursor: 'pointer',
                      transition: 'none',
                      borderRadius: '8px'
                    }}
                    className="timeline-item-flat-hover"
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: '#F8FAFC', border: '1px solid var(--border)', color: 'var(--text-dark)' }}>
                      <i className={icon} style={{ fontSize: '13px' }}></i>
                    </div>
                    <div style={{ flexGrow: 1, fontSize: '13px', minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '750', color: 'var(--text-dark)' }}>{log.leadName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.rawDate}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '3px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {log.text}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick Tools actions column */}
        <div className="card" style={{ ...cleanCardStyle, padding: '24px' }}>
          <h3 style={{ fontSize: '14.5px', marginBottom: '20px', fontWeight: '850', color: 'var(--text-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <i className="fas fa-toolbox" style={{ marginRight: '6px' }}></i> Clinical Quick Tools
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm text-left" style={{ justifyContent: 'flex-start', borderRadius: '10px' }} onClick={() => onNavigate('leads')}>
              <i className="fas fa-user-plus" style={{ marginRight: '8px', color: 'var(--text-dark)' }}></i> View Leads Directory
            </button>
            <button className="btn btn-secondary btn-sm text-left" style={{ justifyContent: 'flex-start', borderRadius: '10px' }} onClick={() => onNavigate('calendar')}>
              <i className="far fa-calendar-alt" style={{ marginRight: '8px', color: 'var(--text-dark)' }}></i> Open Schedule Calendar
            </button>
            <button className="btn btn-secondary btn-sm text-left" style={{ justifyContent: 'flex-start', borderRadius: '10px' }} onClick={() => onNavigate('templates')}>
              <i className="far fa-envelope-open" style={{ marginRight: '8px', color: 'var(--text-dark)' }}></i> Manage SMS & Mail Templates
            </button>
          </div>
          
          <div style={{ marginTop: '30px', padding: '18px', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', backgroundColor: '#F8FAFC' }}>
            <i className="fas fa-user-shield" style={{ fontSize: '28px', color: 'var(--text-dark)', marginBottom: '10px' }}></i>
            <h4 style={{ fontSize: '12.5px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-dark)' }}>HIPAA & GDPR Secured</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>Patient medical charts are encrypted at rest. Audit logs active.</p>
          </div>
        </div>
      </div>

      {/* Side Slide-in Drawer (Instant Display, No transitions/animations) */}
      {activeLead && (
        <div 
          onClick={() => setActiveLeadId(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(10, 22, 20, 0.3)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'none'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '500px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: '#ffffff',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10001,
              transition: 'none'
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid var(--border)', 
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--border)',
                  color: 'var(--text-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '850',
                  fontSize: '14px',
                }}>
                  {getInitials(activeLead.name)}
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lead Chart Detail</span>
                  <h3 style={{ fontSize: '17px', fontWeight: '850', color: 'var(--text-dark)', margin: 0 }}>{activeLead.name}</h3>
                </div>
              </div>
              <button 
                onClick={() => setActiveLeadId(null)} 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <i className="fas fa-times" style={{ fontSize: '12px' }}></i>
              </button>
            </div>

            {/* Tab Bar */}
            <div style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid var(--border)',
              padding: '0 16px'
            }}>
              {[
                { id: 'details', label: 'Overview' },
                { id: 'timeline', label: 'History & Notes' },
                { id: 'message', label: 'Quick Response' }
              ].map(tab => (
                <div 
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id)}
                  style={{ 
                    padding: '14px 20px', 
                    cursor: 'pointer', 
                    fontSize: '13px', 
                    fontWeight: '750', 
                    borderBottom: drawerTab === tab.id ? '3px solid var(--text-dark)' : '3px solid transparent', 
                    color: drawerTab === tab.id ? 'var(--text-dark)' : 'var(--text-muted)',
                    transition: 'none'
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>

            {/* Tab Pane Body */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#F8FAFC'
            }}>
              {drawerTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={infoItemStyle}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Full Name</span>
                    <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-dark)' }}>{activeLead.name}</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Phone</span>
                    <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-dark)' }}>{activeLead.phone}</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Email</span>
                    <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-dark)' }}>{activeLead.email || 'N/A'}</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Source</span>
                    <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-dark)' }}>{activeLead.source}</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Interested in</span>
                    <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-dark)' }}>{activeLead.treatment}</span>
                  </div>

                  <div style={infoItemStyle}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Pipeline Status</span>
                    <select 
                      id="drawer-status-select" 
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: '#ffffff',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        color: 'var(--text-dark)',
                        marginTop: '6px',
                        outline: 'none'
                      }}
                      value={activeLead.status ? activeLead.status.toLowerCase() : ''}
                      onChange={(e) => updateLeadStatus(activeLead.id, e.target.value)}
                    >
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="booked">Consultation Booked</option>
                      <option value="converted">Converted Patient</option>
                      <option value="lost">Not Interested</option>
                    </select>
                  </div>

                  <div style={infoItemStyle}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>General Notes / Requirements</span>
                    <textarea 
                      rows="4"
                      value={activeLead.notes || ''}
                      onChange={(e) => saveLeadNotesContent(activeLead.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: '#ffffff',
                        fontSize: '13.5px',
                        marginTop: '6px',
                        color: 'var(--text-dark)',
                        resize: 'none',
                        outline: 'none',
                        lineHeight: '1.4'
                      }}
                      placeholder="Type lead case notes here..."
                    />
                  </div>

                  <button
                    onClick={handleDeleteLead}
                    className="btn btn-secondary btn-full"
                    style={{
                      marginTop: '16px',
                      backgroundColor: '#ffffff',
                      color: 'var(--danger)',
                      borderColor: 'var(--danger)',
                      fontWeight: '700',
                      borderRadius: '10px',
                      padding: '12px'
                    }}
                  >
                    <i className="far fa-trash-can" style={{ marginRight: '6px' }}></i> Delete Lead Record
                  </button>
                </div>
              )}

              {drawerTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                  }}>
                    <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Write Note</label>
                    <textarea 
                      rows="3" 
                      placeholder="e.g. Patient called back..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '13px',
                        marginTop: '8px',
                        color: 'var(--text-dark)',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                    <button 
                      onClick={handleAddNote} 
                      className="btn btn-secondary btn-sm"
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        borderRadius: '8px',
                        marginLeft: 'auto',
                        display: 'block',
                        fontWeight: '700'
                      }}
                    >
                      Save Note
                    </button>
                  </div>

                  <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                    Interaction History
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[...(activeLead.history || [])].reverse().map((hist, idx) => {
                      let typeLabel = 'System';
                      let iconClass = 'fas fa-cog';
                      if (hist.type === 'note') {
                        typeLabel = hist.author || 'Staff Note';
                        iconClass = 'fas fa-sticky-note';
                      } else if (hist.type === 'auto-msg') {
                        typeLabel = 'Auto Response';
                        iconClass = 'fas fa-paper-plane';
                      } else if (hist.type === 'manual-msg') {
                        typeLabel = 'Outgoing Message';
                        iconClass = 'fas fa-envelope';
                      }

                      return (
                        <div key={idx} style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          padding: '14px',
                          border: '1px solid var(--border)',
                          fontSize: '13px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <i className={iconClass} style={{ color: 'var(--text-muted)' }}></i> {typeLabel}
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{hist.date}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#4A5568', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>{hist.text}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {drawerTab === 'message' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={infoItemStyle}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Select Message Template</span>
                    <select 
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: '#ffffff',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        color: 'var(--text-dark)',
                        marginTop: '6px',
                        outline: 'none'
                      }}
                    >
                      <option value="">-- Choose Template --</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.channel.toUpperCase()})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={infoItemStyle}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Compiled Output Preview</span>
                    <div style={{ 
                      backgroundColor: '#ffffff', 
                      padding: '14px', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px', 
                      fontSize: '12.5px', 
                      maxHeight: '220px', 
                      overflowY: 'auto', 
                      lineHeight: '1.45', 
                      color: 'var(--text-dark)', 
                      whiteSpace: 'pre-wrap',
                      marginTop: '6px'
                    }}>
                      {selectedTemplateId ? getCompiledPreview() : 'Select a template above to generate a message preview.'}
                    </div>
                  </div>

                  <button 
                    onClick={handleSendMockMessage} 
                    className="btn btn-secondary btn-full"
                    disabled={!selectedTemplateId}
                    style={{
                      padding: '12px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '8px',
                      cursor: selectedTemplateId ? 'pointer' : 'not-allowed',
                      backgroundColor: selectedTemplateId ? '#ffffff' : '#FAFAFA',
                      borderColor: selectedTemplateId ? 'var(--text-dark)' : 'var(--border)',
                      color: 'var(--text-dark)'
                    }}
                  >
                    <i className="fas fa-paper-plane"></i> Send via {selectedTemplateId ? templates.find(t => t.id === selectedTemplateId)?.channel.toUpperCase() : ''}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
