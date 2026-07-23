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

                  {/* Red Delete Lead Record Button */}
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
