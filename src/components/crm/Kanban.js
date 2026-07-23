'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Kanban({ globalSearch, setGlobalSearch }) {
  const { leads, updateLeadStatus, addLeadNote, saveLeadNotesContent, deleteLead, templates } = useCRM();
  
  // Local Drawer state (reused from Leads for self-containment)
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details');
  const [newNote, setNewNote] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const activeLead = leads.find(l => l.id === activeLeadId);

  const columns = ['new', 'contacted', 'booked', 'converted', 'lost'];

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      updateLeadStatus(leadId, targetStatus);
    }
  };

  const getColHeaderLabel = (col) => {
    switch (col.toLowerCase()) {
      case 'new': return 'New Inquiries';
      case 'contacted': return 'Contacted';
      case 'booked': return 'Consult Booked';
      case 'converted': return 'Converted';
      case 'lost': return 'Not Interested';
      default: return col.toUpperCase();
    }
  };

  const getColColor = (col) => {
    switch (col.toLowerCase()) {
      case 'new': return '#3FA796';
      case 'contacted': return '#3A86C8';
      case 'booked': return '#9B59B6';
      case 'converted': return '#F5A623';
      case 'lost': return '#E85D4B';
      default: return 'var(--primary)';
    }
  };

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
      alert('Lead record successfully deleted.');
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
    
    alert(`Message simulated & sent successfully to ${activeLead.name} via ${template.channel.toUpperCase()}!`);
    setSelectedTemplateId('');
  };

  // Get compiled template text
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

  // Filters calculation from global search term
  const filteredLeads = leads.filter(lead => {
    if (!globalSearch) return true;
    const nameMatch = lead.name ? lead.name.toLowerCase().includes(globalSearch.toLowerCase()) : false;
    const emailMatch = lead.email ? lead.email.toLowerCase().includes(globalSearch.toLowerCase()) : false;
    const phoneMatch = lead.phone ? lead.phone.includes(globalSearch) : false;
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="kanban-board" style={{ paddingBottom: '30px' }}>
      {columns.map(col => {
        const colLeads = filteredLeads.filter(l => l.status && l.status.toLowerCase() === col);
        const colColor = getColColor(col);
        
        return (
          <div 
            key={col} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col)}
            style={{ borderTop: `4px solid ${colColor}` }}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: colColor, 
                  display: 'inline-block',
                  marginRight: '6px'
                }}></span>
                {getColHeaderLabel(col)}
              </span>
              <span className="kanban-column-count">{colLeads.length}</span>
            </div>
            
            <div className="kanban-cards-container">
              {colLeads.map(lead => {
                let sourceBg = 'rgba(63, 167, 150, 0.08)';
                let sourceColor = '#3FA796';
                if (lead.source === 'Website Form' || lead.source === 'Website') {
                  sourceBg = 'rgba(58, 134, 200, 0.08)';
                  sourceColor = '#3A86C8';
                } else if (lead.source === 'WhatsApp' || lead.source === 'WhatsApp Click') {
                  sourceBg = 'rgba(63, 167, 150, 0.08)';
                  sourceColor = '#3FA796';
                } else {
                  sourceBg = 'rgba(245, 166, 35, 0.08)';
                  sourceColor = '#F5A623';
                }

                return (
                  <div 
                    key={lead.id} 
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => {
                      setActiveLeadId(lead.id);
                      setDrawerTab('details');
                      setSelectedTemplateId('');
                    }}
                  >
                    <div className="kanban-card-title">{lead.name}</div>
                    
                    <div className="kanban-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                      <span className="kanban-card-treatment" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-stethoscope"></i> {lead.treatment}
                      </span>
                      
                      <span style={{ 
                        fontSize: '10.5px', 
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        fontWeight: '750', 
                        backgroundColor: sourceBg, 
                        color: sourceColor,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <i className="fas fa-bullhorn" style={{ fontSize: '9px' }}></i> {lead.source}
                      </span>
                    </div>

                    <div className="kanban-card-footer" style={{ borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="kanban-card-time" style={{ fontSize: '11px', color: 'var(--text-muted)' }}><i className="far fa-clock"></i> {lead.date}</span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Quick-move dropdown (alternative logic to drag and drop) */}
                        <select 
                          value={lead.status ? lead.status.toLowerCase() : 'new'}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-warm)',
                            cursor: 'pointer',
                            color: 'var(--text-dark)',
                            fontWeight: '700',
                            outline: 'none'
                          }}
                          onClick={(e) => e.stopPropagation()} // Stop opening the drawer
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="booked">Booked</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>

                        <button 
                          className="btn-icon btn-sm" 
                          style={{ width: '24px', height: '24px', border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLeadId(lead.id);
                            setDrawerTab('details');
                          }}
                        >
                          <i className="fas fa-external-link-alt" style={{ fontSize: '11px' }}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Reused Lead details drawer */}
      {activeLead && (
        <div className="drawer-backdrop active" onClick={() => setActiveLeadId(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(15, 107, 92, 0.08)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '15px',
                  fontFamily: 'var(--font-heading)'
                }}>
                  {getInitials(activeLead.name)}
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lead Chart Detail</span>
                  <h3 className="drawer-title" style={{ fontSize: '19px', fontWeight: '850', color: 'var(--text-dark)', fontFamily: 'var(--font-heading)', margin: 0 }}>{activeLead.name}</h3>
                </div>
              </div>
              <button onClick={() => setActiveLeadId(null)} className="btn-icon rounded-full"><i className="fas fa-times"></i></button>
            </div>

            <div className="drawer-tabs">
              <div className={`drawer-tab ${drawerTab === 'details' ? 'active' : ''}`} onClick={() => setDrawerTab('details')}>Overview</div>
              <div className={`drawer-tab ${drawerTab === 'timeline' ? 'active' : ''}`} onClick={() => setDrawerTab('timeline')}>History & Notes</div>
              <div className={`drawer-tab ${drawerTab === 'message' ? 'active' : ''}`} onClick={() => setDrawerTab('message')}>Quick Response</div>
            </div>

            <div className="drawer-body">
              {drawerTab === 'details' && (
                <div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Full Name</span>
                      <span className="info-val">{activeLead.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone</span>
                      <span className="info-val">{activeLead.phone}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-val">{activeLead.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Source</span>
                      <span className="info-val">{activeLead.source}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Interested in</span>
                      <span className="info-val" style={{ color: 'var(--primary)', fontWeight: 650 }}>{activeLead.treatment}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date Captured</span>
                      <span className="info-val">
                        {activeLead.created_at ? new Date(activeLead.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label" htmlFor="drawer-status-select">Pipeline Workflow Status</label>
                    <select 
                      id="drawer-status-select" 
                      className="form-select"
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

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label">General Notes / Requirements</label>
                    <textarea 
                      className="form-textarea" 
                      rows="5"
                      value={activeLead.notes || ''}
                      onChange={(e) => saveLeadNotesContent(activeLead.id, e.target.value)}
                    ></textarea>
                  </div>

                  {/* Red Delete Button */}
                  <button
                    onClick={handleDeleteLead}
                    className="btn btn-secondary btn-full"
                    style={{
                      marginTop: '28px',
                      backgroundColor: 'rgba(232, 93, 75, 0.08)',
                      color: '#E85D4B',
                      borderColor: 'rgba(232, 93, 75, 0.2)',
                      borderStyle: 'solid',
                      borderWidth: '1px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      borderRadius: '10px'
                    }}
                  >
                    <i className="far fa-trash-can"></i> Delete Lead Record
                  </button>
                </div>
              )}

              {drawerTab === 'timeline' && (
                <div>
                  <div className="form-group bg-[#FAF9F6] p-4 border border-gray-200 rounded-sm mb-6">
                    <label className="form-label">Write a Clinical / Callback Note</label>
                    <textarea 
                      className="form-textarea" 
                      rows="2" 
                      placeholder="e.g. Patient called back, wants Tuesday..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    ></textarea>
                    <button onClick={handleAddNote} className="btn btn-primary btn-sm mt-3 ml-auto block">Save Note</button>
                  </div>

                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Interaction History</h4>
                  <div className="timeline-logs">
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
                        <div key={idx} className="log-item">
                          <div className="log-header">
                            <span><i className={iconClass}></i> <b>{typeLabel}</b></span>
                            <span>{hist.date}</span>
                          </div>
                          <div className="log-content" style={{ whiteSpace: 'pre-wrap' }}>{hist.text}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {drawerTab === 'message' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Select Message Template</label>
                    <select 
                      className="form-select"
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                    >
                      <option value="">-- Choose Template --</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.channel.toUpperCase()})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Compiled Output Preview</label>
                    <div style={{ backgroundColor: 'var(--bg-warm)', padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px', maxHeight: '220px', overflowY: 'auto', lineHeight: '1.5', color: '#333333', whiteSpace: 'pre-wrap' }}>
                      {selectedTemplateId ? getCompiledPreview() : 'Select a template above to generate a message preview.'}
                    </div>
                  </div>

                  <button 
                    onClick={handleSendMockMessage} 
                    className="btn btn-accent btn-full"
                    disabled={!selectedTemplateId}
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
