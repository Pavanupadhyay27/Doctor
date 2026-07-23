'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Patients({ globalSearch, setGlobalSearch }) {
  const { 
    patients, 
    addPatientVisit, 
    updatePatientFields, 
    addPatientDocument 
  } = useCRM();

  // Search filter
  const [localSearch, setLocalSearch] = useState('');
  const search = globalSearch !== undefined ? globalSearch : localSearch;
  const setSearch = setGlobalSearch !== undefined ? setGlobalSearch : setLocalSearch;

  // Selected Patient Drawer state
  const [activePatientId, setActivePatientId] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview');
  
  // Visit log form
  const [visitType, setVisitType] = useState('Procedure');
  const [visitNotes, setVisitNotes] = useState('');

  const activePatient = patients.find(p => p.id === activePatientId);

  const filteredPatients = patients.filter(pat => {
    const nameMatch = pat.name ? pat.name.toLowerCase().includes(search.toLowerCase()) : false;
    const emailMatch = pat.email ? pat.email.toLowerCase().includes(search.toLowerCase()) : false;
    const phoneMatch = pat.phone ? pat.phone.includes(search) : false;
    return nameMatch || emailMatch || phoneMatch;
  });

  const handleRowClick = (patId) => {
    setActivePatientId(patId);
    setDrawerTab('overview');
    setVisitNotes('');
    setVisitType('Procedure');
  };

  const handleAddVisit = () => {
    if (!visitNotes.trim() || !activePatientId) return;
    addPatientVisit(activePatientId, {
      type: visitType,
      notes: visitNotes,
      doctor: 'Dr. Ananya Sharma'
    });
    setVisitNotes('');
    alert('Clinical visit logged successfully.');
  };

  const handleRealUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activePatientId) return;

    // Enforce 10MB limit (10 * 1024 * 1024 bytes)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 10MB maximum limit.`);
      return;
    }

    const success = await addPatientDocument(activePatientId, file);
    if (success) {
      alert(`"${file.name}" uploaded successfully!`);
    } else {
      alert('Failed to upload file.');
    }
  };

  const handleDownloadDocument = (patientId, docName) => {
    const token = localStorage.getItem('aura_crm_token');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const downloadUrl = `${baseUrl}/patients/${patientId}/documents/${encodeURIComponent(docName)}/download?token=${token}`;
    window.open(downloadUrl, '_blank');
  };

  const getDocIconAndColor = (docName) => {
    const ext = docName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return { icon: 'far fa-file-pdf', color: '#E85D4B' };
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
      case 'svg':
        return { icon: 'far fa-file-image', color: '#FF7A59' };
      case 'doc':
      case 'docx':
        return { icon: 'far fa-file-word', color: '#3A86C8' };
      case 'xls':
      case 'xlsx':
        return { icon: 'far fa-file-excel', color: '#3FA796' };
      case 'zip':
      case 'rar':
      case '7z':
        return { icon: 'far fa-file-archive', color: '#9B5DE5' };
      default:
        return { icon: 'far fa-file-alt', color: '#6B7B79' };
    }
  };

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      
      {/* Top Banner and Search Bar */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}></i>
          <input 
            type="text" 
            className="form-input" 
            style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '12px', fontSize: '13.5px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)' }} 
            placeholder="Search patient names, email, or phone numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '750', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <span>Total Records: <b style={{ color: 'var(--primary)' }}>{patients.length}</b></span>
        </div>
      </div>

      {/* Directory Table */}
      <div className="table-container" style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid var(--border)', boxShadow: '0 4px 15px rgba(0,0,0,0.01)', overflowX: 'auto' }}>
        <table className="admin-table w-full" style={{ borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', backgroundColor: 'rgba(15,107,92,0.01)' }}>
              <th style={{ padding: '16px 20px', fontWeight: '850', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Name</th>
              <th style={{ padding: '16px 20px', fontWeight: '850', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</th>
              <th style={{ padding: '16px 20px', fontWeight: '850', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Clinical Plan</th>
              <th style={{ padding: '16px 20px', fontWeight: '850', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Visit Date</th>
              <th style={{ padding: '16px 20px', fontWeight: '850', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center" style={{ padding: '40px 20px', color: 'var(--text-muted)' }}>No active patient charts found in directory.</td>
              </tr>
            ) : (
              filteredPatients.map(pat => {
                const lastVisitObj = pat.visitHistory && pat.visitHistory[0];
                const lastVisit = lastVisitObj ? lastVisitObj.date : 'None';
                return (
                  <tr 
                    key={pat.id} 
                    onClick={() => handleRowClick(pat.id)} 
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    className="patient-row-hover"
                  >
                    <td style={{ padding: '16px 20px', fontWeight: '750', color: 'var(--text-dark)' }}>{pat.name}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: '600' }}>{pat.phone}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        fontWeight: '750', 
                        color: 'var(--primary)', 
                        backgroundColor: 'rgba(15,107,92,0.06)', 
                        padding: '4px 10px', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}>
                        {pat.treatmentPlan}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontWeight: '600' }}>{lastVisit}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <i className="far fa-folder-open" style={{ marginRight: '4px' }}></i> Chart
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-in Drawer Container */}
      {activePatient && (
        <div 
          className="drawer-backdrop active" 
          onClick={() => setActivePatientId(null)}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            backgroundColor: 'rgba(18, 33, 30, 0.4)',
            backdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'all 0.3s ease'
          }}
        >
          <div 
            className="drawer-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              height: '100%',
              backgroundColor: '#ffffff',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
              boxSizing: 'border-box'
            }}
          >
            {/* Drawer Header Area */}
            <div 
              style={{ 
                padding: '24px 28px', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: 'rgba(15,107,92,0.01)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '12px', 
                  backgroundColor: 'var(--primary)', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: '850', 
                  fontSize: '15px' 
                }}>
                  {getInitials(activePatient.name)}
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Clinical Chart</span>
                  <h3 style={{ fontSize: '17px', fontWeight: '850', color: 'var(--text-dark)', margin: '2px 0 0 0' }}>{activePatient.name}</h3>
                </div>
              </div>
              <button 
                onClick={() => setActivePatientId(null)} 
                className="btn-icon rounded-full"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid var(--border)',
                  backgroundColor: '#ffffff',
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

            {/* Navigation Tab Bar */}
            <div 
              style={{ 
                display: 'flex', 
                padding: '0 20px', 
                borderBottom: '1px solid var(--border)', 
                backgroundColor: '#ffffff' 
              }}
            >
              {[
                { id: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
                { id: 'visits', label: 'Visits History', icon: 'fas fa-notes-medical' },
                { id: 'docs', label: 'Reports & Files', icon: 'fas fa-folder-open' }
              ].map(t => (
                <div 
                  key={t.id}
                  onClick={() => setDrawerTab(t.id)}
                  style={{
                    padding: '14px 18px',
                    fontSize: '12.5px',
                    fontWeight: '750',
                    color: drawerTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    borderBottom: drawerTab === t.id ? '3px solid var(--primary)' : '3px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className={t.icon} style={{ fontSize: '12px', opacity: drawerTab === t.id ? 1 : 0.7 }}></i>
                  {t.label}
                </div>
              ))}
            </div>

            {/* Tab content panel */}
            <div 
              style={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                padding: '28px', 
                backgroundColor: '#F8FAFC' 
              }}
            >
              {drawerTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Styled Info Grid */}
                  <div 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '16px', 
                      border: '1px solid var(--border)', 
                      padding: '20px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Full Name</span>
                      <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-dark)' }}>{activePatient.name}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Phone Number</span>
                      <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-dark)' }}>{activePatient.phone}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Email Address</span>
                      <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--text-dark)' }}>{activePatient.email || 'No email registered'}</span>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="form-group" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px' }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '8px', display: 'block' }}>
                      Medical History (Allergies, Skin Type)
                    </label>
                    <textarea 
                      className="form-textarea" 
                      rows="3"
                      style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '10px 12px', fontSize: '13px', outline: 'none' }}
                      value={activePatient.historyNotes || ''}
                      onChange={(e) => updatePatientFields(activePatient.id, { historyNotes: e.target.value })}
                    ></textarea>
                  </div>

                  {/* Active plan */}
                  <div className="form-group" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px' }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '8px', display: 'block' }}>
                      Active Clinical Treatment Plan
                    </label>
                    <textarea 
                      className="form-textarea" 
                      rows="4"
                      style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '10px 12px', fontSize: '13px', outline: 'none' }}
                      value={activePatient.treatmentPlan || ''}
                      onChange={(e) => updatePatientFields(activePatient.id, { treatmentPlan: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              )}

              {drawerTab === 'visits' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Log Clinical Visit Form */}
                  <div 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '16px', 
                      border: '1px solid var(--border)', 
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    <h4 style={{ fontSize: '13px', fontWeight: '850', color: 'var(--text-dark)', margin: 0 }}>Log Clinical Visit</h4>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-muted)' }}>Visit Type</label>
                      <select 
                        className="form-select" 
                        style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        value={visitType}
                        onChange={(e) => setVisitType(e.target.value)}
                      >
                        <option value="Consultation">Clinical Assessment Consultation</option>
                        <option value="Procedure">Aesthetic Procedure Done</option>
                        <option value="Follow-up">Post-op Healing Check</option>
                      </select>
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '11px', fontWeight: '750', color: 'var(--text-muted)' }}>Visit Details / Dr Notes</label>
                      <textarea 
                        className="form-textarea" 
                        rows="2" 
                        style={{ borderRadius: '8px', border: '1px solid var(--border)', padding: '8px 10px', fontSize: '13px', outline: 'none' }}
                        placeholder="e.g. Completed first session of Laser..."
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <button 
                      onClick={handleAddVisit} 
                      className="btn btn-primary btn-sm" 
                      style={{ alignSelf: 'flex-end', padding: '8px 16px', borderRadius: '8px', fontSize: '12px' }}
                    >
                      Save Visit Log
                    </button>
                  </div>

                  {/* Timeline listing */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Past visits log</h4>
                    {(!activePatient.visitHistory || activePatient.visitHistory.length === 0) ? (
                      <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        No clinical visits logged.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid var(--border)', paddingLeft: '16px', marginLeft: '10px' }}>
                        {(activePatient.visitHistory || []).map((visit, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              padding: '14px', 
                              backgroundColor: '#ffffff', 
                              border: '1px solid var(--border)', 
                              borderRadius: '12px', 
                              position: 'relative',
                              fontSize: '13px'
                            }}
                          >
                            {/* Dot indicator */}
                            <div style={{
                              position: 'absolute',
                              left: '-24px',
                              top: '16px',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              border: '3px solid #F8FAFC'
                            }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '750', marginBottom: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                              <span>{visit.date} · {visit.type}</span>
                              <span style={{ color: 'var(--primary)' }}>{visit.doctor}</span>
                            </div>
                            <div style={{ fontWeight: '500', color: 'var(--text-dark)', lineHeight: '1.4' }}>{visit.notes}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {drawerTab === 'docs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* File Upload Selector */}
                  <input 
                    type="file" 
                    id="patient-report-file-input" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.txt"
                    style={{ display: 'none' }}
                    onChange={handleRealUpload}
                  />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Stored Files</h4>
                    <button 
                      onClick={() => document.getElementById('patient-report-file-input').click()} 
                      className="btn btn-primary btn-sm" 
                      style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '8px' }}
                    >
                      <i className="fas fa-file-upload" style={{ marginRight: '6px' }}></i> Upload Document / Image
                    </button>
                  </div>

                  {(!activePatient.documents || activePatient.documents.length === 0) ? (
                    <div style={{ padding: '36px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <i className="far fa-folder-open" style={{ fontSize: '24px', color: 'var(--border)', display: 'block', marginBottom: '8px' }}></i>
                      No documents uploaded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(activePatient.documents || []).map((doc, idx) => {
                        const fileStyle = getDocIconAndColor(doc.name);
                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '12px 14px', 
                              border: '1px solid var(--border)', 
                              backgroundColor: '#ffffff',
                              borderRadius: '12px', 
                              fontSize: '13.5px' 
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: `${fileStyle.color}12`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <i className={fileStyle.icon} style={{ color: fileStyle.color, fontSize: '16px' }}></i>
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: '750', color: 'var(--text-dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={doc.name}>
                                  {doc.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '500' }}>
                                  {doc.size} · Uploaded: {doc.date}
                                </div>
                              </div>
                            </div>
                            
                            <button 
                              className="btn btn-secondary btn-sm" 
                              style={{ 
                                padding: '8px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border)', 
                                backgroundColor: '#ffffff',
                                cursor: 'pointer',
                                marginLeft: '12px'
                              }} 
                              onClick={() => handleDownloadDocument(activePatient.id, doc.name)}
                              title="Download file"
                            >
                              <i className="fas fa-download" style={{ fontSize: '12px', color: 'var(--text-dark)' }}></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    * Supports PDF, Images (PNG, JPG, WebP), Spreadsheets, Zip Archives, and Word documents under 10MB.
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
