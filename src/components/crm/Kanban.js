'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Kanban({ globalSearch, setGlobalSearch }) {
  const { leads, updateLeadStatus, addLeadNote, saveLeadNotesContent, deleteLead, templates, showToast } = useCRM();
  
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
      showToast('Lead record successfully deleted.', 'success');
    } else {
      showToast('Failed to delete lead.', 'error');
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
    
    showToast(`Message simulated & sent successfully to ${activeLead.name} via ${template.channel.toUpperCase()}!`, 'success');
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

  // Shared detail items styles for drawer layout
  const infoItemStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '14px 18px',
    border: '1px solid rgba(15, 107, 92, 0.06)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  };
  
  const infoLabelStyle = {
    fontSize: '10.5px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const infoValStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-dark)'
  };

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
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title" style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)' }}>
                {getColHeaderLabel(col)}
              </span>
              <span className="kanban-column-count">{colLeads.length}</span>
            </div>
            
            <div className="kanban-cards-container">
              {colLeads.map(lead => {
                const sourceBg = '#F1F5F9';
                const sourceColor = '#475569';

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
        <div 
          onClick={() => setActiveLeadId(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(18, 33, 30, 0.4)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '500px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: '#F4F6F7',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1001,
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
                  borderRadius: '50%',
                  backgroundColor: 'rgba(15, 107, 92, 0.08)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '14px',
                }}>
                  {getInitials(activeLead.name)}
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lead Chart Detail</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '850', color: 'var(--text-dark)', margin: 0 }}>{activeLead.name}</h3>
                </div>
              </div>
              <button 
                onClick={() => setActiveLeadId(null)} 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-dark)'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid var(--border)',
              padding: '0 16px'
            }}>
              <div 
                className={`drawer-tab ${drawerTab === 'details' ? 'active' : ''}`} 
                onClick={() => setDrawerTab('details')}
                style={{ padding: '14px 20px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', borderBottom: drawerTab === 'details' ? '2px solid var(--primary)' : '2px solid transparent', color: drawerTab === 'details' ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                Overview
              </div>
              <div 
                className={`drawer-tab ${drawerTab === 'timeline' ? 'active' : ''}`} 
                onClick={() => setDrawerTab('timeline')}
                style={{ padding: '14px 20px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', borderBottom: drawerTab === 'timeline' ? '2px solid var(--primary)' : '2px solid transparent', color: drawerTab === 'timeline' ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                History & Notes
              </div>
              <div 
                className={`drawer-tab ${drawerTab === 'message' ? 'active' : ''}`} 
                onClick={() => setDrawerTab('message')}
                style={{ padding: '14px 20px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', borderBottom: drawerTab === 'message' ? '2px solid var(--primary)' : '2px solid transparent', color: drawerTab === 'message' ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                Quick Response
              </div>
            </div>

            {/* Body */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {drawerTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Full Name</span>
                    <span style={infoValStyle}>{activeLead.name}</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Phone</span>
                    <span style={infoValStyle}>{activeLead.phone}</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Email</span>
                    <span style={infoValStyle}>{activeLead.email || 'N/A'}</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Source</span>
                    <span style={infoValStyle}>{activeLead.source}</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Interested in</span>
                    <span style={{ ...infoValStyle, color: 'var(--primary)' }}>{activeLead.treatment}</span>
                  </div>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Date Captured</span>
                    <span style={infoValStyle}>
                      {activeLead.created_at ? new Date(activeLead.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </span>
                  </div>

                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Pipeline Workflow Status</span>
                    <select 
                      id="drawer-status-select" 
                      style={{
                        width: '100%',
                        padding: '10px 14px',
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
                    <span style={infoLabelStyle}>General Notes / Requirements</span>
                    <textarea 
                      rows="4"
                      value={activeLead.notes || ''}
                      onChange={(e) => saveLeadNotesContent(activeLead.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: '#ffffff',
                        fontSize: '13.5px',
                        marginTop: '6px',
                        color: 'var(--text-dark)',
                        resize: 'vertical',
                        outline: 'none',
                        lineHeight: '1.5'
                      }}
                      placeholder="Type patient case notes here..."
                    />
                  </div>

                  {/* Red Delete Button */}
                  <button
                    onClick={handleDeleteLead}
                    className="btn btn-secondary btn-full"
                    style={{
                      marginTop: '20px',
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
                      borderRadius: '10px',
                      padding: '12px'
                    }}
                  >
                    <i className="far fa-trash-can"></i> Delete Lead Record
                  </button>
                </div>
              )}

              {drawerTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
                  }}>
                    <label style={infoLabelStyle}>Write a Clinical / Callback Note</label>
                    <textarea 
                      rows="3" 
                      placeholder="e.g. Patient called back, wants Tuesday..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '13.5px',
                        marginTop: '8px',
                        color: 'var(--text-dark)',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                    <button 
                      onClick={handleAddNote} 
                      className="btn btn-primary"
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        borderRadius: '8px',
                        marginLeft: 'auto',
                        display: 'block'
                      }}
                    >
                      Save Note
                    </button>
                  </div>

                  <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    Interaction History
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                          padding: '14px 18px',
                          border: '1px solid rgba(15, 107, 92, 0.05)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.015)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '750', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <i className={iconClass}></i> {typeLabel}
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{hist.date}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#4A5568', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{hist.text}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {drawerTab === 'message' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={infoItemStyle}>
                    <span style={infoLabelStyle}>Select Message Template</span>
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
                    <span style={infoLabelStyle}>Compiled Output Preview</span>
                    <div style={{ 
                      backgroundColor: 'var(--bg-warm)', 
                      padding: '14px 18px', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px', 
                      fontSize: '12.5px', 
                      maxHeight: '220px', 
                      overflowY: 'auto', 
                      lineHeight: '1.5', 
                      color: '#2D3748', 
                      whiteSpace: 'pre-wrap',
                      marginTop: '6px'
                    }}>
                      {selectedTemplateId ? getCompiledPreview() : 'Select a template above to generate a message preview.'}
                    </div>
                  </div>

                  <button 
                    onClick={handleSendMockMessage} 
                    className="btn btn-accent btn-full"
                    disabled={!selectedTemplateId}
                    style={{
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '8px',
                      cursor: selectedTemplateId ? 'pointer' : 'not-allowed'
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
