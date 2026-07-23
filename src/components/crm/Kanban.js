'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Kanban() {
  const { leads, updateLeadStatus, addLeadNote, saveLeadNotesContent, templates } = useCRM();
  
  // Local Drawer state (reused from Leads for self-containment)
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details');
  const [newNote, setNewNote] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const activeLead = leads.find(l => l.id === activeLeadId);

  const columns = ['New', 'Contacted', 'Booked', 'Converted', 'Lost'];

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
    switch (col) {
      case 'New': return 'NEW INQUIRIES';
      case 'Contacted': return 'CONTACTED';
      case 'Booked': return 'CONSULT BOOKED';
      case 'Converted': return 'CONVERTED';
      case 'Lost': return 'NOT INTERESTED';
      default: return col;
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !activeLeadId) return;
    addLeadNote(activeLeadId, newNote, 'Staff');
    setNewNote('');
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

  return (
    <div className="kanban-board">
      {columns.map(col => {
        const colLeads = leads.filter(l => l.status === col);
        
        return (
          <div 
            key={col} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col)}
          >
            <div className="kanban-column-header">
              <span>{getColHeaderLabel(col)}</span>
              <span className="kanban-column-count">{colLeads.length}</span>
            </div>
            
            <div className="kanban-cards-container">
              {colLeads.map(lead => {
                let sourceStyle = {};
                if (lead.source === 'Website Form') sourceStyle = { backgroundColor: '#EBF3FA', color: '#3A86C8' };
                else if (lead.source === 'WhatsApp Click') sourceStyle = { backgroundColor: '#EBF7F5', color: '#3FA796' };
                else sourceStyle = { backgroundColor: '#FEF7EA', color: '#F5A623' };

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
                    <div className="kanban-card-meta">
                      <span className="kanban-card-treatment"><i className="fas fa-stethoscope"></i> {lead.treatment}</span>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start', marginTop: '2px', fontWeight: 600, ...sourceStyle }}>
                        {lead.source}
                      </span>
                    </div>
                    <div className="kanban-card-footer">
                      <span className="kanban-card-time"><i className="far fa-clock"></i> {lead.date}</span>
                      <button 
                        className="btn-icon btn-sm" 
                        style={{ width: '24px', height: '24px', border: 'none', background: 'none', color: 'var(--primary)' }}
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
            <div className="drawer-header">
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Lead Chart Detail</span>
                <h3 className="drawer-title">{activeLead.name}</h3>
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
                      <span className="info-val">{activeLead.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Source</span>
                      <span className="info-val">{activeLead.source}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Interested in</span>
                      <span className="info-val" style={{ color: 'var(--primary)', fontWeight: 600 }}>{activeLead.treatment}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date Captured</span>
                      <span className="info-val">{activeLead.date} {activeLead.time || ''}</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label" htmlFor="drawer-status-select">Pipeline Workflow Status</label>
                    <select 
                      id="drawer-status-select" 
                      className="form-select"
                      value={activeLead.status}
                      onChange={(e) => updateLeadStatus(activeLead.id, e.target.value)}
                    >
                      <option value="New">New Lead</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Booked">Consultation Booked</option>
                      <option value="Converted">Converted Patient</option>
                      <option value="Lost">Not Interested</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label">General Notes / Requirements</label>
                    <textarea 
                      className="form-textarea" 
                      rows="5"
                      value={activeLead.notes}
                      onChange={(e) => saveLeadNotesContent(activeLead.id, e.target.value)}
                    ></textarea>
                  </div>
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
                    {[...(activeLead.history || [])].reverse().map((hist, idx) => (
                      <div key={idx} className="log-item">
                        <div className="log-header">
                          <span><i className="fas fa-cog"></i> <b>{hist.author || 'History'}</b></span>
                          <span>{hist.date}</span>
                        </div>
                        <div className="log-content" style={{ whiteSpace: 'pre-wrap' }}>{hist.text}</div>
                      </div>
                    ))}
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
                      {selectedTemplateId ? (
                        templates.find(t => t.id === selectedTemplateId)?.content
                          .replace(/{{PatientName}}/g, activeLead.name)
                          .replace(/{{TreatmentInterested}}/g, activeLead.treatment)
                      ) : 'Select a template above to generate a message preview.'}
                    </div>
                  </div>

                  <button 
                    onClick={handleSendMockMessage} 
                    className="btn btn-accent btn-full"
                    disabled={!selectedTemplateId}
                  >
                    Send Message
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
