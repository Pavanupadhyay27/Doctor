'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Leads({ globalSearch, setGlobalSearch }) {
  const { 
    leads, 
    templates, 
    updateLeadStatus, 
    addLeadNote, 
    saveLeadNotesContent, 
    deleteLead
  } = useCRM();

  // Search & Filter state
  const [localSearch, setLocalSearch] = useState('');
  const search = globalSearch !== undefined ? globalSearch : localSearch;
  const setSearch = setGlobalSearch !== undefined ? setGlobalSearch : setLocalSearch;
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
    const nameMatch = lead.name ? lead.name.toLowerCase().includes(search.toLowerCase()) : false;
    const emailMatch = lead.email ? lead.email.toLowerCase().includes(search.toLowerCase()) : false;
    const phoneMatch = lead.phone ? lead.phone.includes(search) : false;
    const matchesSearch = nameMatch || emailMatch || phoneMatch;

    const matchesTreatment = !treatmentFilter || lead.treatment === treatmentFilter;
    const matchesStatus = !statusFilter || (lead.status && lead.status.toLowerCase() === statusFilter.toLowerCase());
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

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : '';
    let bg = 'rgba(15, 107, 92, 0.08)';
    let color = 'var(--primary)';
    let border = '1px solid rgba(15, 107, 92, 0.15)';
    
    if (s === 'new') {
      bg = 'rgba(63, 167, 150, 0.08)';
      color = '#3FA796';
      border = '1px solid rgba(63, 167, 150, 0.2)';
    } else if (s === 'contacted') {
      bg = 'rgba(58, 134, 200, 0.08)';
      color = '#3A86C8';
      border = '1px solid rgba(58, 134, 200, 0.2)';
    } else if (s === 'booked') {
      bg = 'rgba(155, 89, 182, 0.08)';
      color = '#9B59B6';
      border = '1px solid rgba(155, 89, 182, 0.2)';
    } else if (s === 'converted') {
      bg = 'rgba(245, 166, 35, 0.08)';
      color = '#F5A623';
      border = '1px solid rgba(245, 166, 35, 0.2)';
    } else if (s === 'lost') {
      bg = 'rgba(232, 93, 75, 0.08)';
      color = '#E85D4B';
      border = '1px solid rgba(232, 93, 75, 0.2)';
    }

    return (
      <span style={{
        display: 'inline-block',
        padding: '5px 10px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        backgroundColor: bg,
        color: color,
        border: border
      }}>
        {status}
      </span>
    );
  };

  const totalLeadsCount = filteredLeads.length;
  const newLeadsCount = leads.filter(l => l.status && l.status.toLowerCase() === 'new').length;
  const bookedLeadsCount = leads.filter(l => l.status && l.status.toLowerCase() === 'booked').length;
  const convertedLeadsCount = leads.filter(l => l.status && l.status.toLowerCase() === 'converted').length;

  return (
    <div>
      {/* Mini Summary Metrics Panel */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.015)' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Leads</span>
          <div style={{ fontSize: '24px', fontWeight: '850', color: 'var(--text-dark)', marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            {totalLeadsCount} <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>filtered</span>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.015)' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#3FA796', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Pipeline</span>
          <div style={{ fontSize: '24px', fontWeight: '850', color: '#3FA796', marginTop: '4px' }}>
            {newLeadsCount}
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.015)' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#9B59B6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booked Consults</span>
          <div style={{ fontSize: '24px', fontWeight: '850', color: '#9B59B6', marginTop: '4px' }}>
            {bookedLeadsCount}
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.015)' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#F5A623', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Converted Patients</span>
          <div style={{ fontSize: '24px', fontWeight: '850', color: '#F5A623', marginTop: '4px' }}>
            {convertedLeadsCount}
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '18px 24px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', 
        border: '1px solid var(--border)', 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '28px', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}></i>
          <input 
            type="text" 
            className="form-input" 
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', fontSize: '13.5px' }} 
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="form-select" 
          style={{ width: '200px', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}
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
          style={{ width: '160px', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="booked">Consult Booked</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>

        <select 
          className="form-select" 
          style={{ width: '160px', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="">All Sources</option>
          <option value="Website">Website Form</option>
          <option value="WhatsApp">WhatsApp Click</option>
          <option value="Instagram">Instagram Ad</option>
          <option value="Referral">Doctor Referral</option>
          <option value="Walk-in">Walk-in Visit</option>
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
                  <td style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.email}</td>
                  <td><span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>{lead.treatment}</span></td>
                  <td><span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{lead.source}</span></td>
                  <td>{getStatusBadge(lead.status)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </td>
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

                  {/* Red Delete Lead Record Button */}
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
