'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Leads() {
  const { 
    leads, 
    templates, 
    updateLeadStatus, 
    addLeadNote, 
    saveLeadNotesContent 
  } = useCRM();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Selected Lead Drawer state
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details');
  const [newNote, setNewNote] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const activeLead = leads.find(l => l.id === activeLeadId);

  // Filters calculation
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
                          lead.email.toLowerCase().includes(search.toLowerCase()) ||
                          lead.phone.includes(search);
    const matchesTreatment = !treatmentFilter || lead.treatment === treatmentFilter;
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesSource = !sourceFilter || lead.source === sourceFilter;

    return matchesSearch && matchesTreatment && matchesStatus && matchesSource;
  });

  const handleRowClick = (leadId) => {
    setActiveLeadId(leadId);
    setDrawerTab('details');
    setSelectedTemplateId('');
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

  return (
    <div>
      {/* Filters bar */}
      <div className="table-filter-bar flex gap-4 mb-5 flex-wrap">
        <input 
          type="text" 
          className="form-input" 
          style={{ width: '240px', padding: '8px 12px' }} 
          placeholder="Search by name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select 
          className="form-select" 
          style={{ width: '200px', padding: '8px 12px' }}
          value={treatmentFilter}
          onChange={(e) => setTreatmentFilter(e.target.value)}
        >
          <option value="">All Treatments</option>
          <option value="Laser Skin Resurfacing">Laser Resurfacing</option>
          <option value="Botox & Dermal Fillers">Botox Injectables</option>
          <option value="Chemical Peels">Chemical Peels</option>
          <option value="Advanced Acne Therapy">Acne Treatment</option>
        </select>
        
        <select 
          className="form-select" 
          style={{ width: '160px', padding: '8px 12px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Booked">Consult Booked</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>

        <select 
          className="form-select" 
          style={{ width: '160px', padding: '8px 12px' }}
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="">All Sources</option>
          <option value="Website Form">Website Form</option>
          <option value="WhatsApp Click">WhatsApp widget</option>
          <option value="Instagram Ad">Instagram Ad</option>
          <option value="Doctor Referral">Doctor Referral</option>
        </select>
      </div>

      {/* Table grid layout */}
      <div className="table-container shadow-sm border border-gray-200 rounded-md overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Phone Number</th>
              <th>Email Address</th>
              <th>Treatment Interested</th>
              <th>Inquiry Source</th>
              <th>Pipeline Status</th>
              <th>Date Logged</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-8">No leads match filters.</td>
              </tr>
            ) : (
              filteredLeads.map(lead => (
                <tr key={lead.id} onClick={() => handleRowClick(lead.id)} className="hover:bg-teal-50/20 cursor-pointer">
                  <td style={{ fontWeight: 600 }}>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.email}</td>
                  <td><span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--primary)' }}>{lead.treatment}</span></td>
                  <td><span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>{lead.source}</span></td>
                  <td><span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{lead.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-in Detail Drawer */}
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

            {/* Tabs */}
            <div className="drawer-tabs">
              <div className={`drawer-tab ${drawerTab === 'details' ? 'active' : ''}`} onClick={() => setDrawerTab('details')}>Overview</div>
              <div className={`drawer-tab ${drawerTab === 'timeline' ? 'active' : ''}`} onClick={() => setDrawerTab('timeline')}>History & Notes</div>
              <div className={`drawer-tab ${drawerTab === 'message' ? 'active' : ''}`} onClick={() => setDrawerTab('message')}>Quick Response</div>
            </div>

            {/* Body */}
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
