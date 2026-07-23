'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMState';

export default function Patients() {
  const { 
    patients, 
    addPatientVisit, 
    updatePatientFields, 
    addPatientDocument 
  } = useCRM();

  // Search filter
  const [search, setSearch] = useState('');

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

  const handleMockUpload = () => {
    if (!activePatientId) return;
    const docNames = [
      'Visia_Rejuvenation_Scan_v2.pdf',
      'Biopsy_Lab_Results.pdf',
      'Consent_Form_Signature.pdf',
      'Pre_Care_Checklist.pdf'
    ];
    const randomName = docNames[Math.floor(Math.random() * docNames.length)];
    addPatientDocument(activePatientId, randomName);
    alert(`Mock file successfully uploaded: ${randomName}`);
  };

  return (
    <div>
      {/* Search Filter */}
      <div className="table-filter-bar mb-5">
        <input 
          type="text" 
          className="form-input" 
          style={{ width: '280px', padding: '8px 12px' }} 
          placeholder="Search active chart directory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Directory Table */}
      <div className="table-container shadow-sm border border-gray-200 rounded-md overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Phone Number</th>
              <th>Active Clinical Plan</th>
              <th>Last Visit Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-8">No active patient charts found.</td>
              </tr>
            ) : (
              filteredPatients.map(pat => {
                const lastVisitObj = pat.visitHistory && pat.visitHistory[0];
                const lastVisit = lastVisitObj ? lastVisitObj.date : 'None';
                return (
                  <tr key={pat.id} onClick={() => handleRowClick(pat.id)} className="hover:bg-teal-50/20 cursor-pointer">
                    <td style={{ fontWeight: 600 }}>{pat.name}</td>
                    <td>{pat.phone}</td>
                    <td><span style={{ fontWeight: 500, color: 'var(--primary)' }}>{pat.treatmentPlan}</span></td>
                    <td>{lastVisit}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }}>View Chart</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Patient chart slide-in drawer */}
      {activePatient && (
        <div className="drawer-backdrop active" onClick={() => setActivePatientId(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Patient Clinical Chart</span>
                <h3 className="drawer-title">{activePatient.name}</h3>
              </div>
              <button onClick={() => setActivePatientId(null)} className="btn-icon rounded-full"><i className="fas fa-times"></i></button>
            </div>

            {/* Tab controls */}
            <div className="drawer-tabs">
              <div className={`drawer-tab ${drawerTab === 'overview' ? 'active' : ''}`} onClick={() => setDrawerTab('overview')}>Overview</div>
              <div className={`drawer-tab ${drawerTab === 'visits' ? 'active' : ''}`} onClick={() => setDrawerTab('visits')}>Visits History</div>
              <div className={`drawer-tab ${drawerTab === 'docs' ? 'active' : ''}`} onClick={() => setDrawerTab('docs')}>Reports & PDFs</div>
            </div>

            {/* Tab panes */}
            <div className="drawer-body">
              {drawerTab === 'overview' && (
                <div>
                  <div className="info-grid" style={{ marginBottom: '16px' }}>
                    <div className="info-item">
                      <span className="info-label">Full Name</span>
                      <span className="info-val">{activePatient.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone Number</span>
                      <span className="info-val">{activePatient.phone}</span>
                    </div>
                    <div className="info-item" style={{ gridColumn: 'span 2' }}>
                      <span className="info-label">Email Address</span>
                      <span className="info-val">{activePatient.email}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Medical History (Allergies, Skin Type)</label>
                    <textarea 
                      className="form-textarea" 
                      rows="3"
                      value={activePatient.historyNotes}
                      onChange={(e) => updatePatientFields(activePatient.id, { historyNotes: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Active Clinical Treatment Plan</label>
                    <textarea 
                      className="form-textarea" 
                      rows="4"
                      value={activePatient.treatmentPlan}
                      onChange={(e) => updatePatientFields(activePatient.id, { treatmentPlan: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              )}

              {drawerTab === 'visits' && (
                <div>
                  {/* Visit Logger Form */}
                  <div className="form-group bg-[#FAF9F6] p-4 border border-gray-200 rounded-sm mb-6">
                    <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Log Clinical Visit</h4>
                    <div className="form-group">
                      <label className="form-label">Visit Type</label>
                      <select 
                        className="form-select" 
                        style={{ padding: '8px 12px', fontSize: '13px' }}
                        value={visitType}
                        onChange={(e) => setVisitType(e.target.value)}
                      >
                        <option value="Consultation">Clinical Assessment Consultation</option>
                        <option value="Procedure">Aesthetic Procedure Done</option>
                        <option value="Follow-up">Post-op Healing Check</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Visit Details / Dr Notes</label>
                      <textarea 
                        className="form-textarea" 
                        rows="2" 
                        placeholder="e.g. Completed first session of Laser..."
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                      ></textarea>
                    </div>
                    <button onClick={handleAddVisit} className="btn btn-primary btn-sm mt-3 ml-auto block">Save Visit Log</button>
                  </div>

                  {/* Visit Log listing */}
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Past visits log</h4>
                  {(!activePatient.visitHistory || activePatient.visitHistory.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No visits logged.</p>
                  ) : (
                    (activePatient.visitHistory || []).map((visit, idx) => (
                      <div key={idx} style={{ padding: '12px', backgroundColor: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '10px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <span>{visit.date} · {visit.type}</span>
                          <span>{visit.doctor}</span>
                        </div>
                        <div style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{visit.notes}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {drawerTab === 'docs' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stored Files</h4>
                    <button onClick={handleMockUpload} className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      <i className="fas fa-file-upload"></i> Upload Lab Report
                    </button>
                  </div>

                  {(!activePatient.documents || activePatient.documents.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>No documents uploaded.</p>
                  ) : (
                    (activePatient.documents || []).map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '8px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="far fa-file-pdf" style={{ color: 'var(--danger)', fontSize: '18px' }}></i>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{doc.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doc.size} · Uploaded: {doc.date}</div>
                          </div>
                        </div>
                        <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto', padding: '4px 8px' }} onClick={() => alert(`Downloading ${doc.name} (Simulated)`)}>
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
